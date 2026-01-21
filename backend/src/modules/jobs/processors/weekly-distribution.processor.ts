import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailService } from '@modules/email/email.service';
import { AssignmentStatus, CampaignStatus, EmailType, UserRole } from '@prisma/client';

/**
 * Weekly Distribution Scheduler
 *
 * Runs every Monday at 00:00 UTC
 * Selects readers from WAITING status and schedules them for this week
 * Applies 20% overbooking buffer automatically
 */
@Injectable()
export class WeeklyDistributionProcessor {
  private readonly logger = new Logger(WeeklyDistributionProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Main scheduler - runs every Monday at midnight UTC
   * Cron: 0 0 0 * * 1 = At 00:00:00 on Monday
   * Per Milestone 4.1: "Distribution runs exactly once per week (Monday 00:00 UTC)"
   */
  @Cron('0 0 0 * * 1', {
    name: 'weekly-distribution',
    timeZone: 'UTC',
  })
  async handleWeeklyDistribution() {
    this.logger.log('Starting weekly distribution job...');

    try {
      // Get current week number and year
      const now = new Date();
      const weekNumber = this.getWeekNumber(now);
      const year = now.getFullYear();

      this.logger.log(`Processing week ${weekNumber} of ${year}`);

      // Get all active campaigns
      const activeCampaigns = await this.prisma.book.findMany({
        where: {
          status: CampaignStatus.ACTIVE,
        },
        select: {
          id: true,
          title: true,
          targetReviews: true,
          reviewsPerWeek: true,
          campaignStartDate: true,
          campaignEndDate: true,
        },
      });

      this.logger.log(`Found ${activeCampaigns.length} active campaigns`);

      let totalScheduled = 0;
      let totalBufferScheduled = 0;
      const behindCampaigns: Array<{ id: string; title: string; scheduled: number; needed: number }> = [];

      // Process each campaign
      for (const campaign of activeCampaigns) {
        const result = await this.scheduleCampaignReaders(
          campaign.id,
          campaign.title,
          campaign.reviewsPerWeek || 10,
          weekNumber,
          year,
          now,
        );

        totalScheduled += result.scheduled;
        totalBufferScheduled += result.bufferScheduled;

        if (result.isBehind) {
          behindCampaigns.push({
            id: campaign.id,
            title: campaign.title,
            scheduled: result.scheduled,
            needed: result.needed,
          });
        }

        this.logger.log(
          `Campaign "${campaign.title}": Scheduled ${result.scheduled} readers + ${result.bufferScheduled} buffer`,
        );
      }

      this.logger.log(
        `Weekly distribution completed: ${totalScheduled} readers scheduled, ${totalBufferScheduled} buffer assignments`,
      );

      // Notify admins about campaigns behind schedule
      if (behindCampaigns.length > 0) {
        await this.notifyAdminsCampaignIssue(behindCampaigns, weekNumber);
      }
    } catch (error) {
      this.logger.error('Weekly distribution failed:', error);
      throw error;
    }
  }

  /**
   * Schedule readers for a specific campaign
   */
  private async scheduleCampaignReaders(
    campaignId: string,
    campaignTitle: string,
    reviewsPerWeek: number,
    weekNumber: number,
    year: number,
    scheduledDate: Date,
  ): Promise<{ scheduled: number; bufferScheduled: number; needed: number; isBehind: boolean }> {
    // Calculate slots (base + 20% buffer)
    const baseSlots = reviewsPerWeek;
    const bufferSlots = Math.ceil(reviewsPerWeek * 0.2); // 20% overbooking
    const totalSlots = baseSlots + bufferSlots;

    this.logger.log(
      `Campaign ${campaignTitle}: ${baseSlots} base slots + ${bufferSlots} buffer = ${totalSlots} total`,
    );

    // Get waiting readers ordered by queue position
    const waitingReaders = await this.prisma.readerAssignment.findMany({
      where: {
        bookId: campaignId,
        status: AssignmentStatus.WAITING,
      },
      orderBy: {
        queuePosition: 'asc',
      },
      take: totalSlots,
      select: {
        id: true,
        queuePosition: true,
      },
    });

    if (waitingReaders.length === 0) {
      this.logger.log(`No waiting readers for campaign ${campaignTitle}`);
      return { scheduled: 0, bufferScheduled: 0, needed: baseSlots, isBehind: true };
    }

    this.logger.log(
      `Found ${waitingReaders.length} waiting readers (needed ${totalSlots})`,
    );

    // Update base assignments (first N readers)
    const baseReaderIds = waitingReaders.slice(0, baseSlots).map((r) => r.id);
    const bufferReaderIds = waitingReaders.slice(baseSlots).map((r) => r.id);

    // Update base assignments
    if (baseReaderIds.length > 0) {
      await this.prisma.readerAssignment.updateMany({
        where: {
          id: { in: baseReaderIds },
        },
        data: {
          status: AssignmentStatus.SCHEDULED,
          scheduledWeek: weekNumber,
          scheduledDate: scheduledDate,
          isBufferAssignment: false,
        },
      });
    }

    // Update buffer assignments
    if (bufferReaderIds.length > 0) {
      await this.prisma.readerAssignment.updateMany({
        where: {
          id: { in: bufferReaderIds },
        },
        data: {
          status: AssignmentStatus.SCHEDULED,
          scheduledWeek: weekNumber,
          scheduledDate: scheduledDate,
          isBufferAssignment: true,
        },
      });
    }

    // Update book's totalAssignedReaders counter
    const totalAssigned = baseReaderIds.length + bufferReaderIds.length;
    if (totalAssigned > 0) {
      await this.prisma.book.update({
        where: { id: campaignId },
        data: {
          totalAssignedReaders: {
            increment: totalAssigned,
          },
        },
      });
    }

    // Campaign is behind if we couldn't fill all base slots
    const isBehind = baseReaderIds.length < baseSlots;

    return {
      scheduled: baseReaderIds.length,
      bufferScheduled: bufferReaderIds.length,
      needed: baseSlots,
      isBehind,
    };
  }

  /**
   * Calculate ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Notify admins about campaigns that are behind schedule
   */
  private async notifyAdminsCampaignIssue(
    behindCampaigns: Array<{ id: string; title: string; scheduled: number; needed: number }>,
    weekNumber: number,
  ): Promise<void> {
    try {
      // Get all active admins
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, isActive: true },
        select: { id: true, email: true, name: true, preferredLanguage: true },
      });

      const campaignSummary = behindCampaigns
        .map((c) => `- "${c.title}": ${c.scheduled}/${c.needed} readers`)
        .join('\n');

      for (const admin of admins) {
        try {
          await this.emailService.sendTemplatedEmail(
            admin.email,
            EmailType.ADMIN_NEW_ISSUE,
            {
              adminName: admin.name || 'Admin',
              issueType: 'Campaigns Behind Schedule',
              issueDescription: `The following campaigns do not have enough readers for week ${weekNumber}:\n\n${campaignSummary}\n\nPlease review and take action to ensure campaign targets are met.`,
              dashboardUrl: '/admin/campaigns',
            },
            admin.id,
            admin.preferredLanguage,
          );
        } catch (emailError) {
          this.logger.error(`Failed to send campaign issue email to ${admin.email}: ${emailError.message}`);
        }
      }

      this.logger.log(`Campaign issue notifications sent to ${admins.length} admins for ${behindCampaigns.length} campaigns`);
    } catch (error) {
      this.logger.error(`Failed to notify admins about campaign issues: ${error.message}`);
    }
  }
}
