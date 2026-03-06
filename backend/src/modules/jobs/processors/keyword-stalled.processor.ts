import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { KeywordResearchStatus, EmailType } from '@prisma/client';
import { EmailService } from '@modules/email/email.service';
import { ConfigService } from '@nestjs/config';

/**
 * Keyword Research Stalled Job Monitor
 *
 * Per Section 9.3 Processing Time Requirements:
 * - Target: Under 5 minutes
 * - Maximum: 1 hour
 * - If delayed: Notify admin
 *
 * Runs every 15 minutes to check for keyword research jobs
 * that have been in PROCESSING status for more than 1 hour.
 */
@Injectable()
export class KeywordStalledProcessor {
  private readonly logger = new Logger(KeywordStalledProcessor.name);
  private readonly maxProcessingTimeMs = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Check for stalled keyword research jobs every 15 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'keyword-stalled-checker',
    timeZone: 'UTC',
  })
  async handleStalledCheck() {
    this.logger.log('Starting keyword research stalled job check...');

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - this.maxProcessingTimeMs);

      // Find keyword research jobs stuck in PROCESSING for over 1 hour
      const stalledJobs = await this.prisma.keywordResearch.findMany({
        where: {
          status: KeywordResearchStatus.PROCESSING,
          processingStartedAt: {
            lt: oneHourAgo,
          },
        },
        include: {
          authorProfile: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (stalledJobs.length === 0) {
        this.logger.debug('No stalled keyword research jobs found');
        return;
      }

      this.logger.warn(
        `Found ${stalledJobs.length} stalled keyword research job(s)`,
      );

      // Process each stalled job
      for (const job of stalledJobs) {
        await this.handleStalledJob(job, now);
      }

      this.logger.log(
        `Stalled job check completed. Processed ${stalledJobs.length} job(s)`,
      );
    } catch (error) {
      this.logger.error('Stalled job check failed:', error);
      throw error;
    }
  }

  /**
   * Handle a single stalled job - notify admin and optionally mark as failed
   */
  private async handleStalledJob(job: any, now: Date): Promise<void> {
    const processingTime = job.processingStartedAt
      ? Math.round((now.getTime() - job.processingStartedAt.getTime()) / 1000 / 60)
      : 0;

    this.logger.warn(
      `Stalled keyword research: ID=${job.id}, Book="${job.bookTitle}", ` +
        `Processing for ${processingTime} minutes, Author=${job.authorProfile?.user?.email}`,
    );

    // Check if we already notified about this job (using errorMessage as flag)
    const alreadyNotified = job.errorMessage?.includes('STALLED_NOTIFICATION_SENT');

    if (!alreadyNotified) {
      // Send admin notification
      await this.notifyAdminOfStalledJob(job, processingTime);

      // Mark that we've sent notification (to avoid spamming)
      await this.prisma.keywordResearch.update({
        where: { id: job.id },
        data: {
          errorMessage: `STALLED_NOTIFICATION_SENT at ${now.toISOString()}. Processing exceeded ${processingTime} minutes.`,
        },
      });
    }

    // If job has been stalled for over 2 hours, mark as FAILED
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (
      job.processingStartedAt &&
      now.getTime() - job.processingStartedAt.getTime() > twoHoursMs
    ) {
      this.logger.error(
        `Marking keyword research ${job.id} as FAILED after ${processingTime} minutes`,
      );

      await this.prisma.keywordResearch.update({
        where: { id: job.id },
        data: {
          status: KeywordResearchStatus.FAILED,
          errorMessage: `Processing timed out after ${processingTime} minutes. Please use the regenerate function to retry.`,
        },
      });

      // Send failure notification to admin
      await this.notifyAdminOfFailedJob(job, processingTime);
    }
  }

  /**
   * Send admin notification about stalled job
   */
  private async notifyAdminOfStalledJob(
    job: any,
    processingMinutes: number,
  ): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('APP_URL') || 'https://bookproof.app';

      await this.emailService.sendAdminNotification(
        EmailType.ADMIN_URGENT_ISSUE,
        {
          issueType: 'Keyword Research Processing Delayed',
          issueDescription: `Keyword research job has been processing for ${processingMinutes} minutes (exceeds 1 hour limit).`,
          bookTitle: job.bookTitle,
          authorName: job.authorProfile?.user?.name || 'Unknown',
          authorEmail: job.authorProfile?.user?.email || 'Unknown',
          keywordResearchId: job.id,
          processingStartedAt: job.processingStartedAt?.toISOString() || 'Unknown',
          actionRequired: 'Check system logs and consider manual regeneration.',
          dashboardUrl: `${appUrl}/admin/keyword-research`,
        },
      );

      this.logger.log(
        `Admin notification sent for stalled keyword research ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin notification for stalled job ${job.id}:`,
        error,
      );
    }
  }

  /**
   * Send admin notification about failed job (after timeout)
   */
  private async notifyAdminOfFailedJob(
    job: any,
    processingMinutes: number,
  ): Promise<void> {
    try {
      const appUrl = this.configService.get<string>('APP_URL') || 'https://bookproof.app';

      await this.emailService.sendAdminNotification(
        EmailType.ADMIN_URGENT_ISSUE,
        {
          issueType: 'Keyword Research Processing Failed',
          issueDescription: `Keyword research job has FAILED after ${processingMinutes} minutes. Automatic timeout triggered.`,
          bookTitle: job.bookTitle,
          authorName: job.authorProfile?.user?.name || 'Unknown',
          authorEmail: job.authorProfile?.user?.email || 'Unknown',
          keywordResearchId: job.id,
          processingStartedAt: job.processingStartedAt?.toISOString() || 'Unknown',
          actionRequired: 'Use the Admin regenerate function to retry processing.',
          dashboardUrl: `${appUrl}/admin/keyword-research`,
        },
      );

      this.logger.log(
        `Admin failure notification sent for keyword research ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send admin failure notification for job ${job.id}:`,
        error,
      );
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerManualCheck(): Promise<void> {
    this.logger.log('Manual stalled job check triggered');
    await this.handleStalledCheck();
  }
}
