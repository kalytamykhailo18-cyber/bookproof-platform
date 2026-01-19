import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EncryptionUtil } from '@common/utils/encryption.util';
import { EmailService } from '@modules/email/email.service';
import { PayoutRequestStatus, Prisma, EmailType, UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  RequestPayoutDto,
  PayoutResponseDto,
  WalletTransactionResponseDto,
  WalletSummaryResponseDto,
} from '../dto/payout.dto';

@Injectable()
export class WalletPayoutService {
  private readonly logger = new Logger(WalletPayoutService.name);
  private readonly encryptionKey: string;
  private readonly minPayoutAmount = 50;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.encryptionKey =
      this.configService.get<string>('ENCRYPTION_KEY') || '';
    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      this.logger.error('ENCRYPTION_KEY not configured or too short. Must be at least 32 characters.');
    }
  }

  /**
   * Request a payout from wallet
   *
   * CRITICAL: Uses database transaction to prevent race conditions
   * - Validates balance within transaction
   * - Atomically decrements balance and creates payout request
   * - Prevents double-spending if concurrent requests are made
   */
  async requestPayout(
    readerProfileId: string,
    dto: RequestPayoutDto,
  ): Promise<PayoutResponseDto> {
    this.logger.log(`Payout request from reader: ${readerProfileId}, amount: $${dto.amount}`);

    // 1. Validate minimum amount (can be done outside transaction)
    if (dto.amount < this.minPayoutAmount) {
      throw new BadRequestException(
        `Minimum payout amount is $${this.minPayoutAmount}`,
      );
    }

    // 2. Encrypt payment details (can be done outside transaction)
    const encryptedDetails = this.encryptPaymentDetails(dto.paymentDetails);

    // 3. Use transaction for atomicity - prevents race conditions
    const payoutRequest = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get reader profile with wallet balance (within transaction for consistency)
      const readerProfile = await tx.readerProfile.findUnique({
        where: { id: readerProfileId },
      });

      if (!readerProfile) {
        throw new NotFoundException('Reader profile not found');
      }

      // Validate amount <= available balance (within transaction)
      const availableBalance = readerProfile.walletBalance.toNumber();
      if (dto.amount > availableBalance) {
        throw new BadRequestException(
          `Insufficient balance. Available: $${availableBalance}, Requested: $${dto.amount}`,
        );
      }

      // Check for pending payout requests to prevent concurrent requests
      const pendingPayout = await tx.payoutRequest.findFirst({
        where: {
          readerProfileId,
          status: {
            in: [
              PayoutRequestStatus.REQUESTED,
              PayoutRequestStatus.PENDING_REVIEW,
              PayoutRequestStatus.APPROVED,
              PayoutRequestStatus.PROCESSING,
            ],
          },
        },
      });

      if (pendingPayout) {
        throw new BadRequestException(
          'You already have a pending payout request. Please wait for it to be processed.',
        );
      }

      // Create PayoutRequest with status REQUESTED
      const payout = await tx.payoutRequest.create({
        data: {
          readerProfileId,
          amount: new Decimal(dto.amount),
          status: PayoutRequestStatus.REQUESTED,
          paymentMethod: dto.paymentMethod,
          paymentDetails: encryptedDetails,
          notes: dto.notes,
        },
      });

      // Create WalletTransaction (pending payout)
      const balanceBefore = availableBalance;
      const balanceAfter = balanceBefore - dto.amount;

      await tx.walletTransaction.create({
        data: {
          readerProfileId,
          amount: new Decimal(-dto.amount),
          type: 'PAYOUT',
          balanceBefore: new Decimal(balanceBefore),
          balanceAfter: new Decimal(balanceAfter),
          description: `Payout request of $${dto.amount} via ${dto.paymentMethod} - Request ID: ${payout.id}`,
          performedBy: null,
          notes: `Payout request ID: ${payout.id}`,
        },
      });

      // Update wallet balance using atomic decrement
      await tx.readerProfile.update({
        where: { id: readerProfileId },
        data: {
          walletBalance: { decrement: dto.amount },
          totalWithdrawn: { increment: dto.amount },
        },
      });

      return payout;
    });

    this.logger.log(`Payout request created: ${payoutRequest.id}`);

    // Send notification to all admins about new payout request
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, isActive: true },
        select: { id: true, email: true, name: true, preferredLanguage: true },
      });

      // Get reader info for the notification
      const readerProfile = await this.prisma.readerProfile.findUnique({
        where: { id: readerProfileId },
        include: { user: { select: { name: true, email: true } } },
      });

      for (const admin of admins) {
        await this.emailService.sendTemplatedEmail(
          admin.email,
          EmailType.ADMIN_PAYOUT_REQUESTED,
          {
            adminName: admin.name || 'Admin',
            readerName: readerProfile?.user?.name || 'Reader',
            payoutAmount: dto.amount,
            paymentMethod: dto.paymentMethod,
            dashboardUrl: '/admin/payouts',
          },
          admin.id,
          admin.preferredLanguage,
        );
      }
      this.logger.log(`Admin payout notifications sent to ${admins.length} admins`);
    } catch (emailError) {
      this.logger.error(`Failed to send admin payout notifications: ${emailError.message}`);
    }

    return this.mapToResponse(payoutRequest, false);
  }

  async approvePayout(
    payoutId: string,
    adminUserId: string,
    notes?: string,
  ): Promise<PayoutResponseDto> {
    this.logger.log(`Approving payout: ${payoutId} by admin: ${adminUserId}`);

    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    if (payout.status !== PayoutRequestStatus.REQUESTED) {
      throw new BadRequestException(
        `Payout must be in REQUESTED status to approve. Current status: ${payout.status}`,
      );
    }

    const updatedPayout = await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutRequestStatus.APPROVED,
        processedBy: adminUserId,
        processedAt: new Date(),
        notes: notes || payout.notes,
      },
    });

    this.logger.log(`Payout approved: ${payoutId}`);

    return this.mapToResponse(updatedPayout, true);
  }

  /**
   * Reject a payout request (admin action)
   *
   * CRITICAL: Uses database transaction to ensure atomicity
   * - Reverses the balance deduction
   * - Creates reversal transaction
   * - Updates payout status
   */
  async rejectPayout(
    payoutId: string,
    adminUserId: string,
    reason: string,
  ): Promise<PayoutResponseDto> {
    this.logger.log(`Rejecting payout: ${payoutId} by admin: ${adminUserId}`);

    // Use transaction for atomicity
    const updatedPayout = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payout = await tx.payoutRequest.findUnique({
        where: { id: payoutId },
      });

      if (!payout) {
        throw new NotFoundException('Payout request not found');
      }

      if (payout.status !== PayoutRequestStatus.REQUESTED) {
        throw new BadRequestException(
          `Payout must be in REQUESTED status to reject. Current status: ${payout.status}`,
        );
      }

      // Get reader profile to reverse the balance
      const readerProfile = await tx.readerProfile.findUnique({
        where: { id: payout.readerProfileId },
      });

      if (readerProfile) {
        const amountToRestore = payout.amount.toNumber();
        const balanceBefore = readerProfile.walletBalance.toNumber();
        const balanceAfter = balanceBefore + amountToRestore;

        // Create reversal transaction
        await tx.walletTransaction.create({
          data: {
            readerProfileId: payout.readerProfileId,
            amount: new Decimal(amountToRestore),
            type: 'REVERSAL',
            balanceBefore: new Decimal(balanceBefore),
            balanceAfter: new Decimal(balanceAfter),
            description: `Payout request rejected: ${reason}. Request ID: ${payoutId}`,
            performedBy: adminUserId,
            notes: `Rejection reason: ${reason}`,
          },
        });

        // Restore wallet balance using atomic increment
        await tx.readerProfile.update({
          where: { id: payout.readerProfileId },
          data: {
            walletBalance: { increment: amountToRestore },
            totalWithdrawn: { decrement: amountToRestore },
          },
        });
      }

      // Update payout status to REJECTED
      return await tx.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: PayoutRequestStatus.REJECTED,
          processedBy: adminUserId,
          processedAt: new Date(),
          rejectionReason: reason,
        },
      });
    });

    this.logger.log(`Payout rejected: ${payoutId}`);

    return this.mapToResponse(updatedPayout, true);
  }

  /**
   * Complete a payout (admin action)
   * Per requirements step 6-9:
   * 6. Admin marks payout as completed in system
   * 7. Reader's wallet balance reduced by payout amount (already done on request)
   * 8. Transaction recorded in reader's history (already done on request)
   * 9. Reader receives confirmation email
   */
  async completePayout(
    payoutId: string,
    adminUserId: string,
    transactionId: string,
    notes?: string,
  ): Promise<PayoutResponseDto> {
    this.logger.log(`Completing payout: ${payoutId} by admin: ${adminUserId}`);

    // Get payout with reader profile and user info for email
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: {
        readerProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                preferredLanguage: true,
              },
            },
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    if (payout.status !== PayoutRequestStatus.APPROVED) {
      throw new BadRequestException(
        `Payout must be APPROVED to complete. Current status: ${payout.status}`,
      );
    }

    const paidAt = new Date();

    const updatedPayout = await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: PayoutRequestStatus.COMPLETED,
        transactionId,
        paidAt,
        notes: notes || payout.notes,
      },
    });

    this.logger.log(`Payout completed: ${payoutId}, transaction: ${transactionId}`);

    // Step 9: Send confirmation email to reader
    try {
      await this.emailService.sendPayoutCompletedEmail({
        to: payout.readerProfile.user.email,
        readerName: payout.readerProfile.user.name || 'Reader',
        amount: payout.amount.toNumber(),
        paymentMethod: payout.paymentMethod,
        transactionId,
        paidAt,
        userId: payout.readerProfile.user.id,
        language: payout.readerProfile.user.preferredLanguage || undefined,
      });
      this.logger.log(`Payout confirmation email sent to ${payout.readerProfile.user.email}`);
    } catch (emailError) {
      // Log error but don't fail the payout completion
      this.logger.error(`Failed to send payout confirmation email: ${emailError.message}`);
    }

    return this.mapToResponse(updatedPayout, true);
  }

  async getReaderPayouts(readerProfileId: string): Promise<PayoutResponseDto[]> {
    const payouts = await this.prisma.payoutRequest.findMany({
      where: { readerProfileId },
      orderBy: { requestedAt: 'desc' },
    });

    return payouts.map((payout) => this.mapToResponse(payout, false));
  }

  async getPendingPayouts(): Promise<PayoutResponseDto[]> {
    const payouts = await this.prisma.payoutRequest.findMany({
      where: {
        status: {
          in: [PayoutRequestStatus.REQUESTED, PayoutRequestStatus.APPROVED],
        },
      },
      orderBy: { requestedAt: 'asc' },
    });

    return payouts.map((payout) => this.mapToResponse(payout, true));
  }

  async getAllPayouts(): Promise<PayoutResponseDto[]> {
    const payouts = await this.prisma.payoutRequest.findMany({
      orderBy: { requestedAt: 'desc' },
    });

    return payouts.map((payout) => this.mapToResponse(payout, true));
  }

  /**
   * Get wallet transactions for a reader
   */
  async getWalletTransactions(
    readerProfileId: string,
  ): Promise<WalletTransactionResponseDto[]> {
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { readerProfileId },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((tx) => ({
      id: tx.id,
      readerProfileId: tx.readerProfileId,
      reviewId: tx.reviewId || undefined,
      amount: tx.amount.toNumber(),
      type: tx.type,
      description: tx.description,
      balanceBefore: tx.balanceBefore.toNumber(),
      balanceAfter: tx.balanceAfter.toNumber(),
      performedBy: tx.performedBy || undefined,
      notes: tx.notes || undefined,
      createdAt: tx.createdAt,
    }));
  }

  /**
   * Get wallet summary with transactions for a reader
   */
  async getWalletSummary(
    readerProfileId: string,
  ): Promise<WalletSummaryResponseDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    // Get pending payout amount
    const pendingPayouts = await this.prisma.payoutRequest.aggregate({
      where: {
        readerProfileId,
        status: {
          in: [
            PayoutRequestStatus.REQUESTED,
            PayoutRequestStatus.PENDING_REVIEW,
            PayoutRequestStatus.APPROVED,
            PayoutRequestStatus.PROCESSING,
          ],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const transactions = await this.getWalletTransactions(readerProfileId);

    return {
      walletBalance: readerProfile.walletBalance.toNumber(),
      totalEarned: readerProfile.totalEarned.toNumber(),
      totalWithdrawn: readerProfile.totalWithdrawn.toNumber(),
      pendingPayouts: pendingPayouts._sum.amount?.toNumber() || 0,
      transactions,
    };
  }

  private encryptPaymentDetails(details: any): string {
    try {
      const jsonString = JSON.stringify(details);
      return EncryptionUtil.encrypt(jsonString, this.encryptionKey);
    } catch (error) {
      this.logger.error('Failed to encrypt payment details', error);
      throw new BadRequestException('Failed to encrypt payment details');
    }
  }

  private decryptPaymentDetails(encrypted: string): any {
    try {
      const decrypted = EncryptionUtil.decrypt(encrypted, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('Failed to decrypt payment details', error);
      return null;
    }
  }

  private mapToResponse(
    payout: any,
    includePaymentDetails: boolean,
  ): PayoutResponseDto {
    return {
      id: payout.id,
      readerProfileId: payout.readerProfileId,
      amount: payout.amount.toNumber(),
      status: payout.status,
      paymentMethod: payout.paymentMethod,
      paymentDetails: includePaymentDetails && payout.paymentDetails
        ? this.decryptPaymentDetails(payout.paymentDetails)
        : undefined,
      processedBy: payout.processedBy,
      processedAt: payout.processedAt,
      rejectionReason: payout.rejectionReason,
      notes: payout.notes,
      transactionId: payout.transactionId,
      paidAt: payout.paidAt,
      requestedAt: payout.requestedAt,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  }
}
