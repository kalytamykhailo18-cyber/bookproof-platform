import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailService } from '@modules/email/email.service';
import { CommissionStatus, EmailType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CommissionService {
  private readonly logger = new Logger(CommissionService.name);
  private readonly PENDING_DAYS = 30; // Commission holds for 30 days to account for refunds (per requirements)

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create commission for a credit purchase
   * Called after successful credit purchase by referred author
   */
  async createCommission(
    creditPurchaseId: string,
    referredAuthorId: string,
  ): Promise<void> {
    try {
      // Check if this author was referred by an affiliate
      const referral = await this.prisma.affiliateReferral.findFirst({
        where: { referredAuthorId },
        include: { affiliateProfile: true },
      });

      if (!referral) {
        this.logger.debug(`No affiliate referral found for author ${referredAuthorId}`);
        return;
      }

      if (!referral.affiliateProfile.isApproved || !referral.affiliateProfile.isActive) {
        this.logger.warn(`Affiliate inactive for referral ${referral.id}`);
        return;
      }

      // Get purchase details
      const purchase = await this.prisma.creditPurchase.findUnique({
        where: { id: creditPurchaseId },
      });

      if (!purchase || purchase.paymentStatus !== 'COMPLETED') {
        this.logger.warn(`Invalid or incomplete purchase ${creditPurchaseId}`);
        return;
      }

      // Check if commission already exists for this purchase
      const existingCommission = await this.prisma.affiliateCommission.findFirst({
        where: { creditPurchaseId },
      });

      if (existingCommission) {
        this.logger.warn(`Commission already exists for purchase ${creditPurchaseId}`);
        return;
      }

      // Calculate commission
      const purchaseAmount = purchase.amountPaid;
      const commissionRate = referral.affiliateProfile.commissionRate;
      const commissionAmount = purchaseAmount.mul(commissionRate).div(100);

      // Calculate pending until date
      const pendingUntil = new Date();
      pendingUntil.setDate(pendingUntil.getDate() + this.PENDING_DAYS);

      // Create commission record
      await this.prisma.affiliateCommission.create({
        data: {
          affiliateProfileId: referral.affiliateProfileId,
          creditPurchaseId,
          referredAuthorId,
          purchaseAmount,
          commissionAmount,
          commissionRate,
          status: CommissionStatus.PENDING,
          pendingUntil,
        },
      });

      // Update affiliate earnings
      await this.updateAffiliateEarnings(referral.affiliateProfileId);

      // Update referral first purchase date if this is their first purchase
      if (!referral.firstPurchaseAt) {
        await this.prisma.affiliateReferral.update({
          where: { id: referral.id },
          data: { firstPurchaseAt: new Date() },
        });
      }

      this.logger.log(
        `Commission created for affiliate ${referral.affiliateProfileId}, amount: ${commissionAmount}`,
      );

      // Send new referral email to affiliate
      try {
        const affiliateUser = await this.prisma.user.findUnique({
          where: { id: referral.affiliateProfile.userId },
          select: { id: true, email: true, name: true, preferredLanguage: true },
        });

        const referredAuthor = await this.prisma.authorProfile.findUnique({
          where: { id: referredAuthorId },
          include: { user: { select: { name: true } } },
        });

        if (affiliateUser) {
          await this.emailService.sendTemplatedEmail(
            affiliateUser.email,
            EmailType.AFFILIATE_NEW_REFERRAL,
            {
              affiliateName: affiliateUser.name || 'Affiliate',
              referralName: referredAuthor?.user?.name || 'An author',
              commissionAmount: commissionAmount.toNumber(),
              amount: purchaseAmount.toNumber(),
              dashboardUrl: '/affiliate/dashboard',
            },
            affiliateUser.id,
            affiliateUser.preferredLanguage,
          );
          this.logger.log(`New referral email sent to affiliate ${affiliateUser.email}`);
        }
      } catch (emailError) {
        this.logger.error(`Failed to send new referral email: ${emailError.message}`);
      }
    } catch (error) {
      this.logger.error(`Error creating commission: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Approve pending commissions that are past the refund window
   * Run this as a scheduled job (e.g., daily)
   */
  async approvePendingCommissions(): Promise<{ approvedCount: number; totalAmount: number }> {
    try {
      const now = new Date();

      // Find all pending commissions past their pending period
      const pendingCommissions = await this.prisma.affiliateCommission.findMany({
        where: {
          status: CommissionStatus.PENDING,
          pendingUntil: {
            lte: now,
          },
        },
      });

      if (pendingCommissions.length === 0) {
        return { approvedCount: 0, totalAmount: 0 };
      }

      // Calculate total amount
      const totalAmount = pendingCommissions.reduce(
        (sum, c) => sum + c.commissionAmount.toNumber(),
        0,
      );

      // Approve all eligible commissions
      const updated = await this.prisma.affiliateCommission.updateMany({
        where: {
          id: {
            in: pendingCommissions.map((c) => c.id),
          },
        },
        data: {
          status: CommissionStatus.APPROVED,
          approvedAt: now,
        },
      });

      // Update affiliate earnings for each affected affiliate
      const affiliateIds = [...new Set(pendingCommissions.map((c) => c.affiliateProfileId))];
      await Promise.all(affiliateIds.map((id) => this.updateAffiliateEarnings(id)));

      this.logger.log(`Approved ${updated.count} pending commissions totaling $${totalAmount.toFixed(2)}`);
      return { approvedCount: updated.count, totalAmount };
    } catch (error) {
      this.logger.error(`Error approving pending commissions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark commissions as paid (when payout is processed)
   */
  async markCommissionsAsPaid(
    affiliateProfileId: string,
    commissionIds: string[],
  ): Promise<void> {
    try {
      const now = new Date();

      await this.prisma.affiliateCommission.updateMany({
        where: {
          id: { in: commissionIds },
          affiliateProfileId,
          status: CommissionStatus.APPROVED,
        },
        data: {
          status: CommissionStatus.PAID,
          paidAt: now,
        },
      });

      // Update affiliate earnings
      await this.updateAffiliateEarnings(affiliateProfileId);

      this.logger.log(`Marked ${commissionIds.length} commissions as paid for affiliate ${affiliateProfileId}`);
    } catch (error) {
      this.logger.error(`Error marking commissions as paid: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancel commission (e.g., if purchase was refunded)
   */
  async cancelCommission(
    creditPurchaseId: string,
    reason: string,
  ): Promise<void> {
    try {
      const commission = await this.prisma.affiliateCommission.findFirst({
        where: { creditPurchaseId },
      });

      if (!commission) {
        this.logger.warn(`No commission found for purchase ${creditPurchaseId}`);
        return;
      }

      if (commission.status === CommissionStatus.PAID) {
        this.logger.error(`Cannot cancel paid commission ${commission.id}`);
        throw new Error('Cannot cancel paid commission');
      }

      await this.prisma.affiliateCommission.update({
        where: { id: commission.id },
        data: {
          status: CommissionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      // Update affiliate earnings
      await this.updateAffiliateEarnings(commission.affiliateProfileId);

      this.logger.log(`Cancelled commission ${commission.id}, reason: ${reason}`);
    } catch (error) {
      this.logger.error(`Error cancelling commission: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update affiliate earnings totals
   */
  async updateAffiliateEarnings(affiliateProfileId: string): Promise<void> {
    try {
      // Calculate totals for each status
      const [totalEarnings, pendingEarnings, approvedEarnings, paidEarnings] = await Promise.all([
        this.calculateTotalEarnings(affiliateProfileId, null),
        this.calculateTotalEarnings(affiliateProfileId, CommissionStatus.PENDING),
        this.calculateTotalEarnings(affiliateProfileId, CommissionStatus.APPROVED),
        this.calculateTotalEarnings(affiliateProfileId, CommissionStatus.PAID),
      ]);

      // Update affiliate profile
      await this.prisma.affiliateProfile.update({
        where: { id: affiliateProfileId },
        data: {
          totalEarnings,
          pendingEarnings,
          approvedEarnings,
          paidEarnings,
        },
      });

      this.logger.debug(`Updated earnings for affiliate ${affiliateProfileId}`);
    } catch (error) {
      this.logger.error(`Error updating affiliate earnings: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate total earnings for a specific status
   */
  private async calculateTotalEarnings(
    affiliateProfileId: string,
    status: CommissionStatus | null,
  ): Promise<Decimal> {
    const where: any = {
      affiliateProfileId,
    };

    if (status !== null) {
      where.status = status;
    } else {
      // For total earnings, exclude cancelled commissions
      where.status = { not: CommissionStatus.CANCELLED };
    }

    const result = await this.prisma.affiliateCommission.aggregate({
      where,
      _sum: {
        commissionAmount: true,
      },
    });

    return result._sum.commissionAmount || new Decimal(0);
  }

  /**
   * Get commissions for affiliate
   */
  async getCommissionsForAffiliate(
    affiliateProfileId: string,
    status?: CommissionStatus,
  ): Promise<any[]> {
    try {
      const where: any = { affiliateProfileId };
      if (status) {
        where.status = status;
      }

      return await this.prisma.affiliateCommission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Error getting commissions: ${error.message}`, error.stack);
      throw error;
    }
  }
}
