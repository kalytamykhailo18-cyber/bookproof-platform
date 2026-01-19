import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { CampaignStatus, ReviewStatus, EmailType, Language } from '@prisma/client';
import { EmailService } from '@modules/email/email.service';
import { ReportsService } from '@modules/reports/reports.service';
import { ConfigService } from '@nestjs/config';

/**
 * Campaign Completion Checker Job
 *
 * Runs daily at 6:00 AM UTC
 * Checks if active campaigns have reached their target reviews
 * Updates campaign status to COMPLETED
 * Triggers final report generation
 * Sends notification email to author
 */
@Injectable()
export class CampaignCompletionProcessor {
  private readonly logger = new Logger(CampaignCompletionProcessor.name);
  private readonly appUrl: string;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private reportsService: ReportsService,
    private configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
  }

  /**
   * Main scheduler - runs daily at 6:00 AM UTC
   */
  @Cron('0 6 * * *', {
    name: 'campaign-completion-checker',
    timeZone: 'UTC',
  })
  async handleCampaignCompletionCheck() {
    this.logger.log('Starting daily campaign completion check...');

    try {
      // Find active campaigns that might be completed
      await this.processActiveCampaigns();

      this.logger.log('Campaign completion check completed successfully');
    } catch (error) {
      this.logger.error('Campaign completion check failed:', error);
      throw error;
    }
  }

  /**
   * Process all active campaigns to check for completion
   */
  private async processActiveCampaigns() {
    // Get all active campaigns
    const activeCampaigns = await this.prisma.book.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
      },
      include: {
        authorProfile: {
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
        _count: {
          select: {
            readerAssignments: {
              where: {
                review: {
                  status: ReviewStatus.VALIDATED,
                },
              },
            },
          },
        },
      },
    });

    this.logger.log(`Checking ${activeCampaigns.length} active campaigns for completion`);

    for (const campaign of activeCampaigns) {
      try {
        await this.checkCampaignCompletion(campaign);
      } catch (error) {
        this.logger.error(
          `Failed to check completion for campaign ${campaign.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Check if a specific campaign has reached completion
   */
  private async checkCampaignCompletion(campaign: any) {
    // Count validated reviews for this campaign
    const validatedReviewsCount = await this.prisma.review.count({
      where: {
        readerAssignment: {
          bookId: campaign.id,
        },
        status: ReviewStatus.VALIDATED,
      },
    });

    const targetReviews = campaign.targetReviews;

    this.logger.debug(
      `Campaign "${campaign.title}": ${validatedReviewsCount}/${targetReviews} reviews`,
    );

    // Check if campaign has reached target
    if (validatedReviewsCount >= targetReviews) {
      this.logger.log(
        `Campaign "${campaign.title}" has reached target! Marking as COMPLETED.`,
      );

      // Update campaign status to COMPLETED
      await this.prisma.book.update({
        where: { id: campaign.id },
        data: {
          status: CampaignStatus.COMPLETED,
          campaignEndDate: new Date(),
        },
      });

      // Generate final report
      await this.generateCampaignReport(campaign);

      // Send notification to author
      await this.notifyAuthorOfCompletion(campaign, validatedReviewsCount);
    }
  }

  /**
   * Generate the final campaign report
   */
  private async generateCampaignReport(campaign: any) {
    try {
      this.logger.log(`Generating final report for campaign "${campaign.title}"...`);

      const report = await this.reportsService.generateCampaignReport(campaign.id);

      this.logger.log(`Report generated successfully for campaign "${campaign.title}"`);

      // Send report ready notification
      await this.sendReportReadyNotification(campaign, report);
    } catch (error) {
      this.logger.error(
        `Failed to generate report for campaign ${campaign.id}:`,
        error,
      );
    }
  }

  /**
   * Send completion notification to author
   */
  private async notifyAuthorOfCompletion(campaign: any, reviewsDelivered: number) {
    try {
      const authorEmail = campaign.authorProfile.user.email;
      const authorName = campaign.authorProfile.user.name || 'Author';
      const language = campaign.authorProfile.user.preferredLanguage as Language || Language.EN;

      await this.emailService.sendTemplatedEmail(
        authorEmail,
        EmailType.AUTHOR_CAMPAIGN_COMPLETED,
        {
          userName: authorName,
          bookTitle: campaign.title,
          totalReviews: reviewsDelivered,
          dashboardUrl: `${this.appUrl}/author/campaigns/${campaign.id}`,
        },
        campaign.authorProfile.user.id,
        language,
      );

      this.logger.log(`Completion notification sent to ${authorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send completion notification for campaign ${campaign.id}:`,
        error,
      );
    }
  }

  /**
   * Send report ready notification to author
   */
  private async sendReportReadyNotification(campaign: any, report: any) {
    try {
      const authorEmail = campaign.authorProfile.user.email;
      const authorName = campaign.authorProfile.user.name || 'Author';
      const language = campaign.authorProfile.user.preferredLanguage as Language || Language.EN;

      await this.emailService.sendTemplatedEmail(
        authorEmail,
        EmailType.AUTHOR_REPORT_READY,
        {
          userName: authorName,
          bookTitle: campaign.title,
          reportUrl: `${this.appUrl}/author/reports/${report.id}`,
          dashboardUrl: `${this.appUrl}/author/reports`,
        },
        campaign.authorProfile.user.id,
        language,
      );

      // Update report email status
      await this.prisma.campaignReport.update({
        where: { id: report.id },
        data: {
          emailedAt: new Date(),
          emailDeliveryStatus: 'SENT',
        },
      });

      this.logger.log(`Report ready notification sent to ${authorEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send report ready notification for campaign ${campaign.id}:`,
        error,
      );
    }
  }
}
