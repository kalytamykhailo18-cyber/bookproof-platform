import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { AssignmentStatus, BookFormat, CampaignStatus, EmailType } from '@prisma/client';
import { EmailService } from '@modules/email/email.service';
import { NotificationsService } from '@modules/notifications/notifications.service';

/**
 * Daily Material Release Job
 *
 * Runs daily at 00:00 UTC
 * Releases materials to scheduled readers whose scheduledDate is today
 * Updates status to APPROVED and sets materialsReleasedAt
 * Sets 72-hour deadline
 * Sends "Materials Ready" email notification
 */
@Injectable()
export class MaterialReleaseProcessor {
  private readonly logger = new Logger(MaterialReleaseProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Main scheduler - runs daily at midnight UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'material-release',
    timeZone: 'UTC',
  })
  async handleMaterialRelease() {
    this.logger.log('Starting daily material release job...');

    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Get all scheduled assignments for today
      // Include formatAssigned to determine if audiobook (7-day access window)
      const scheduledAssignments = await this.prisma.readerAssignment.findMany({
        where: {
          status: AssignmentStatus.SCHEDULED,
          scheduledDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              authorName: true,
              synopsis: true,
              ebookFileUrl: true,
              audioBookFileUrl: true,
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
      });

      this.logger.log(
        `Found ${scheduledAssignments.length} assignments scheduled for today`,
      );

      if (scheduledAssignments.length === 0) {
        this.logger.log('No assignments to release today');
        return;
      }

      let releasedCount = 0;
      let failedCount = 0;

      // Process each assignment
      for (const assignment of scheduledAssignments) {
        try {
          await this.releaseAssignmentMaterials(assignment);
          releasedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to release materials for assignment ${assignment.id}:`,
            error,
          );
          failedCount++;
        }
      }

      this.logger.log(
        `Material release completed: ${releasedCount} released, ${failedCount} failed`,
      );
    } catch (error) {
      this.logger.error('Material release job failed:', error);
      throw error;
    }
  }

  /**
   * Release materials for a single assignment
   *
   * IMPORTANT: Different access windows based on format:
   * - Ebook: No time-limited access (can access until deadline/expiration)
   * - Audiobook: 7-day access window from release (per security requirements)
   *
   * Both formats: 72-hour review submission deadline
   *
   * CREDIT CONSUMPTION: Credits are deducted when materials are released (access granted)
   * - Ebook: 1 credit
   * - Audiobook: 2 credits
   * Per Milestone 3.3: "Credits deduct on access grant"
   */
  private async releaseAssignmentMaterials(assignment: any) {
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

    // Calculate credits to deduct based on format
    const creditsToDeduct = assignment.formatAssigned === BookFormat.AUDIOBOOK ? 2 : 1;

    // Check if campaign has enough credits remaining
    const book = await this.prisma.book.findUnique({
      where: { id: assignment.bookId },
      select: {
        id: true,
        title: true,
        creditsRemaining: true,
        creditsUsed: true,
        creditsAllocated: true,
        authorProfileId: true,
        status: true,
      },
    });

    if (!book) {
      throw new Error(`Book not found for assignment ${assignment.id}`);
    }

    // CRITICAL: Auto-pause campaign if insufficient credits
    // Per Milestone 3.3.5: "System automatically pauses campaigns when allocated credits exhausted"
    if (book.creditsRemaining < creditsToDeduct) {
      this.logger.warn(
        `Campaign "${book.title}" has insufficient credits (${book.creditsRemaining} remaining, need ${creditsToDeduct}). Auto-pausing campaign.`,
      );

      // Pause campaign and notify author
      await this.pauseCampaignDueToInsufficientCredits(book);

      // Do NOT release materials - skip this assignment
      throw new Error(
        `Campaign auto-paused due to insufficient credits. Cannot release materials for assignment ${assignment.id}`,
      );
    }

    // For audiobooks: Set 7-day access window expiration
    // Per requirements: "Time-limited access window: 7 days after access granted"
    const materialsExpiresAt =
      assignment.formatAssigned === BookFormat.AUDIOBOOK
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        : null; // Ebooks have no time-limited access

    // Execute in transaction: Deduct credits + Update assignment + Create transaction record
    await this.prisma.$transaction(async (tx) => {
      // Deduct credits from campaign
      const updatedBook = await tx.book.update({
        where: { id: book.id },
        data: {
          creditsUsed: { increment: creditsToDeduct },
          creditsRemaining: { decrement: creditsToDeduct },
        },
        select: {
          creditsRemaining: true,
        },
      });

      // Update assignment status
      await tx.readerAssignment.update({
        where: { id: assignment.id },
        data: {
          status: AssignmentStatus.APPROVED,
          materialsReleasedAt: now,
          materialsExpiresAt: materialsExpiresAt,
          deadlineAt: deadlineAt,
        },
      });

      // Create credit transaction record for audit trail
      // Note: balanceAfter tracks campaign credits remaining, not author's total available credits
      await tx.creditTransaction.create({
        data: {
          authorProfileId: book.authorProfileId,
          bookId: book.id,
          amount: -creditsToDeduct,
          type: 'DEDUCTION',
          description: `Materials released for reader (${assignment.formatAssigned}) - ${book.title}`,
          balanceAfter: updatedBook.creditsRemaining,
        },
      });
    });

    this.logger.log(
      `Deducted ${creditsToDeduct} credit(s) for ${assignment.formatAssigned} access. Campaign "${book.title}" now has ${book.creditsRemaining - creditsToDeduct} credits remaining.`,
    );

    // Create reminder records per Milestone 4.3:
    // - Hour 24: First reminder ("48 hours remaining")
    // - Hour 48: Second reminder ("24 hours remaining")
    // - Hour 60: Urgent reminder ("12 hours remaining")
    // - Hour 69: Final reminder ("3 hours remaining")
    // - Hour 72: Deadline expires
    await this.prisma.reminder.createMany({
      data: [
        {
          readerAssignmentId: assignment.id,
          reminderType: 'DEADLINE_24H',
          scheduledFor: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          emailSent: false,
        },
        {
          readerAssignmentId: assignment.id,
          reminderType: 'DEADLINE_48H',
          scheduledFor: new Date(now.getTime() + 48 * 60 * 60 * 1000),
          emailSent: false,
        },
        {
          readerAssignmentId: assignment.id,
          reminderType: 'DEADLINE_60H',
          scheduledFor: new Date(now.getTime() + 60 * 60 * 60 * 1000),
          emailSent: false,
        },
        {
          readerAssignmentId: assignment.id,
          reminderType: 'DEADLINE_69H',
          scheduledFor: new Date(now.getTime() + 69 * 60 * 60 * 1000),
          emailSent: false,
        },
        {
          readerAssignmentId: assignment.id,
          reminderType: 'DEADLINE_72H',
          scheduledFor: deadlineAt,
          emailSent: false,
        },
      ],
    });

    // Send "Materials Ready" email
    try {
      await this.emailService.sendMaterialsReadyEmail({
        to: assignment.readerProfile.user.email,
        readerName: assignment.readerProfile.user.name || 'Reader',
        bookTitle: assignment.book.title,
        authorName: assignment.book.authorName,
        deadline: deadlineAt,
        assignmentId: assignment.id,
      });

      this.logger.log(
        `Materials released for assignment ${assignment.id} - Book: ${assignment.book.title}`,
      );
    } catch (emailError) {
      this.logger.error(
        `Failed to send materials ready email for assignment ${assignment.id}:`,
        emailError,
      );
      // Don't throw - we still released the materials
    }

    // Send in-app "Access Granted" notification (Requirements Section 13.2)
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: assignment.readerProfile.userId },
      });

      if (user) {
        await this.notificationsService.notifyReaderAccessGranted(
          user.id,
          assignment.book.title,
          deadlineAt,
        );
      }
    } catch (notifError) {
      this.logger.error(
        `Failed to send access granted notification for assignment ${assignment.id}:`,
        notifError,
      );
      // Don't throw - we still released the materials
    }
  }

  /**
   * Pause campaign due to insufficient credits and notify author
   * Per Milestone 3.3.5: "System automatically pauses campaigns when allocated credits exhausted"
   * Per Milestone 3.4.6: "Notification when campaign is automatically paused"
   */
  private async pauseCampaignDueToInsufficientCredits(book: any) {
    try {
      // Update campaign status to PAUSED
      await this.prisma.book.update({
        where: { id: book.id },
        data: {
          status: CampaignStatus.PAUSED,
          distributionPausedAt: new Date(),
        },
      });

      // Get author information for notification
      const authorProfile = await this.prisma.authorProfile.findUnique({
        where: { id: book.authorProfileId },
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
      });

      if (!authorProfile) {
        this.logger.error(`Author profile not found for book ${book.id}`);
        return;
      }

      // Send email notification to author about campaign pause
      // Using ADMIN_NEW_ISSUE type to notify about the automatic pause
      try {
        await this.emailService.sendTemplatedEmail(
          authorProfile.user.email,
          EmailType.ADMIN_NEW_ISSUE,
          {
            adminName: authorProfile.user.name || 'Author',
            issueType: 'Campaign Automatically Paused',
            issueDescription: `Your campaign "${book.title}" has been automatically paused because it ran out of allocated credits.\n\nCredits Summary:\n- Allocated: ${book.creditsAllocated}\n- Used: ${book.creditsUsed}\n- Remaining: ${book.creditsRemaining}\n\nTo resume your campaign, please purchase additional credits and allocate them to this campaign.`,
            dashboardUrl: '/author/campaigns',
          },
          authorProfile.user.id,
          authorProfile.user.preferredLanguage,
        );

        this.logger.log(
          `Campaign paused notification sent to ${authorProfile.user.email} for campaign "${book.title}"`,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send campaign paused email for book ${book.id}:`,
          emailError,
        );
      }

      // Send in-app notification
      try {
        await this.notificationsService.notifyAuthorCampaignPaused(
          authorProfile.user.id,
          book.title,
          'INSUFFICIENT_CREDITS',
        );
      } catch (notifError) {
        this.logger.error(
          `Failed to send campaign paused notification for book ${book.id}:`,
          notifError,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to pause campaign ${book.id} due to insufficient credits:`,
        error,
      );
      throw error;
    }
  }
}
