import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { MarkAsRemovedByAmazonDto } from './dto/issue-management.dto';
import {
  ReviewMonitorDto,
  MonitoringStatsDto,
  MarkAsRemovedResponseDto,
} from './dto/review-response.dto';
import { AuditService } from '../audit/audit.service';
import { AssignmentStatus, UserRole, LogSeverity, EmailType } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class AmazonMonitoringService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  /**
   * Get all active reviews being monitored
   * Returns transformed DTOs matching frontend expectations
   */
  async getActiveMonitors(): Promise<ReviewMonitorDto[]> {
    const monitors = await this.prisma.amazonReviewMonitor.findMany({
      where: {
        isActive: true,
      },
      include: {
        review: {
          include: {
            book: true,
            readerProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { nextCheckAt: 'asc' },
    });

    // Transform to frontend-expected DTO format
    return monitors.map((monitor) => ({
      id: monitor.id,
      reviewId: monitor.reviewId,
      bookTitle: monitor.review.book.title,
      readerName: monitor.review.readerProfile.user.name,
      monitoringStartDate: monitor.monitoringStartDate.toISOString(),
      monitoringEndDate: monitor.monitoringEndDate.toISOString(),
      lastChecked: monitor.lastCheckedAt?.toISOString(),
      status: monitor.isActive ? 'MONITORING' : 'COMPLETED',
      stillExistsOnAmazon: monitor.stillExistsOnAmazon,
      amazonReviewLink: monitor.amazonReviewLink,
    }));
  }

  /**
   * Get monitors that need checking now
   */
  async getMonitorsDueForCheck() {
    const now = new Date();

    const monitors = await this.prisma.amazonReviewMonitor.findMany({
      where: {
        isActive: true,
        nextCheckAt: {
          lte: now,
        },
      },
      include: {
        review: {
          include: {
            book: true,
            readerProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return monitors;
  }

  /**
   * Mark a review as removed by Amazon
   * Triggers replacement if within 14-day guarantee
   * Returns typed response indicating eligibility and actions taken
   */
  async markAsRemoved(
    reviewId: string,
    dto: MarkAsRemovedByAmazonDto,
    adminUserId: string,
  ): Promise<MarkAsRemovedResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        readerAssignment: true,
        removalMonitoring: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const removalDate = new Date(dto.removalDate);
    const now = new Date();

    // Check if within 14-day guarantee
    const validatedAt = review.validatedAt;
    if (!validatedAt) {
      throw new Error('Review must be validated before marking as removed');
    }

    const daysSinceValidation = Math.floor(
      (removalDate.getTime() - validatedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const replacementEligible = daysSinceValidation <= 14;

    // Update review
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'REMOVED_BY_AMAZON' as any,
        removedByAmazon: true,
        removalDetectedAt: now,
        removalDate,
        replacementEligible,
      },
    });

    // Update monitoring record
    if (review.removalMonitoring) {
      await this.prisma.amazonReviewMonitor.update({
        where: { id: review.removalMonitoring.id },
        data: {
          isActive: false,
          stillExistsOnAmazon: false,
          removalDetectedAt: now,
          lastCheckedAt: now,
        },
      });
    }

    // Update reader profile stats
    await this.prisma.readerProfile.update({
      where: { id: review.readerProfileId },
      data: {
        reviewsRemovedByAmazon: {
          increment: 1,
        },
      },
    });

    // Create issue record
    await this.prisma.reviewIssue.create({
      data: {
        reviewId,
        issueType: 'REMOVED_BY_AMAZON',
        description: dto.notes || 'Review was removed by Amazon',
        severity: 'HIGH',
        status: 'RESOLVED',
        resolvedBy: adminUserId,
        resolution: replacementEligible
          ? 'Within 14-day guarantee, replacement will be provided'
          : 'Outside 14-day guarantee, no replacement',
        resolvedAt: now,
        readerNotified: false,
        resubmissionRequested: false,
        reassignmentTriggered: replacementEligible,
      },
    });

    // If eligible for replacement, trigger reassignment
    let replacementAssigned = false;
    let replacementAssignmentId: string | null = null;

    if (replacementEligible) {
      // Mark original assignment as reassigned
      await this.prisma.readerAssignment.update({
        where: { id: review.readerAssignmentId },
        data: {
          status: AssignmentStatus.REASSIGNED,
          reassignmentReason: 'Review removed by Amazon within 14-day guarantee',
          reassignedBy: adminUserId,
          reassignedAt: now,
        },
      });

      // Trigger automatic reassignment to next reader in queue
      // Find next reader waiting in queue for this book
      const nextReaderInQueue = await this.prisma.readerAssignment.findFirst({
        where: {
          bookId: review.bookId,
          status: AssignmentStatus.WAITING,
        },
        orderBy: {
          queuePosition: 'asc',
        },
      });

      if (nextReaderInQueue) {
        // Schedule next reader for immediate release (today)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const updatedAssignment = await this.prisma.readerAssignment.update({
          where: { id: nextReaderInQueue.id },
          data: {
            status: AssignmentStatus.SCHEDULED,
            scheduledDate: today,
            scheduledWeek: this.getWeekNumber(today),
            isBufferAssignment: false,
          },
          include: {
            readerProfile: {
              include: {
                user: true,
              },
            },
            book: true,
          },
        });

        replacementAssigned = true;
        replacementAssignmentId = nextReaderInQueue.id;

        // Send replacement notification email to reader
        try {
          const appUrl = process.env.APP_URL || 'http://localhost:3000';
          await this.emailService.sendTemplatedEmail(
            updatedAssignment.readerProfile.user.email,
            EmailType.READER_REPLACEMENT_ASSIGNED,
            {
              userName: updatedAssignment.readerProfile.user.name,
              bookTitle: updatedAssignment.book.title,
              bookAuthor: updatedAssignment.book.authorName,
              assignmentUrl: `${appUrl}/${updatedAssignment.readerProfile.user.preferredLanguage.toLowerCase()}/reader/assignments/${updatedAssignment.id}`,
              dashboardUrl: `${appUrl}/${updatedAssignment.readerProfile.user.preferredLanguage.toLowerCase()}/reader/dashboard`,
            },
            updatedAssignment.readerProfile.userId,
            updatedAssignment.readerProfile.user.preferredLanguage,
          );
        } catch (emailError) {
          // Log email error but don't fail the replacement process
          console.error('Failed to send replacement notification email:', emailError);
        }
      } else {
        // No readers in queue - admin will need to manually recruit more readers
        // or wait for new readers to join the campaign queue
        // The replacementEligible flag on the review tracks that this needs replacement
      }
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Log audit trail for Amazon removal detection
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.marked_removed_by_amazon',
      entity: 'Review',
      entityId: reviewId,
      changes: {
        previousStatus: review.status,
        newStatus: 'REMOVED_BY_AMAZON',
        removalDate: removalDate.toISOString(),
        daysSinceValidation,
        replacementEligible,
        reassignmentTriggered: replacementEligible,
        replacementAssigned,
        replacementAssignmentId,
      },
      description: `Review marked as removed by Amazon. ${replacementEligible ? `Within 14-day guarantee - replacement authorized.${replacementAssigned ? ' Next reader scheduled for assignment.' : ' No readers in queue - replacement pending.'}` : 'Outside 14-day window - no replacement.'}${dto.notes ? ` Notes: ${dto.notes}` : ''}`,
      severity: LogSeverity.WARNING,
    });

    // Build response message based on state
    let message: string;
    if (replacementEligible) {
      if (replacementAssigned) {
        message = 'Review marked as removed. Next reader from queue has been scheduled for replacement.';
      } else {
        message = 'Review marked as removed. No readers in queue - replacement will be assigned when a reader joins.';
      }
    } else {
      message = 'Review marked as removed. Outside 14-day guarantee window, no replacement provided.';
    }

    return {
      success: true,
      replacementEligible,
      daysSinceValidation,
      replacementAssigned,
      message,
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
   * Update monitoring check result (called by background job)
   */
  async updateMonitorCheck(monitorId: string, stillExists: boolean) {
    const monitor = await this.prisma.amazonReviewMonitor.findUnique({
      where: { id: monitorId },
    });

    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    const now = new Date();
    const nextCheckAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Check again in 24 hours

    // Check if monitoring period has ended
    const monitoringEnded = now >= monitor.monitoringEndDate;

    await this.prisma.amazonReviewMonitor.update({
      where: { id: monitorId },
      data: {
        lastCheckedAt: now,
        nextCheckAt: monitoringEnded ? undefined : nextCheckAt,
        checkCount: {
          increment: 1,
        },
        stillExistsOnAmazon: stillExists,
        isActive: !monitoringEnded && stillExists,
        removalDetectedAt: !stillExists ? now : undefined,
      },
    });

    // If removed, update review
    if (!stillExists) {
      await this.prisma.review.update({
        where: { id: monitor.reviewId },
        data: {
          status: 'REMOVED_BY_AMAZON' as any,
          removedByAmazon: true,
          removalDetectedAt: now,
        },
      });
    }

    return {
      monitorId,
      stillExists,
      monitoringEnded,
      nextCheckAt: monitoringEnded ? null : nextCheckAt,
    };
  }

  /**
   * Get monitoring statistics
   * Returns typed DTO matching frontend expectations
   */
  async getMonitoringStats(): Promise<MonitoringStatsDto> {
    const [
      totalActive,
      totalRemoved,
      totalCompleted,
      removedWithin14Days,
      removedAfter14Days,
    ] = await Promise.all([
      this.prisma.amazonReviewMonitor.count({
        where: { isActive: true },
      }),
      this.prisma.amazonReviewMonitor.count({
        where: { stillExistsOnAmazon: false },
      }),
      this.prisma.amazonReviewMonitor.count({
        where: {
          isActive: false,
          stillExistsOnAmazon: true,
        },
      }),
      this.prisma.review.count({
        where: {
          removedByAmazon: true,
          replacementEligible: true,
        },
      }),
      this.prisma.review.count({
        where: {
          removedByAmazon: true,
          replacementEligible: false,
        },
      }),
    ]);

    return {
      totalActive,
      totalRemoved,
      totalCompleted,
      removedWithin14Days,
      removedAfter14Days,
      removalRate:
        totalActive + totalRemoved > 0
          ? (totalRemoved / (totalActive + totalRemoved)) * 100
          : 0,
    };
  }
}
