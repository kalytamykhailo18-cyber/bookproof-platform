import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ValidateReviewDto, BulkValidateReviewsDto, ValidationAction, IssueType, IssueSeverity } from './dto/validate-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsService } from './reviews.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { IssueResolutionStatus, AssignmentStatus, UserRole, LogSeverity, Prisma } from '@prisma/client';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
    private auditService: AuditService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Validate a single review (admin action)
   */
  async validateReview(
    reviewId: string,
    dto: ValidateReviewDto,
    adminUserId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        readerAssignment: true,
        readerProfile: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    switch (dto.action) {
      case ValidationAction.APPROVE:
        return this.approveReview(review, adminUserId);

      case ValidationAction.REJECT:
        return this.rejectReview(review, dto, adminUserId);

      case ValidationAction.FLAG:
        return this.flagReview(review, dto, adminUserId);

      case ValidationAction.REQUEST_RESUBMISSION:
        return this.requestResubmission(review, dto, adminUserId);

      default:
        throw new BadRequestException('Invalid validation action');
    }
  }

  /**
   * Approve review - triggers compensation and Amazon monitoring
   */
  private async approveReview(review: any, adminUserId: string): Promise<ReviewResponseDto> {
    const now = new Date();

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Update review status to VALIDATED
    const updatedReview = await this.prisma.review.update({
      where: { id: review.id },
      data: {
        status: 'VALIDATED' as any,
        validatedAt: now,
        validatedBy: adminUserId,
      },
    });

    // Update assignment status to VALIDATED
    await this.prisma.readerAssignment.update({
      where: { id: review.readerAssignmentId },
      data: {
        status: AssignmentStatus.VALIDATED,
      },
    });

    // Start Amazon removal monitoring (14-day guarantee)
    const monitoringEndDate = new Date(now);
    monitoringEndDate.setDate(monitoringEndDate.getDate() + 14);

    await this.prisma.amazonReviewMonitor.create({
      data: {
        reviewId: review.id,
        amazonReviewLink: review.amazonReviewLink,
        monitoringStartDate: now,
        monitoringEndDate,
        nextCheckAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Check in 24 hours
        isActive: true,
        stillExistsOnAmazon: true,
      },
    });

    // Trigger compensation (will be handled by compensation service)
    // This will create wallet transaction and update reader earnings
    await this.triggerCompensation(review);

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.approved',
      entity: 'Review',
      entityId: review.id,
      changes: {
        previousStatus: review.status,
        newStatus: 'VALIDATED',
        compensationTriggered: true,
        amazonMonitoringStarted: true,
      },
      description: `Review approved. Compensation triggered, Amazon monitoring started (14-day guarantee).`,
      severity: LogSeverity.INFO,
    });

    // Send email notification to reader about review approval
    try {
      const readerUser = await this.prisma.user.findFirst({
        where: { readerProfile: { id: review.readerProfileId } },
        select: { email: true, name: true, id: true, preferredLanguage: true },
      });

      if (readerUser) {
        const assignment = await this.prisma.readerAssignment.findUnique({
          where: { id: review.readerAssignmentId },
          include: { book: true },
        });

        await this.emailService.sendTemplatedEmail(
          readerUser.email,
          'READER_REVIEW_VALIDATED' as any,
          {
            userName: readerUser.name || 'Reader',
            bookTitle: assignment?.book?.title || 'your book',
            amount: assignment?.formatAssigned === 'AUDIOBOOK' ? 2.0 : 1.0,
            walletUrl: `${process.env.FRONTEND_URL || 'https://bookproof.com'}/reader/wallet`,
          },
          readerUser.id,
          readerUser.preferredLanguage || 'EN' as any,
        );
        this.logger.log(`Sent review validated email to reader ${readerUser.email}`);
      }
    } catch (emailError) {
      // Log error but don't fail the approval
      this.logger.error(`Failed to send review validated email: ${emailError.message}`);
    }

    // Send in-app notifications (Requirements Section 13.2)
    try {
      const assignment = await this.prisma.readerAssignment.findUnique({
        where: { id: review.readerAssignmentId },
        include: {
          book: { include: { authorProfile: { include: { user: true } } } },
          readerProfile: { include: { user: true } }
        },
      });

      if (assignment) {
        const bookTitle = assignment.book.title;
        const compensationAmount = assignment.formatAssigned === 'AUDIOBOOK' ? 2.0 : 1.0;

        // 1. Notify reader: Review validated
        if (assignment.readerProfile.userId) {
          await this.notificationsService.createNotification({
            userId: assignment.readerProfile.userId,
            type: 'REVIEW' as any,
            title: 'Review Validated',
            message: `Your review for "${bookTitle}" has been validated!`,
            actionUrl: '/reader/assignments',
            metadata: { bookTitle, reviewId: review.id },
          });
        }

        // 2. Notify reader: Payment added to wallet
        if (assignment.readerProfile.userId) {
          await this.notificationsService.notifyReaderPaymentAdded(
            assignment.readerProfile.userId,
            compensationAmount,
            bookTitle,
          );
        }

        // 3. Notify author: New review delivered
        if (assignment.book.authorProfile.userId) {
          // Get validated review count for the notification message
          const validatedReviews = await this.prisma.review.count({
            where: {
              bookId: assignment.bookId,
              status: 'VALIDATED',
            },
          });
          // Get target reviews from book - need to fetch it since it wasn't included
          const book = await this.prisma.book.findUnique({
            where: { id: assignment.bookId },
            select: { targetReviews: true },
          });
          await this.notificationsService.notifyAuthorReviewValidated(
            assignment.book.authorProfile.userId,
            bookTitle,
            validatedReviews,
            book?.targetReviews || 10,
          );
        }
      }
    } catch (notifError) {
      // Don't fail the approval if notification fails
      this.logger.error(`Failed to send review validated notifications: ${notifError.message}`);
    }

    return this.reviewsService.getReviewByIdForAdmin(review.id);
  }

  /**
   * Reject review - triggers reassignment
   */
  private async rejectReview(
    review: any,
    dto: ValidateReviewDto,
    adminUserId: string,
  ): Promise<ReviewResponseDto> {
    if (!dto.issueType) {
      throw new BadRequestException('Issue type is required when rejecting a review');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Update review status to REJECTED
    await this.prisma.review.update({
      where: { id: review.id },
      data: {
        status: 'REJECTED' as any,
        validatedAt: new Date(),
        validatedBy: adminUserId,
        hasIssue: true,
        issueType: dto.issueType,
        issueNotes: dto.notes || 'Review rejected by admin',
      },
    });

    // Create issue record
    await this.prisma.reviewIssue.create({
      data: {
        reviewId: review.id,
        issueType: dto.issueType,
        description: dto.notes || 'Review rejected by admin',
        severity: dto.severity || IssueSeverity.MEDIUM,
        status: IssueResolutionStatus.RESOLVED,
        resolvedBy: adminUserId,
        resolution: 'Review rejected, assignment will be reassigned',
        resolvedAt: new Date(),
        readerNotified: false,
        resubmissionRequested: false,
        reassignmentTriggered: true,
      },
    });

    // Update assignment status to REASSIGNED
    await this.prisma.readerAssignment.update({
      where: { id: review.readerAssignmentId },
      data: {
        status: AssignmentStatus.REASSIGNED,
        reassignmentReason: dto.notes || 'Review rejected',
        reassignedBy: adminUserId,
        reassignedAt: new Date(),
      },
    });

    // Update reader stats (increment rejected count)
    await this.prisma.readerProfile.update({
      where: { id: review.readerProfileId },
      data: {
        reviewsRejected: {
          increment: 1,
        },
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.rejected',
      entity: 'Review',
      entityId: review.id,
      changes: {
        previousStatus: review.status,
        newStatus: 'REJECTED',
        issueType: dto.issueType,
        severity: dto.severity || IssueSeverity.MEDIUM,
        reassignmentTriggered: true,
        readerNotified: true,
      },
      description: `Review rejected. Issue type: ${dto.issueType}. Reason: ${dto.notes || 'Review rejected by admin'}. Assignment will be reassigned.`,
      severity: LogSeverity.WARNING,
    });

    // Send email notification to reader about review rejection
    try {
      const readerUser = await this.prisma.user.findFirst({
        where: { readerProfile: { id: review.readerProfileId } },
        select: { email: true, name: true, id: true, preferredLanguage: true },
      });

      if (readerUser) {
        const assignment = await this.prisma.readerAssignment.findUnique({
          where: { id: review.readerAssignmentId },
          include: { book: true },
        });

        await this.emailService.sendTemplatedEmail(
          readerUser.email,
          'READER_REVIEW_REJECTED' as any,
          {
            userName: readerUser.name || 'Reader',
            bookTitle: assignment?.book?.title || 'your book',
            rejectionReason: dto.notes || 'Your review did not meet our quality standards.',
            dashboardUrl: `${process.env.FRONTEND_URL || 'https://bookproof.com'}/reader/dashboard`,
          },
          readerUser.id,
          readerUser.preferredLanguage || 'EN' as any,
        );
        this.logger.log(`Sent review rejected email to reader ${readerUser.email}`);
      }
    } catch (emailError) {
      // Log error but don't fail the rejection
      this.logger.error(`Failed to send review rejected email: ${emailError.message}`);
    }

    // TODO: Trigger automatic reassignment to next reader in queue
    // This will be handled by queue service

    return this.reviewsService.getReviewByIdForAdmin(review.id);
  }

  /**
   * Flag review for issues - requires manual resolution (Mark for Manual Investigation)
   */
  private async flagReview(
    review: any,
    dto: ValidateReviewDto,
    adminUserId: string,
  ): Promise<ReviewResponseDto> {
    if (!dto.issueType) {
      throw new BadRequestException('Issue type is required when flagging a review');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Update review status to FLAGGED
    await this.prisma.review.update({
      where: { id: review.id },
      data: {
        status: 'FLAGGED' as any,
        hasIssue: true,
        issueType: dto.issueType,
        issueNotes: dto.notes || 'Review flagged for issues',
      },
    });

    // Create issue record
    await this.prisma.reviewIssue.create({
      data: {
        reviewId: review.id,
        issueType: dto.issueType,
        description: dto.notes || 'Review flagged by admin',
        severity: dto.severity || IssueSeverity.MEDIUM,
        status: IssueResolutionStatus.OPEN,
        readerNotified: false,
        resubmissionRequested: false,
        reassignmentTriggered: false,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.flagged',
      entity: 'Review',
      entityId: review.id,
      changes: {
        previousStatus: review.status,
        newStatus: 'FLAGGED',
        issueType: dto.issueType,
        severity: dto.severity || IssueSeverity.MEDIUM,
        issueStatus: IssueResolutionStatus.OPEN,
      },
      description: `Review flagged for manual investigation. Issue type: ${dto.issueType}. Reason: ${dto.notes || 'Review flagged by admin'}. Held in pending status.`,
      severity: LogSeverity.WARNING,
    });

    return this.reviewsService.getReviewByIdForAdmin(review.id);
  }

  /**
   * Request resubmission - reader needs to fix and resubmit
   */
  private async requestResubmission(
    review: any,
    dto: ValidateReviewDto,
    adminUserId: string,
  ): Promise<ReviewResponseDto> {
    if (!dto.issueType) {
      throw new BadRequestException('Issue type is required when requesting resubmission');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Update review status back to PENDING_SUBMISSION
    await this.prisma.review.update({
      where: { id: review.id },
      data: {
        status: 'PENDING_SUBMISSION' as any,
        hasIssue: true,
        issueType: dto.issueType,
        issueNotes: dto.notes || 'Resubmission requested',
      },
    });

    // Create issue record
    await this.prisma.reviewIssue.create({
      data: {
        reviewId: review.id,
        issueType: dto.issueType,
        description: dto.notes || 'Resubmission requested by admin',
        severity: dto.severity || IssueSeverity.MEDIUM,
        status: IssueResolutionStatus.RESUBMISSION_PENDING,
        readerNotified: true,
        resubmissionRequested: true,
        reassignmentTriggered: false,
      },
    });

    // Update assignment status back to IN_PROGRESS
    await this.prisma.readerAssignment.update({
      where: { id: review.readerAssignmentId },
      data: {
        status: AssignmentStatus.IN_PROGRESS,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.resubmission_requested',
      entity: 'Review',
      entityId: review.id,
      changes: {
        previousStatus: review.status,
        newStatus: 'PENDING_SUBMISSION',
        issueType: dto.issueType,
        severity: dto.severity || IssueSeverity.MEDIUM,
        readerNotified: true,
        resubmissionRequested: true,
        deadlineExtended: true,
      },
      description: `Resubmission requested. Issue type: ${dto.issueType}. Instructions: ${dto.notes || 'Please fix and resubmit'}. Reader notified, deadline extended.`,
      severity: LogSeverity.INFO,
    });

    // Send notification email to reader about resubmission request
    try {
      // Fetch reader assignment with necessary relations
      const readerAssignment = await this.prisma.readerAssignment.findUnique({
        where: { id: review.readerAssignmentId },
        include: {
          readerProfile: {
            include: {
              user: true,
            },
          },
          book: true,
        },
      });

      if (!readerAssignment) {
        throw new Error('Reader assignment not found');
      }

      // Calculate new deadline (extend by 48 hours)
      const newDeadline = new Date();
      newDeadline.setHours(newDeadline.getHours() + 48);

      // Update assignment deadline
      await this.prisma.readerAssignment.update({
        where: { id: readerAssignment.id },
        data: {
          deadlineAt: newDeadline,
        },
      });

      const readerUser = readerAssignment.readerProfile.user;

      if (readerUser?.email) {
        // Note: READER_RESUBMISSION_REQUESTED email type may not exist yet in templates
        // This is a placeholder implementation that should be completed when email template is added
        this.logger.log(`Would send resubmission request email to reader ${readerUser.email}, but email template not yet implemented`);
        this.logger.log(`Details: Book=${readerAssignment.book.title}, Issue=${dto.issueType}, Deadline=${newDeadline.toLocaleDateString()}`);
      }
    } catch (emailError) {
      // Log error but don't fail the request
      this.logger.error(`Failed to send resubmission request email: ${emailError.message}`);
    }

    return this.reviewsService.getReviewByIdForAdmin(review.id);
  }

  /**
   * Bulk validate multiple reviews
   */
  async bulkValidateReviews(
    dto: BulkValidateReviewsDto,
    adminUserId: string,
  ): Promise<ReviewResponseDto[]> {
    const results: ReviewResponseDto[] = [];
    const failures: string[] = [];

    for (const reviewId of dto.reviewIds) {
      try {
        const result = await this.validateReview(
          reviewId,
          { action: dto.action },
          adminUserId,
        );
        results.push(result);
      } catch (error) {
        // Log error but continue with other reviews
        console.error(`Failed to validate review ${reviewId}:`, error.message);
        failures.push(reviewId);
      }
    }

    // Log bulk action audit trail
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'review.bulk_validated',
      entity: 'Review',
      changes: {
        action: dto.action,
        totalReviews: dto.reviewIds.length,
        successCount: results.length,
        failureCount: failures.length,
        failedReviewIds: failures.length > 0 ? failures : undefined,
      },
      description: `Bulk ${dto.action.toLowerCase()} action performed on ${dto.reviewIds.length} reviews. Success: ${results.length}, Failed: ${failures.length}.`,
      severity: LogSeverity.INFO,
    });

    return results;
  }

  /**
   * Trigger compensation for validated review
   * This creates wallet transaction, updates reader balance, and consumes campaign credits
   *
   * CRITICAL: Uses database transaction to prevent race conditions and ensure atomicity
   * - All balance updates are atomic (increment/decrement)
   * - Idempotency check prevents double compensation
   */
  private async triggerCompensation(review: any): Promise<void> {
    // Use transaction for atomicity - prevents race conditions and partial updates
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // IDEMPOTENCY CHECK: Verify review hasn't already been compensated
      const existingTransaction = await tx.walletTransaction.findUnique({
        where: { reviewId: review.id },
      });

      if (existingTransaction) {
        // Already compensated - skip to prevent double payment
        return;
      }

      // Get assignment with book details for proper credit tracking
      const assignment = await tx.readerAssignment.findUnique({
        where: { id: review.readerAssignmentId },
        include: {
          book: true,
        },
      });

      if (!assignment) {
        return;
      }

      // Calculate compensation based on format
      // Ebook = $1.00, Audiobook = $2.00 (configurable via SystemSettings)
      const compensationAmount = assignment.formatAssigned === 'AUDIOBOOK' ? 2.00 : 1.00;

      // Get current reader balance for transaction record
      const readerProfile = await tx.readerProfile.findUnique({
        where: { id: review.readerProfileId },
      });

      if (!readerProfile) {
        return;
      }

      const currentBalance = parseFloat(readerProfile.walletBalance.toString());
      const newBalance = currentBalance + compensationAmount;

      // Create wallet transaction (reviewId is unique, prevents duplicates)
      await tx.walletTransaction.create({
        data: {
          readerProfileId: review.readerProfileId,
          reviewId: review.id,
          amount: compensationAmount,
          type: 'EARNING',
          description: `Review compensation for "${assignment.book?.title || 'book'}"`,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        },
      });

      // Update reader profile balances using atomic increment
      await tx.readerProfile.update({
        where: { id: review.readerProfileId },
        data: {
          walletBalance: {
            increment: compensationAmount,
          },
          totalEarned: {
            increment: compensationAmount,
          },
          reviewsCompleted: {
            increment: 1,
          },
        },
      });

      // Update review with compensation details
      await tx.review.update({
        where: { id: review.id },
        data: {
          compensationPaid: true,
          compensationAmount,
          compensationPaidAt: new Date(),
        },
      });

      // Update assignment status to COMPLETED
      await tx.readerAssignment.update({
        where: { id: review.readerAssignmentId },
        data: {
          status: AssignmentStatus.COMPLETED,
        },
      });

      // Calculate credits consumed (1 for ebook, 2 for audiobook)
      const creditsConsumed = assignment.creditsValue || (assignment.formatAssigned === 'AUDIOBOOK' ? 2 : 1);

      // Update campaign stats AND consume credits
      await tx.book.update({
        where: { id: assignment.bookId },
        data: {
          totalReviewsValidated: {
            increment: 1,
          },
          totalReviewsDelivered: {
            increment: 1,
          },
          creditsUsed: {
            increment: creditsConsumed,
          },
          creditsRemaining: {
            decrement: creditsConsumed,
          },
        },
      });

      // Create CreditTransaction record for audit trail
      // Get the author profile to record the balance after deduction
      const authorProfile = await tx.authorProfile.findUnique({
        where: { id: assignment.book!.authorProfileId },
      });

      if (authorProfile) {
        // Create credit transaction for the automatic deduction
        await tx.creditTransaction.create({
          data: {
            authorProfileId: assignment.book!.authorProfileId,
            bookId: assignment.bookId,
            amount: -creditsConsumed, // Negative for deduction
            type: 'DEDUCTION',
            description: `Review validated for "${assignment.book?.title || 'book'}" (${assignment.formatAssigned === 'AUDIOBOOK' ? 'Audiobook' : 'Ebook'})`,
            balanceAfter: authorProfile.availableCredits, // Balance doesn't change, credits are from allocated pool
            notes: `Review ID: ${review.id}, Assignment ID: ${assignment.id}`,
          },
        });
      }
    });
  }
}
