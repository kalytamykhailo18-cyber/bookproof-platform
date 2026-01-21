import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { DataExportResponseDto, DeleteAccountDto, DeleteAccountResponseDto, UpdateConsentDto, ConsentResponseDto, ConsentType } from './dto/gdpr.dto';
import { UserRole } from '@prisma/client';

/**
 * Users Service
 *
 * Handles GDPR compliance features:
 * - Data export (requirements.md Section 15.3)
 * - Data deletion (requirements.md Section 15.3)
 * - Consent management
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  // Grace period before permanent deletion (GDPR requirement)
  private readonly DELETION_GRACE_PERIOD_DAYS = 30;

  // Confirmation phrase required for account deletion
  private readonly DELETION_CONFIRMATION_PHRASE = 'DELETE MY ACCOUNT';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export all user data for GDPR compliance
   *
   * Per requirements.md Section 15.3:
   * - GDPR compliance for EU users
   * - Data export on request
   *
   * @param userId - ID of the user requesting export
   * @returns Complete data package
   */
  async exportUserData(userId: string): Promise<DataExportResponseDto> {
    this.logger.log(`Data export requested by user: ${userId}`);

    // Fetch user with all related data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authorProfile: {
          include: {
            books: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            creditTransactions: {
              select: {
                id: true,
                type: true,
                amount: true,
                createdAt: true,
                description: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        readerProfile: {
          include: {
            assignments: {
              select: {
                id: true,
                book: {
                  select: {
                    title: true,
                  },
                },
                status: true,
                materialsReleasedAt: true,
                review: {
                  select: {
                    submittedAt: true,
                  },
                },
              },
              orderBy: { materialsReleasedAt: 'desc' },
            },
            amazonProfiles: {
              select: {
                profileUrl: true,
                isVerified: true,
              },
            },
          },
        },
        affiliateProfile: {
          include: {
            commissions: {
              select: {
                commissionAmount: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        auditLogs: {
          select: {
            action: true,
            createdAt: true,
            ipAddress: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100, // Last 100 actions
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Build personal info
    const personalInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName || undefined,
      phone: user.phone || undefined,
      country: user.country || undefined,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency || undefined,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt || undefined,
    };

    // Build author profile data if applicable
    const authorProfile = user.authorProfile
      ? {
          totalCreditsPurchased: user.authorProfile.totalCreditsPurchased,
          totalCreditsUsed: user.authorProfile.totalCreditsUsed,
          availableCredits: user.authorProfile.availableCredits,
          campaigns: user.authorProfile.books.map((b: any) => ({
            id: b.id,
            bookTitle: b.title,
            status: b.status,
            createdAt: b.createdAt,
          })),
          transactions: user.authorProfile.creditTransactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            date: t.createdAt,
            description: t.description || '',
          })),
        }
      : undefined;

    // Build reader profile data if applicable
    const readerProfile = user.readerProfile
      ? {
          contentPreference: user.readerProfile.contentPreference,
          completedReviews: user.readerProfile.reviewsCompleted,
          walletBalance: parseFloat(user.readerProfile.walletBalance.toString()),
          assignments: user.readerProfile.assignments.map((a: any) => ({
            id: a.id,
            bookTitle: a.book.title,
            status: a.status,
            accessGrantedAt: a.materialsReleasedAt || undefined,
            submittedAt: a.review?.submittedAt || undefined,
          })),
          amazonProfiles: user.readerProfile.amazonProfiles.map((ap: any) => ({
            profileUrl: ap.profileUrl,
            isVerified: ap.isVerified,
          })),
        }
      : undefined;

    // Build affiliate profile data if applicable
    const affiliateProfile = user.affiliateProfile
      ? {
          referralCode: user.affiliateProfile.referralCode,
          totalClicks: user.affiliateProfile.totalClicks,
          totalConversions: user.affiliateProfile.totalConversions,
          totalCommissionEarned: parseFloat(user.affiliateProfile.totalEarnings.toString()),
          commissions: user.affiliateProfile.commissions.map((c: any) => ({
            amount: parseFloat(c.commissionAmount.toString()),
            status: c.status,
            date: c.createdAt,
          })),
        }
      : undefined;

    // Build consent records
    const consents = [
      {
        type: 'terms',
        accepted: user.authorProfile?.termsAccepted ?? true,
        acceptedAt: user.authorProfile?.termsAcceptedAt || undefined,
        withdrawnAt: undefined,
      },
      {
        type: 'marketing',
        accepted: user.marketingConsent,
        acceptedAt: user.createdAt, // Assume consent given at registration
        withdrawnAt: undefined,
      },
    ];

    // Build activity log
    const activityLog = user.auditLogs.map((log: any) => ({
      action: log.action,
      timestamp: log.createdAt,
      ipAddress: log.ipAddress || undefined,
    }));

    // Build export metadata
    const exportMetadata = {
      generatedAt: new Date(),
      format: 'JSON',
      version: '1.0',
    };

    this.logger.log(`Data export completed for user: ${userId}`);

    return {
      personalInfo,
      authorProfile,
      readerProfile,
      affiliateProfile,
      consents,
      activityLog,
      exportMetadata,
    };
  }

  /**
   * Request account deletion with grace period
   *
   * Per requirements.md Section 15.3:
   * - GDPR compliance for EU users
   * - Data deletion on request
   *
   * @param userId - ID of the user requesting deletion
   * @param dto - Deletion request details
   * @returns Deletion confirmation with scheduled date
   */
  async requestAccountDeletion(userId: string, dto: DeleteAccountDto): Promise<DeleteAccountResponseDto> {
    this.logger.log(`Account deletion requested by user: ${userId}`);

    // Validate confirmation phrase
    if (dto.confirmationPhrase.trim() !== this.DELETION_CONFIRMATION_PHRASE) {
      throw new BadRequestException(
        `Invalid confirmation phrase. Please type exactly: "${this.DELETION_CONFIRMATION_PHRASE}"`,
      );
    }

    // Fetch user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate scheduled deletion date (30-day grace period)
    const scheduledDeletionDate = new Date();
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + this.DELETION_GRACE_PERIOD_DAYS);

    // Mark account for deletion (soft delete)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletionScheduledAt: scheduledDeletionDate,
        deletionReason: dto.reason || 'User requested account deletion',
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_REQUESTED',
        entity: 'User',
        entityId: userId,
        changes: JSON.stringify({
          scheduledDeletionDate: scheduledDeletionDate.toISOString(),
          reason: dto.reason || 'Not provided',
          gracePeriodDays: this.DELETION_GRACE_PERIOD_DAYS,
        }),
        description: `User requested account deletion. Scheduled for ${scheduledDeletionDate.toISOString()}`,
        severity: 'WARNING',
      },
    });

    this.logger.log(`Account deletion scheduled for user ${userId} on ${scheduledDeletionDate.toISOString()}`);

    return {
      message: `Your account has been scheduled for deletion. You have ${this.DELETION_GRACE_PERIOD_DAYS} days to cancel this request by logging in. Your account will be permanently deleted on ${scheduledDeletionDate.toLocaleDateString()}.`,
      scheduledDeletionDate,
      gracePeriodDays: this.DELETION_GRACE_PERIOD_DAYS,
    };
  }

  /**
   * Cancel pending account deletion (within grace period)
   *
   * @param userId - ID of the user cancelling deletion
   * @returns Cancellation confirmation
   */
  async cancelAccountDeletion(userId: string): Promise<{ message: string }> {
    this.logger.log(`Account deletion cancellation requested by user: ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletionScheduledAt) {
      throw new BadRequestException('No pending account deletion found');
    }

    // Reactivate account and clear deletion schedule
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        deletionScheduledAt: null,
        deletionReason: null,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETION_CANCELLED',
        entity: 'User',
        entityId: userId,
        changes: JSON.stringify({
          cancelledAt: new Date().toISOString(),
        }),
        description: 'User cancelled pending account deletion',
        severity: 'INFO',
      },
    });

    this.logger.log(`Account deletion cancelled for user: ${userId}`);

    return {
      message: 'Your account deletion has been cancelled. Your account is now active again.',
    };
  }

  /**
   * Update user consent for GDPR compliance
   *
   * @param userId - ID of the user
   * @param dto - Consent update details
   * @returns Updated consent status
   */
  async updateConsent(userId: string, dto: UpdateConsentDto): Promise<ConsentResponseDto> {
    this.logger.log(`Consent update requested by user ${userId}: ${dto.consentType} = ${dto.granted}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update consent based on type
    if (dto.consentType === ConsentType.MARKETING) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          marketingConsent: dto.granted,
        },
      });
    }

    // Create audit log for consent change
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: dto.granted ? 'CONSENT_GRANTED' : 'CONSENT_WITHDRAWN',
        entity: 'User',
        entityId: userId,
        changes: JSON.stringify({
          consentType: dto.consentType,
          granted: dto.granted,
          timestamp: new Date().toISOString(),
        }),
        description: `User ${dto.granted ? 'granted' : 'withdrew'} ${dto.consentType} consent`,
        severity: 'INFO',
      },
    });

    this.logger.log(`Consent updated for user ${userId}: ${dto.consentType} = ${dto.granted}`);

    return {
      consentType: dto.consentType,
      granted: dto.granted,
      updatedAt: new Date(),
      grantedAt: dto.granted ? new Date() : undefined,
      withdrawnAt: !dto.granted ? new Date() : undefined,
    };
  }

  /**
   * Get all consents for a user
   *
   * @param userId - ID of the user
   * @returns List of all consents
   */
  async getUserConsents(userId: string): Promise<ConsentResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return [
      {
        consentType: ConsentType.MARKETING,
        granted: user.marketingConsent,
        updatedAt: user.updatedAt,
        grantedAt: user.marketingConsent ? user.createdAt : undefined,
        withdrawnAt: !user.marketingConsent ? user.updatedAt : undefined,
      },
    ];
  }
}
