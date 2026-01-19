import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailService } from '@modules/email/email.service';
import { PayoutRequestStatus, CommissionStatus, EmailType, UserRole } from '@prisma/client';
import { RequestPayoutDto, ProcessPayoutDto, PayoutAction } from '../dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AffiliatePayoutService {
  private readonly logger = new Logger(AffiliatePayoutService.name);
  private readonly MIN_PAYOUT = 50; // Minimum $50 for payout

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Request payout (by affiliate)
   */
  async requestPayout(
    affiliateProfileId: string,
    dto: RequestPayoutDto,
  ): Promise<any> {
    try {
      // Get affiliate profile
      const affiliate = await this.prisma.affiliateProfile.findUnique({
        where: { id: affiliateProfileId },
      });

      if (!affiliate) {
        throw new NotFoundException('Affiliate profile not found');
      }

      if (!affiliate.isApproved || !affiliate.isActive) {
        throw new BadRequestException('Affiliate account is not active');
      }

      // Check minimum payout amount
      if (dto.amount < this.MIN_PAYOUT) {
        throw new BadRequestException(`Minimum payout amount is $${this.MIN_PAYOUT}`);
      }

      // Check available balance (approved earnings)
      const availableBalance = affiliate.approvedEarnings;
      if (new Decimal(dto.amount).gt(availableBalance)) {
        throw new BadRequestException(
          `Insufficient balance. Available: $${availableBalance}, Requested: $${dto.amount}`,
        );
      }

      // Check for pending payout requests
      const pendingPayout = await this.prisma.affiliatePayout.findFirst({
        where: {
          affiliateProfileId,
          status: {
            in: [PayoutRequestStatus.REQUESTED, PayoutRequestStatus.PENDING_REVIEW, PayoutRequestStatus.PROCESSING],
          },
        },
      });

      if (pendingPayout) {
        throw new BadRequestException('You already have a pending payout request');
      }

      // Mask payment details for storage (show only last 4 characters)
      const maskedDetails = this.maskPaymentDetails(dto.paymentDetails);

      // Create payout request
      const payout = await this.prisma.affiliatePayout.create({
        data: {
          affiliateProfileId,
          amount: dto.amount,
          status: PayoutRequestStatus.REQUESTED,
          paymentMethod: dto.paymentMethod,
          paymentDetails: dto.paymentDetails, // Store full details (should be encrypted in production)
          notes: dto.notes,
        },
      });

      this.logger.log(`Payout requested by affiliate ${affiliateProfileId}, amount: $${dto.amount}`);

      // Send notification to admins about new payout request
      try {
        const affiliateUser = await this.prisma.user.findFirst({
          where: { affiliateProfile: { id: affiliateProfileId } },
          select: { name: true, email: true },
        });

        const admins = await this.prisma.user.findMany({
          where: { role: UserRole.ADMIN, isActive: true },
          select: { id: true, email: true, name: true, preferredLanguage: true },
        });

        for (const admin of admins) {
          await this.emailService.sendTemplatedEmail(
            admin.email,
            EmailType.ADMIN_PAYOUT_REQUESTED,
            {
              adminName: admin.name || 'Admin',
              affiliateName: affiliateUser?.name || 'Affiliate',
              payoutAmount: dto.amount,
              paymentMethod: dto.paymentMethod,
              dashboardUrl: '/admin/affiliates/payouts',
            },
            admin.id,
            admin.preferredLanguage,
          );
        }
        this.logger.log(`Admin payout notifications sent to ${admins.length} admins`);
      } catch (emailError) {
        this.logger.error(`Failed to send admin payout notifications: ${emailError.message}`);
      }

      return {
        ...payout,
        paymentDetails: maskedDetails, // Return masked version
      };
    } catch (error) {
      this.logger.error(`Error requesting payout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process payout (by admin)
   */
  async processPayout(
    payoutId: string,
    dto: ProcessPayoutDto,
    adminUserId: string,
  ): Promise<any> {
    try {
      const payout = await this.prisma.affiliatePayout.findUnique({
        where: { id: payoutId },
        include: { affiliateProfile: true },
      });

      if (!payout) {
        throw new NotFoundException('Payout not found');
      }

      const now = new Date();

      switch (dto.action) {
        case PayoutAction.APPROVE:
          return await this.approvePayout(payout, adminUserId, dto.notes);

        case PayoutAction.REJECT:
          if (!dto.rejectionReason) {
            throw new BadRequestException('Rejection reason is required');
          }
          return await this.rejectPayout(payout, adminUserId, dto.rejectionReason);

        case PayoutAction.COMPLETE:
          return await this.completePayout(payout, adminUserId, dto.transactionId, dto.notes);

        default:
          throw new BadRequestException('Invalid action');
      }
    } catch (error) {
      this.logger.error(`Error processing payout: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Approve payout (moves to APPROVED status, ready for processing)
   */
  private async approvePayout(payout: any, adminUserId: string, notes?: string): Promise<any> {
    if (payout.status !== PayoutRequestStatus.REQUESTED) {
      throw new BadRequestException('Only requested payouts can be approved');
    }

    const updated = await this.prisma.affiliatePayout.update({
      where: { id: payout.id },
      data: {
        status: PayoutRequestStatus.APPROVED,
        processedBy: adminUserId,
        processedAt: new Date(),
        notes: notes || payout.notes,
      },
    });

    this.logger.log(`Payout ${payout.id} approved by admin ${adminUserId}`);
    return updated;
  }

  /**
   * Reject payout
   */
  private async rejectPayout(payout: any, adminUserId: string, reason: string): Promise<any> {
    const updated = await this.prisma.affiliatePayout.update({
      where: { id: payout.id },
      data: {
        status: PayoutRequestStatus.REJECTED,
        processedBy: adminUserId,
        processedAt: new Date(),
        rejectionReason: reason,
      },
    });

    this.logger.log(`Payout ${payout.id} rejected by admin ${adminUserId}`);
    return updated;
  }

  /**
   * Complete payout (mark as paid)
   */
  private async completePayout(
    payout: any,
    adminUserId: string,
    transactionId?: string,
    notes?: string,
  ): Promise<any> {
    if (payout.status !== PayoutRequestStatus.APPROVED && payout.status !== PayoutRequestStatus.PROCESSING) {
      throw new BadRequestException('Only approved/processing payouts can be completed');
    }

    // Get all approved commissions for this affiliate up to the payout amount
    const commissions = await this.prisma.affiliateCommission.findMany({
      where: {
        affiliateProfileId: payout.affiliateProfileId,
        status: CommissionStatus.APPROVED,
      },
      orderBy: { approvedAt: 'asc' },
    });

    // Calculate which commissions to include in this payout
    let remainingAmount = new Decimal(payout.amount);
    const commissionIds: string[] = [];

    for (const commission of commissions) {
      if (remainingAmount.lte(0)) break;

      commissionIds.push(commission.id);
      remainingAmount = remainingAmount.sub(commission.commissionAmount);
    }

    // Mark commissions as paid
    await this.prisma.affiliateCommission.updateMany({
      where: {
        id: { in: commissionIds },
      },
      data: {
        status: CommissionStatus.PAID,
        paidAt: new Date(),
      },
    });

    // Update payout status
    const updated = await this.prisma.affiliatePayout.update({
      where: { id: payout.id },
      data: {
        status: PayoutRequestStatus.COMPLETED,
        processedBy: adminUserId,
        processedAt: new Date(),
        transactionId,
        paidAt: new Date(),
        notes: notes || payout.notes,
      },
    });

    // Update affiliate earnings
    await this.updateAffiliateEarningsAfterPayout(payout.affiliateProfileId);

    this.logger.log(`Payout ${payout.id} completed by admin ${adminUserId}, transaction: ${transactionId}`);

    // Send notification to affiliate about completed payout
    try {
      const affiliateUser = await this.prisma.user.findFirst({
        where: { affiliateProfile: { id: payout.affiliateProfileId } },
        select: { id: true, email: true, name: true, preferredLanguage: true },
      });

      if (affiliateUser) {
        await this.emailService.sendTemplatedEmail(
          affiliateUser.email,
          EmailType.AFFILIATE_PAYOUT_PROCESSED,
          {
            affiliateName: affiliateUser.name || 'Affiliate',
            payoutAmount: payout.amount.toNumber(),
            paymentMethod: payout.paymentMethod,
            transactionId: transactionId || 'N/A',
            paidAt: new Date(),
            dashboardUrl: '/affiliate/payouts',
          },
          affiliateUser.id,
          affiliateUser.preferredLanguage,
        );
        this.logger.log(`Payout completion email sent to ${affiliateUser.email}`);
      }
    } catch (emailError) {
      this.logger.error(`Failed to send payout completion email: ${emailError.message}`);
    }

    return updated;
  }

  /**
   * Update affiliate earnings after payout
   */
  private async updateAffiliateEarningsAfterPayout(affiliateProfileId: string): Promise<void> {
    // Recalculate approved and paid earnings
    const [approvedTotal, paidTotal] = await Promise.all([
      this.prisma.affiliateCommission.aggregate({
        where: {
          affiliateProfileId,
          status: CommissionStatus.APPROVED,
        },
        _sum: { commissionAmount: true },
      }),
      this.prisma.affiliateCommission.aggregate({
        where: {
          affiliateProfileId,
          status: CommissionStatus.PAID,
        },
        _sum: { commissionAmount: true },
      }),
    ]);

    await this.prisma.affiliateProfile.update({
      where: { id: affiliateProfileId },
      data: {
        approvedEarnings: approvedTotal._sum.commissionAmount || new Decimal(0),
        paidEarnings: paidTotal._sum.commissionAmount || new Decimal(0),
      },
    });
  }

  /**
   * Get payouts for affiliate
   * PRIVACY: Masks payment details before returning to affiliate
   */
  async getPayoutsForAffiliate(affiliateProfileId: string): Promise<any[]> {
    const payouts = await this.prisma.affiliatePayout.findMany({
      where: { affiliateProfileId },
      orderBy: { requestedAt: 'desc' },
    });

    // PRIVACY: Mask payment details - affiliates should not see full payment info in list view
    return payouts.map((payout) => ({
      ...payout,
      paymentDetails: payout.paymentDetails
        ? this.maskPaymentDetails(payout.paymentDetails)
        : undefined,
    }));
  }

  /**
   * Get all payout requests (for admin)
   */
  async getAllPayouts(status?: PayoutRequestStatus): Promise<any[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return await this.prisma.affiliatePayout.findMany({
      where,
      include: {
        affiliateProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Mask payment details (show only last 4 characters)
   */
  private maskPaymentDetails(details: string): string {
    if (details.length <= 4) return details;
    const lastFour = details.slice(-4);
    return `****${lastFour}`;
  }

  /**
   * Get minimum payout amount
   */
  getMinimumPayout(): number {
    return this.MIN_PAYOUT;
  }
}
