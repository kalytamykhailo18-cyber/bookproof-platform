import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { AssignmentStatus, Prisma } from '@prisma/client';
import { EmailService } from '@modules/email/email.service';

/**
 * Hourly Deadline Checker Job
 *
 * Runs every hour
 * Checks assignments approaching deadlines
 * Sends reminder emails (24h, 48h, 72h)
 * Marks expired assignments
 * Triggers reassignment to next reader in queue
 */
@Injectable()
export class DeadlineCheckerProcessor {
  private readonly logger = new Logger(DeadlineCheckerProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Main scheduler - runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'deadline-checker',
    timeZone: 'UTC',
  })
  async handleDeadlineCheck() {
    this.logger.log('Starting hourly deadline check...');

    try {
      const now = new Date();

      // Process pending reminders
      await this.processPendingReminders(now);

      // Check for expired assignments
      await this.processExpiredAssignments(now);

      this.logger.log('Deadline check completed successfully');
    } catch (error) {
      this.logger.error('Deadline check failed:', error);
      throw error;
    }
  }

  /**
   * Process pending reminder emails
   */
  private async processPendingReminders(now: Date) {
    // Get all pending reminders that should be sent now
    const pendingReminders = await this.prisma.reminder.findMany({
      where: {
        emailSent: false,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        readerAssignment: {
          include: {
            book: {
              select: {
                title: true,
                authorName: true,
              },
            },
            readerProfile: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    this.logger.log(`Found ${pendingReminders.length} pending reminders`);

    for (const reminder of pendingReminders) {
      try {
        await this.sendReminderEmail(reminder);

        // Mark as sent
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            emailSent: true,
            sentAt: now,
          },
        });

        this.logger.log(
          `Sent ${reminder.reminderType} reminder for assignment ${reminder.readerAssignmentId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send reminder ${reminder.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Send reminder email based on type
   */
  private async sendReminderEmail(reminder: any) {
    const assignment = reminder.readerAssignment;
    const readerEmail = assignment.readerProfile.user.email;
    const readerName = assignment.readerProfile.user.name || 'Reader';
    const bookTitle = assignment.book.title;
    const deadline = assignment.deadlineAt;

    switch (reminder.reminderType) {
      case 'DEADLINE_24H':
        await this.emailService.sendDeadlineReminder({
          to: readerEmail,
          readerName,
          bookTitle,
          deadline,
          hoursRemaining: 48, // 48 hours remaining when 24h has passed
          assignmentId: assignment.id,
        });
        break;

      case 'DEADLINE_48H':
        await this.emailService.sendDeadlineReminder({
          to: readerEmail,
          readerName,
          bookTitle,
          deadline,
          hoursRemaining: 24, // 24 hours remaining when 48h has passed
          assignmentId: assignment.id,
        });
        break;

      case 'DEADLINE_72H':
        await this.emailService.sendDeadlineExpiredEmail({
          to: readerEmail,
          readerName,
          bookTitle,
          assignmentId: assignment.id,
        });
        break;

      case 'EXPIRATION_NOTICE':
        await this.emailService.sendDeadlineExpiredEmail({
          to: readerEmail,
          readerName,
          bookTitle,
          assignmentId: assignment.id,
        });
        break;

      default:
        this.logger.warn(`Unknown reminder type: ${reminder.reminderType}`);
    }
  }

  /**
   * Process expired assignments
   *
   * Per Rule 3: When Deadline Expires (72 Hours)
   * - Reader's assignment expires automatically
   * - Reader loses access to all materials immediately
   * - Review task is reassigned to next reader in queue
   * - Deadline is strict and enforced automatically
   *
   * IMPORTANT: Must check both APPROVED and IN_PROGRESS statuses
   * - APPROVED: Materials released but reader hasn't started
   * - IN_PROGRESS: Reader started but didn't complete in time
   */
  private async processExpiredAssignments(now: Date) {
    // Find assignments that have passed deadline
    // Check both APPROVED and IN_PROGRESS since readers can miss deadline in either state
    const expiredAssignments = await this.prisma.readerAssignment.findMany({
      where: {
        status: {
          in: [AssignmentStatus.APPROVED, AssignmentStatus.IN_PROGRESS],
        },
        deadlineAt: {
          lt: now,
        },
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    this.logger.log(`Found ${expiredAssignments.length} expired assignments`);

    for (const assignment of expiredAssignments) {
      try {
        await this.expireAndReassign(assignment);
        this.logger.log(
          `Expired and reassigned assignment ${assignment.id} for book "${assignment.book.title}"`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to expire assignment ${assignment.id}:`,
          error,
        );
      }
    }
  }

  /**
   * Expire assignment and reassign to next reader in queue
   *
   * Per Rule 3: When Deadline Expires (72 Hours)
   * 1. Reader's assignment expires automatically
   * 2. Reader loses access to all materials immediately
   * 3. Review task is reassigned to next reader in queue
   * 4. Reader receives no compensation for expired task
   * 5. Book campaign flow continues without interruption
   * 6. Reader's account may be flagged for future consideration
   * 7. System maintains complete record of expiration
   *
   * CRITICAL: Uses database transaction to ensure atomicity
   * All updates (assignment, book stats, reader profile, reassignment)
   * must succeed or fail together to prevent inconsistent state.
   */
  private async expireAndReassign(assignment: any) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekNumber = this.getWeekNumber(today);

    // Use transaction for atomicity - all updates succeed or fail together
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Mark current assignment as EXPIRED and record expiration time
      await tx.readerAssignment.update({
        where: { id: assignment.id },
        data: {
          status: AssignmentStatus.EXPIRED,
          expiredAt: now,
          expirationHandled: true,
          // Clear access tokens to revoke material access immediately
          audioAccessToken: null,
          audioAccessExpiresAt: null,
        },
      });

      // Update book's expired reviews counter using atomic increment
      await tx.book.update({
        where: { id: assignment.bookId },
        data: {
          totalReviewsExpired: { increment: 1 },
        },
      });

      // Update reader's expired reviews counter using atomic increment
      await tx.readerProfile.update({
        where: { id: assignment.readerProfileId },
        data: {
          reviewsExpired: { increment: 1 },
        },
      });

      // Find next reader in queue for this book
      const nextReader = await tx.readerAssignment.findFirst({
        where: {
          bookId: assignment.bookId,
          status: AssignmentStatus.WAITING,
        },
        orderBy: {
          queuePosition: 'asc',
        },
      });

      let reassignedTo: string | null = null;

      if (nextReader) {
        // Schedule next reader for immediate release (today)
        await tx.readerAssignment.update({
          where: { id: nextReader.id },
          data: {
            status: AssignmentStatus.SCHEDULED,
            scheduledDate: today,
            scheduledWeek: weekNumber,
            isBufferAssignment: false,
          },
        });

        reassignedTo = nextReader.id;
      }

      // Update reader reliability score within transaction
      const readerProfile = await tx.readerProfile.findUnique({
        where: { id: assignment.readerProfileId },
        select: {
          reliabilityScore: true,
        },
      });

      if (readerProfile) {
        const currentScore = Number(readerProfile.reliabilityScore) || 100;
        // Decrease reliability score by 5 for expiration
        const newScore = Math.max(0, currentScore - 5);

        await tx.readerProfile.update({
          where: { id: assignment.readerProfileId },
          data: {
            reliabilityScore: newScore,
          },
        });
      }

      return { reassignedTo };
    });

    if (result.reassignedTo) {
      this.logger.log(
        `Reassigned to next reader (assignment ${result.reassignedTo}) for book ${assignment.bookId}`,
      );
    } else {
      this.logger.log(
        `No waiting readers available for reassignment (book ${assignment.bookId})`,
      );
    }
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
}
