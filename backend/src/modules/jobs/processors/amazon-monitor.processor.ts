import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { AmazonMonitoringService } from '@modules/reviews/amazon-monitoring.service';

/**
 * Daily Amazon Review Monitor Job
 *
 * Runs daily at 02:00 UTC (per ARCHITECTURE.md specification)
 * Checks reviews within the 14-day guarantee window
 * Updates monitoring records
 * NOTE: Actual URL checking is left for admin to manually verify
 *       This processor handles scheduling and status updates only
 *
 * Per requirements.md:
 * - Check reviews within 14-day guarantee window
 * - If removal detected, trigger replacement process
 * - Track monitoring statistics
 */
@Injectable()
export class AmazonMonitorProcessor {
  private readonly logger = new Logger(AmazonMonitorProcessor.name);

  constructor(
    private prisma: PrismaService,
    private amazonMonitoringService: AmazonMonitoringService,
  ) {}

  /**
   * Main scheduler - runs daily at 02:00 UTC
   * Per ARCHITECTURE.md: Daily Amazon Monitor | Daily 02:00 UTC
   */
  @Cron('0 2 * * *', {
    name: 'amazon-review-monitor',
    timeZone: 'UTC',
  })
  async handleAmazonMonitoringCheck() {
    this.logger.log('Starting daily Amazon review monitoring check...');

    try {
      const now = new Date();

      // Update check status for active monitors
      await this.updateActiveMonitors(now);

      // Complete expired monitoring periods
      await this.completeExpiredMonitors(now);

      // Log statistics
      const stats = await this.amazonMonitoringService.getMonitoringStats();
      this.logger.log(
        `Amazon monitoring check completed. Stats: Active=${stats.totalActive}, ` +
          `Removed=${stats.totalRemoved}, Completed=${stats.totalCompleted}, ` +
          `Removal Rate=${stats.removalRate.toFixed(2)}%`,
      );
    } catch (error) {
      this.logger.error('Amazon monitoring check failed:', error);
      throw error;
    }
  }

  /**
   * Update all active monitors that are due for checking
   *
   * NOTE: This doesn't actually check Amazon URLs (would require scraping)
   * Instead, it:
   * 1. Updates the lastCheckedAt timestamp
   * 2. Increments the checkCount
   * 3. Schedules the next check in 24 hours
   *
   * Actual removal detection is done manually by admin via the UI
   * using the "Mark as Removed" functionality
   */
  private async updateActiveMonitors(now: Date) {
    // Get monitors that need checking (nextCheckAt <= now)
    const dueMonitors = await this.prisma.amazonReviewMonitor.findMany({
      where: {
        isActive: true,
        nextCheckAt: {
          lte: now,
        },
      },
      include: {
        review: {
          select: {
            id: true,
            amazonReviewLink: true,
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Found ${dueMonitors.length} monitors due for check`);

    for (const monitor of dueMonitors) {
      try {
        // Calculate next check time (24 hours from now)
        const nextCheckAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Check if monitoring period has ended
        const monitoringEnded = now >= monitor.monitoringEndDate;

        // Build update data - only include nextCheckAt if monitoring continues
        const updateData: any = {
          lastCheckedAt: now,
          checkCount: {
            increment: 1,
          },
          // If monitoring ended and still exists, mark as completed
          isActive: !monitoringEnded && monitor.stillExistsOnAmazon,
        };

        // Only update nextCheckAt if monitoring should continue
        if (!monitoringEnded) {
          updateData.nextCheckAt = nextCheckAt;
        }

        // Update monitor
        await this.prisma.amazonReviewMonitor.update({
          where: { id: monitor.id },
          data: updateData,
        });

        this.logger.debug(
          `Updated monitor ${monitor.id} for "${monitor.review.book.title}" - ` +
            `Check #${monitor.checkCount + 1}, ${monitoringEnded ? 'Monitoring ended' : `Next check at ${nextCheckAt.toISOString()}`}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to update monitor ${monitor.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Complete monitors that have passed their 14-day window
   * without any removal detected
   *
   * This marks them as successfully completed (review survived the guarantee period)
   */
  private async completeExpiredMonitors(now: Date) {
    // Find monitors that have:
    // 1. Passed their monitoring end date
    // 2. Still show as active
    // 3. Review still exists on Amazon
    const expiredMonitors = await this.prisma.amazonReviewMonitor.findMany({
      where: {
        isActive: true,
        stillExistsOnAmazon: true,
        monitoringEndDate: {
          lt: now,
        },
      },
      include: {
        review: {
          select: {
            id: true,
            book: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Found ${expiredMonitors.length} monitors completing their 14-day window`,
    );

    for (const monitor of expiredMonitors) {
      try {
        // Mark monitoring as complete (successfully survived 14-day window)
        // Note: nextCheckAt is required, so we don't update it (keep existing value)
        await this.prisma.amazonReviewMonitor.update({
          where: { id: monitor.id },
          data: {
            isActive: false,
            lastCheckedAt: now,
          },
        });

        this.logger.log(
          `Monitor ${monitor.id} for "${monitor.review.book.title}" completed - ` +
            `Review survived 14-day guarantee period`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to complete monitor ${monitor.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Manual trigger for Amazon monitoring check (for testing/admin use)
   */
  async triggerManualCheck() {
    this.logger.log('Manual Amazon monitoring check triggered');
    await this.handleAmazonMonitoringCheck();
  }
}
