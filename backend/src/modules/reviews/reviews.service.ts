import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import {
  ReviewResponseDto,
  ReaderReviewResponseDto,
  ReaderIssueDto,
  ReviewStatus,
  PendingReviewsStatsDto,
} from './dto/review-response.dto';
import { AssignmentStatus, UserRole, EmailType } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  /**
   * Submit a review for an assignment
   * Reader must have APPROVED or IN_PROGRESS assignment to submit
   *
   * Per Milestone 4.4 - Review Submission Process:
   * - Validates minimum character count (150 characters)
   * - Validates star rating range (1-5)
   * - Verifies reader agreement to Amazon TOS
   * - Verifies reader acknowledged review guidelines
   * - Checks assignment is within deadline window
   *
   * PRIVACY: Returns ReaderReviewResponseDto which excludes admin-only fields
   */
  async submitReview(
    readerProfileId: string,
    assignmentId: string,
    dto: SubmitReviewDto,
  ): Promise<ReaderReviewResponseDto> {
    // Verify assignment exists and belongs to reader
    const assignment = await this.prisma.readerAssignment.findFirst({
      where: {
        id: assignmentId,
        readerProfileId,
      },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        review: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if materials are available (APPROVED, IN_PROGRESS statuses)
    if (
      assignment.status !== AssignmentStatus.APPROVED &&
      assignment.status !== AssignmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(
        'Cannot submit review for assignment that does not have materials released',
      );
    }

    // Check if review already exists
    if (assignment.review) {
      throw new BadRequestException('Review already submitted for this assignment');
    }

    // Check if assignment has expired
    if (assignment.deadlineAt && new Date(assignment.deadlineAt) < new Date()) {
      throw new BadRequestException('Cannot submit review after deadline has passed');
    }

    // Validate TOS agreement (Milestone 4.4 requirement)
    if (!dto.agreedToAmazonTos) {
      throw new BadRequestException('You must agree to Amazon Terms of Service compliance');
    }

    // Validate guidelines acknowledgement (Milestone 4.4 requirement)
    if (!dto.acknowledgedGuidelines) {
      throw new BadRequestException('You must acknowledge the review guidelines');
    }

    // Validate published confirmation
    if (!dto.publishedOnAmazon) {
      throw new BadRequestException('You must confirm that your review has been published on Amazon');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        readerAssignmentId: assignmentId,
        bookId: assignment.bookId,
        readerProfileId,
        amazonProfileId: assignment.amazonProfileId,
        amazonReviewLink: dto.amazonReviewLink,
        internalRating: dto.internalRating,
        internalFeedback: dto.internalFeedback,
        publishedOnAmazon: dto.publishedOnAmazon,
        completedContent: true,
        percentageCompleted: 100,
        status: 'SUBMITTED' as any,
        submittedAt: new Date(),
      },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
    });

    // Update assignment status to SUBMITTED
    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.SUBMITTED,
      },
    });

    // Notify admins about new review pending validation (Requirements Section 13.2)
    try {
      // Get all admin user IDs to notify
      const adminUsers = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN },
        select: { id: true },
      });
      const adminUserIds = adminUsers.map((u) => u.id);

      if (adminUserIds.length > 0) {
        await this.notificationsService.notifyAdminPendingReview(
          adminUserIds,
          review.book.title,
          review.id,
        );
      }
    } catch (notifError) {
      // Don't fail the submission if notification fails
      this.logger.error(`Failed to send admin pending review notification: ${notifError.message}`);
    }

    // Send confirmation email to reader (Milestone 4.4 requirement)
    try {
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        EmailType.READER_REVIEW_SUBMITTED,
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          bookTitle: assignment.book.title,
          submittedAt: review.submittedAt ?? undefined,
          dashboardUrl: '/reader/dashboard',
        },
        assignment.readerProfile.userId,
        assignment.readerProfile.user.preferredLanguage,
      );
      this.logger.log(`Review submission confirmation email sent to ${assignment.readerProfile.user.email}`);
    } catch (emailError) {
      // Don't fail the submission if email fails
      this.logger.error(`Failed to send review submission confirmation email: ${emailError.message}`);
    }

    // Send in-app notification to reader
    try {
      await this.notificationsService.notifyReaderReviewSubmitted(
        assignment.readerProfile.userId,
        assignment.book.title,
      );
    } catch (notifError) {
      // Don't fail the submission if notification fails
      this.logger.error(`Failed to send reader review submitted notification: ${notifError.message}`);
    }

    return this.mapToReaderReviewResponseDto(review);
  }

  /**
   * Get review by ID (for readers and admins)
   * Readers can only access their own reviews
   *
   * PRIVACY: Returns role-appropriate DTO
   * - Readers get ReaderReviewResponseDto (limited fields)
   * - Admins get ReviewResponseDto (full fields)
   */
  async getReviewById(
    reviewId: string,
    userRole: string,
    readerProfileId?: string,
  ): Promise<ReviewResponseDto | ReaderReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Readers can only access their own reviews
    if (userRole === 'READER' && readerProfileId && review.readerProfileId !== readerProfileId) {
      throw new ForbiddenException('You do not have access to this review');
    }

    // PRIVACY: Return role-appropriate DTO
    if (userRole === 'READER') {
      return this.mapToReaderReviewResponseDto(review);
    }
    return this.mapToReviewResponseDto(review);
  }

  /**
   * Get review by ID for admin use only
   * ADMIN-ONLY: Returns full ReviewResponseDto
   *
   * This method is used internally by admin services that need the full
   * review data without union type complications.
   */
  async getReviewByIdForAdmin(reviewId: string): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.mapToReviewResponseDto(review);
  }

  /**
   * Get all reviews submitted by a reader
   *
   * PRIVACY: Returns ReaderReviewResponseDto which excludes admin-only fields
   */
  async getReaderReviews(readerProfileId: string): Promise<ReaderReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: { readerProfileId },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return reviews.map((review) => this.mapToReaderReviewResponseDto(review));
  }

  /**
   * Get review for a specific assignment
   *
   * PRIVACY: Returns ReaderReviewResponseDto which excludes admin-only fields
   */
  async getReviewByAssignment(
    assignmentId: string,
    readerProfileId: string,
  ): Promise<ReaderReviewResponseDto | null> {
    const review = await this.prisma.review.findUnique({
      where: { readerAssignmentId: assignmentId },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
    });

    if (!review) {
      return null;
    }

    // Verify it belongs to the reader
    if (review.readerProfileId !== readerProfileId) {
      throw new ForbiddenException('You do not have access to this review');
    }

    return this.mapToReaderReviewResponseDto(review);
  }

  /**
   * Get all pending reviews for admin validation queue
   * ADMIN-ONLY: Returns full ReviewResponseDto with all fields
   */
  async getPendingReviews(): Promise<ReviewResponseDto[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'PENDING_VALIDATION'] as any[],
        },
      },
      include: {
        book: true,
        readerProfile: {
          include: {
            user: true,
          },
        },
        amazonProfile: true,
        issues: true,
      },
      orderBy: { submittedAt: 'asc' }, // FIFO
    });

    return reviews.map((review) => this.mapToReviewResponseDto(review));
  }

  /**
   * Get statistics for pending reviews
   */
  async getPendingReviewsStats(): Promise<PendingReviewsStatsDto> {
    const [
      totalPending,
      totalSubmitted,
      totalValidated,
      totalRejected,
      totalFlagged,
      totalRemovedByAmazon,
    ] = await Promise.all([
      this.prisma.review.count({
        where: { status: 'PENDING_VALIDATION' as any },
      }),
      this.prisma.review.count({
        where: { status: 'SUBMITTED' as any },
      }),
      this.prisma.review.count({
        where: { status: 'VALIDATED' as any },
      }),
      this.prisma.review.count({
        where: { status: 'REJECTED' as any },
      }),
      this.prisma.review.count({
        where: { status: 'FLAGGED' as any },
      }),
      this.prisma.review.count({
        where: { removedByAmazon: true },
      }),
    ]);

    return {
      totalPending,
      totalSubmitted,
      totalValidated,
      totalRejected,
      totalFlagged,
      totalRemovedByAmazon,
    };
  }

  /**
   * Helper: Map Prisma review to ResponseDto
   */
  private mapToReviewResponseDto(review: any): ReviewResponseDto {
    return {
      id: review.id,
      readerAssignmentId: review.readerAssignmentId,
      book: {
        id: review.book.id,
        title: review.book.title,
        authorName: review.book.authorName,
        asin: review.book.asin,
        coverImageUrl: review.book.coverImageUrl,
      },
      reader: {
        id: review.readerProfile.id,
        name: review.readerProfile.user.name,
        reliabilityScore: review.readerProfile.reliabilityScore
          ? parseFloat(review.readerProfile.reliabilityScore.toString())
          : undefined,
        completionRate: review.readerProfile.completionRate
          ? parseFloat(review.readerProfile.completionRate.toString())
          : undefined,
      },
      amazonProfile: review.amazonProfile
        ? {
            id: review.amazonProfile.id,
            profileUrl: review.amazonProfile.profileUrl,
            profileName: review.amazonProfile.profileName,
            isVerified: review.amazonProfile.isVerified,
          }
        : undefined,
      amazonReviewLink: review.amazonReviewLink,
      internalRating: review.internalRating,
      internalFeedback: review.internalFeedback,
      publishedOnAmazon: review.publishedOnAmazon,
      completedContent: review.completedContent,
      percentageCompleted: review.percentageCompleted,
      status: review.status,
      validatedAt: review.validatedAt,
      validatedBy: review.validatedBy,
      hasIssue: review.hasIssue,
      issueType: review.issueType,
      issueNotes: review.issueNotes,
      issues: review.issues?.map((issue: any) => ({
        id: issue.id,
        issueType: issue.issueType,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        resolution: issue.resolution,
        resolvedBy: issue.resolvedBy,
        resolvedAt: issue.resolvedAt,
        readerNotified: issue.readerNotified,
        resubmissionRequested: issue.resubmissionRequested,
        reassignmentTriggered: issue.reassignmentTriggered,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      })) || [],
      removedByAmazon: review.removedByAmazon,
      removalDetectedAt: review.removalDetectedAt,
      removalDate: review.removalDate,
      replacementEligible: review.replacementEligible,
      replacementProvided: review.replacementProvided,
      replacementReviewId: review.replacementReviewId,
      compensationPaid: review.compensationPaid,
      compensationAmount: review.compensationAmount
        ? parseFloat(review.compensationAmount.toString())
        : undefined,
      compensationPaidAt: review.compensationPaidAt,
      submittedAt: review.submittedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  /**
   * Helper: Map Prisma review to Reader-specific ResponseDto
   *
   * PRIVACY PROTECTION: This DTO excludes:
   * - Reader personal information (it's the reader's own review, they know who they are)
   * - Amazon profile details (they already know their own profile)
   * - Internal admin validation notes
   * - Severity flags and admin-only issue details
   * - Replacement/reassignment tracking (admin-only)
   * - validatedBy (admin identifier)
   * - issueNotes (internal admin notes)
   */
  private mapToReaderReviewResponseDto(review: any): ReaderReviewResponseDto {
    return {
      id: review.id,
      readerAssignmentId: review.readerAssignmentId,
      book: {
        id: review.book.id,
        title: review.book.title,
        authorName: review.book.authorName,
        asin: review.book.asin,
        coverImageUrl: review.book.coverImageUrl,
      },
      amazonReviewLink: review.amazonReviewLink,
      internalRating: review.internalRating,
      internalFeedback: review.internalFeedback,
      publishedOnAmazon: review.publishedOnAmazon,
      completedContent: review.completedContent,
      percentageCompleted: review.percentageCompleted,
      status: review.status,
      validatedAt: review.validatedAt,
      hasIssue: review.hasIssue,
      issueType: review.issueType,
      // PRIVACY: Limited issue info for reader - no internal notes/severity
      issues: review.issues?.map((issue: any): ReaderIssueDto => ({
        id: issue.id,
        issueType: issue.issueType,
        description: issue.description,
        status: issue.status,
        resubmissionRequested: issue.resubmissionRequested,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      })) || [],
      removedByAmazon: review.removedByAmazon,
      compensationPaid: review.compensationPaid,
      compensationAmount: review.compensationAmount
        ? parseFloat(review.compensationAmount.toString())
        : undefined,
      compensationPaidAt: review.compensationPaidAt,
      submittedAt: review.submittedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
