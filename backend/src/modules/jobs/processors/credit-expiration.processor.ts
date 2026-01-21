import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailService } from '@modules/email/email.service';

/**
 * Daily Credit Expiration Checker Job
 *
 * Runs daily at midnight
 * Checks for expired credit purchases (activation window passed)
 * Deducts expired credits from author's available balance
 * Sends notification emails to authors about expired credits
 * Also sends warning emails 7 days before expiration
 */
@Injectable()
export class CreditExpirationProcessor {
  private readonly logger = new Logger(CreditExpirationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Main scheduler - runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'credit-expiration-checker',
    timeZone: 'UTC',
  })
  async handleCreditExpirationCheck() {
    this.logger.log('Starting daily credit expiration check...');

    try {
      const now = new Date();

      // Process expired credits
      await this.processExpiredCredits(now);

      // Send warning emails for credits expiring in 7 days
      await this.sendExpirationWarnings(now);

      this.logger.log('Credit expiration check completed successfully');
    } catch (error) {
      this.logger.error('Credit expiration check failed:', error);
      throw error;
    }
  }

  /**
   * Process expired credit purchases
   * - Find non-activated purchases past their activation window
   * - Deduct credits from author's available balance
   * - Mark purchases as expired
   * - Send notification email
   */
  private async processExpiredCredits(now: Date) {
    // Find all credit purchases that:
    // 1. Are not yet activated (not used to start a campaign)
    // 2. Have an activation window that has expired
    // 3. Payment was completed successfully
    const expiredPurchases = await this.prisma.creditPurchase.findMany({
      where: {
        activated: false,
        paymentStatus: 'COMPLETED',
        activationWindowExpiresAt: {
          lt: now,
        },
        // Not already marked as expired (adminNotes does not contain 'EXPIRED')
        NOT: {
          adminNotes: {
            contains: '[EXPIRED]',
          },
        },
      },
      include: {
        authorProfile: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                preferredLanguage: true,
              },
            },
          },
        },
        packageTier: {
          select: {
            name: true,
          },
        },
      },
    });

    this.logger.log(`Found ${expiredPurchases.length} expired credit purchases`);

    for (const purchase of expiredPurchases) {
      try {
        await this.expireCreditPurchase(purchase, now);
        this.logger.log(
          `Expired ${purchase.credits} credits for author ${purchase.authorProfile.user.email} (purchase ${purchase.id})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to expire credit purchase ${purchase.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Expire a single credit purchase
   */
  private async expireCreditPurchase(purchase: any, now: Date) {
    const authorProfile = purchase.authorProfile;
    const creditsToExpire = purchase.credits;

    // Calculate new available credits (ensure it doesn't go negative)
    const currentAvailable = authorProfile.availableCredits;
    const newAvailable = Math.max(0, currentAvailable - creditsToExpire);
    const actualExpired = currentAvailable - newAvailable;

    await this.prisma.$transaction(async (tx) => {
      // Update author profile - deduct expired credits
      await tx.authorProfile.update({
        where: { id: authorProfile.id },
        data: {
          availableCredits: newAvailable,
        },
      });

      // Mark purchase as expired (using adminNotes since there's no explicit expired field)
      await tx.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          adminNotes: `[EXPIRED] Credits expired on ${now.toISOString()}. Previous balance: ${currentAvailable}, Deducted: ${actualExpired}, New balance: ${newAvailable}`,
        },
      });

      // Create credit transaction record for the expiration
      await tx.creditTransaction.create({
        data: {
          authorProfileId: authorProfile.id,
          amount: -actualExpired,
          type: 'EXPIRATION',
          description: `Credits expired - activation window ended (${purchase.packageTier?.name || 'Package'})`,
          balanceAfter: newAvailable,
        },
      });
    });

    // Send notification email to author
    try {
      await this.emailService.sendCreditExpirationNotice({
        to: authorProfile.user.email,
        authorName: authorProfile.user.name || 'Author',
        expiredCredits: actualExpired,
        remainingCredits: newAvailable,
        purchaseDate: purchase.purchaseDate,
        expirationDate: purchase.activationWindowExpiresAt,
        language: authorProfile.user.preferredLanguage || 'EN',
      });
    } catch (emailError) {
      this.logger.error(
        `Failed to send expiration notification for purchase ${purchase.id}:`,
        emailError,
      );
    }
  }

  /**
   * Send warning emails for credits expiring in the next 7, 3, and 1 days
   * Per requirements.md Milestone 3: "Authors receive warnings at 7 days, 3 days, and 1 day before expiration"
   */
  private async sendExpirationWarnings(now: Date) {
    // Send warnings for multiple timeframes: 7 days, 3 days, 1 day
    await this.sendWarningsForDays(now, 7, '[WARNING_7D_SENT]');
    await this.sendWarningsForDays(now, 3, '[WARNING_3D_SENT]');
    await this.sendWarningsForDays(now, 1, '[WARNING_1D_SENT]');
  }

  /**
   * Send warning emails for credits expiring in N days
   */
  private async sendWarningsForDays(now: Date, days: number, warningMarker: string) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + days);

    // Calculate date range (same day +/- 12 hours to account for cron timing)
    const rangeStart = new Date(targetDate);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(targetDate);
    rangeEnd.setHours(23, 59, 59, 999);

    // Find purchases expiring in N days that haven't had THIS warning sent
    const expiringPurchases = await this.prisma.creditPurchase.findMany({
      where: {
        activated: false,
        paymentStatus: 'COMPLETED',
        activationWindowExpiresAt: {
          gte: rangeStart,
          lte: rangeEnd,
        },
        // Not already warned with THIS specific warning marker
        NOT: {
          adminNotes: {
            contains: warningMarker,
          },
        },
      },
      include: {
        authorProfile: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                preferredLanguage: true,
              },
            },
          },
        },
        packageTier: {
          select: {
            name: true,
          },
        },
      },
    });

    this.logger.log(`Found ${expiringPurchases.length} purchases expiring in ${days} day(s)`);

    for (const purchase of expiringPurchases) {
      try {
        await this.sendExpirationWarning(purchase, now, days, warningMarker);
        this.logger.log(
          `Sent ${days}-day expiration warning for ${purchase.credits} credits to ${purchase.authorProfile.user.email}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send ${days}-day warning for purchase ${purchase.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Send expiration warning for a single purchase
   */
  private async sendExpirationWarning(
    purchase: any,
    now: Date,
    daysUntilExpiration: number,
    warningMarker: string,
  ) {
    const authorProfile = purchase.authorProfile;

    // Send warning email
    try {
      await this.emailService.sendCreditExpirationWarning({
        to: authorProfile.user.email,
        authorName: authorProfile.user.name || 'Author',
        credits: purchase.credits,
        daysUntilExpiration,
        expirationDate: purchase.activationWindowExpiresAt,
        language: authorProfile.user.preferredLanguage || 'EN',
      });

      // Mark purchase as warned with the specific warning marker
      await this.prisma.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          adminNotes: purchase.adminNotes
            ? `${purchase.adminNotes} | ${warningMarker} ${now.toISOString()}`
            : `${warningMarker} ${now.toISOString()}`,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send warning email for purchase ${purchase.id}:`,
        error,
      );
    }
  }
}
