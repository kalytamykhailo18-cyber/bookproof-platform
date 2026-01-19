import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/prisma/prisma.service';
import { AssignmentStatus, BookFormat } from '@prisma/client';
import { EmailService } from '@modules/email/email.service';

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
   */
  private async releaseAssignmentMaterials(assignment: any) {
    const now = new Date();
    const deadlineAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

    // For audiobooks: Set 7-day access window expiration
    // Per requirements: "Time-limited access window: 7 days after access granted"
    const materialsExpiresAt =
      assignment.formatAssigned === BookFormat.AUDIOBOOK
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        : null; // Ebooks have no time-limited access

    // Update assignment status
    await this.prisma.readerAssignment.update({
      where: { id: assignment.id },
      data: {
        status: AssignmentStatus.APPROVED,
        materialsReleasedAt: now,
        materialsExpiresAt: materialsExpiresAt,
        deadlineAt: deadlineAt,
      },
    });

    // Create reminder records for 24h, 48h, 72h
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
  }
}
