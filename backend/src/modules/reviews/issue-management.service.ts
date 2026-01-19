import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateIssueDto, ResolveIssueDto, RequestResubmissionDto } from './dto/issue-management.dto';
import { ReviewIssueDto } from './dto/review-response.dto';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';
import { AssignmentStatus, UserRole, LogSeverity } from '@prisma/client';

@Injectable()
export class IssueManagementService {
  private readonly logger = new Logger(IssueManagementService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new issue for a review
   */
  async createIssue(
    reviewId: string,
    dto: CreateIssueDto,
    adminUserId: string,
  ): Promise<ReviewIssueDto> {
    // Verify review exists
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Create issue
    const issue = await this.prisma.reviewIssue.create({
      data: {
        reviewId,
        issueType: dto.issueType as any,
        description: dto.description,
        severity: (dto.severity || 'MEDIUM') as any,
        status: 'OPEN',
        readerNotified: false,
        resubmissionRequested: false,
        reassignmentTriggered: false,
      },
    });

    // Update review to mark it has issues
    await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        hasIssue: true,
        issueType: dto.issueType as any,
        status: 'FLAGGED' as any,
      },
    });

    // Log audit trail for issue creation
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'issue.created',
      entity: 'ReviewIssue',
      entityId: issue.id,
      changes: {
        reviewId,
        issueType: dto.issueType,
        severity: dto.severity || 'MEDIUM',
        status: 'OPEN',
      },
      description: `Issue created for review. Type: ${dto.issueType}. Description: ${dto.description}`,
      severity: LogSeverity.INFO,
    });

    return this.mapToIssueDto(issue);
  }

  /**
   * Get all issues for a review
   */
  async getReviewIssues(reviewId: string): Promise<ReviewIssueDto[]> {
    const issues = await this.prisma.reviewIssue.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'desc' },
    });

    return issues.map((issue) => this.mapToIssueDto(issue));
  }

  /**
   * Get all open issues (admin dashboard)
   */
  async getOpenIssues(): Promise<ReviewIssueDto[]> {
    const issues = await this.prisma.reviewIssue.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'] as any[],
        },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
    });

    return issues.map((issue) => this.mapToIssueDto(issue));
  }

  /**
   * Resolve an issue
   */
  async resolveIssue(
    issueId: string,
    dto: ResolveIssueDto,
    adminUserId: string,
  ): Promise<ReviewIssueDto> {
    const issue = await this.prisma.reviewIssue.findUnique({
      where: { id: issueId },
      include: {
        review: {
          include: {
            readerAssignment: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Update issue
    const updatedIssue = await this.prisma.reviewIssue.update({
      where: { id: issueId },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
        readerNotified: dto.notifyReader || false,
        resubmissionRequested: dto.requestResubmission || false,
        reassignmentTriggered: dto.triggerReassignment || false,
      },
    });

    // Get reader information for email notifications
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: issue.review.readerAssignmentId },
      include: {
        readerProfile: { include: { user: true } },
        book: true,
      },
    });

    // Handle actions based on resolution
    if (dto.requestResubmission) {
      // Change review status back to pending submission
      await this.prisma.review.update({
        where: { id: issue.reviewId },
        data: {
          status: 'PENDING_SUBMISSION' as any,
        },
      });

      // Change assignment status back to IN_PROGRESS
      await this.prisma.readerAssignment.update({
        where: { id: issue.review.readerAssignmentId },
        data: {
          status: AssignmentStatus.IN_PROGRESS,
        },
      });

      // Send email notification to reader
      if (assignment) {
        try {
          const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
          await this.emailService.sendTemplatedEmail(
            assignment.readerProfile.user.email,
            'READER_RESUBMISSION_REQUESTED' as any,
            {
              userName: assignment.readerProfile.user.name || 'Reader',
              bookTitle: assignment.book.title,
              reason: dto.resolution,
              resubmissionInstructions: dto.resolution,
              dashboardUrl: `${appUrl}/reader/assignments`,
            },
            assignment.readerProfile.userId,
            (assignment.readerProfile.user as any).preferredLanguage || 'EN',
          );
        } catch (error) {
          this.logger.error(`Failed to send resubmission email: ${error.message}`);
        }
      }
    }

    if (dto.triggerReassignment) {
      // Mark assignment as REASSIGNED
      await this.prisma.readerAssignment.update({
        where: { id: issue.review.readerAssignmentId },
        data: {
          status: AssignmentStatus.REASSIGNED,
          reassignmentReason: dto.resolution,
          reassignedBy: adminUserId,
          reassignedAt: new Date(),
        },
      });

      // Send email notification to reader about reassignment/rejection
      if (assignment) {
        try {
          const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
          await this.emailService.sendTemplatedEmail(
            assignment.readerProfile.user.email,
            'READER_ASSIGNMENT_REASSIGNED' as any,
            {
              userName: assignment.readerProfile.user.name || 'Reader',
              bookTitle: assignment.book.title,
              reason: dto.resolution,
              dashboardUrl: `${appUrl}/reader/assignments`,
            },
            assignment.readerProfile.userId,
            (assignment.readerProfile.user as any).preferredLanguage || 'EN',
          );
        } catch (error) {
          this.logger.error(`Failed to send reassignment email: ${error.message}`);
        }
      }
    }

    // Log audit trail for issue resolution
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'issue.resolved',
      entity: 'ReviewIssue',
      entityId: issueId,
      changes: {
        previousStatus: issue.status,
        newStatus: dto.status,
        resolution: dto.resolution,
        readerNotified: dto.notifyReader || false,
        resubmissionRequested: dto.requestResubmission || false,
        reassignmentTriggered: dto.triggerReassignment || false,
      },
      description: `Issue resolved. Resolution: ${dto.resolution}. Status: ${dto.status}.${dto.notifyReader ? ' Reader notified.' : ''}${dto.requestResubmission ? ' Resubmission requested.' : ''}${dto.triggerReassignment ? ' Reassignment triggered.' : ''}`,
      severity: LogSeverity.INFO,
    });

    return this.mapToIssueDto(updatedIssue);
  }

  /**
   * Get issue by ID
   */
  async getIssueById(issueId: string): Promise<ReviewIssueDto> {
    const issue = await this.prisma.reviewIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return this.mapToIssueDto(issue);
  }

  /**
   * Get issues by type
   */
  async getIssuesByType(issueType: string): Promise<ReviewIssueDto[]> {
    const issues = await this.prisma.reviewIssue.findMany({
      where: { issueType: issueType as any },
      orderBy: { createdAt: 'desc' },
    });

    return issues.map((issue) => this.mapToIssueDto(issue));
  }

  /**
   * Get issues by severity
   */
  async getIssuesBySeverity(severity: string): Promise<ReviewIssueDto[]> {
    const issues = await this.prisma.reviewIssue.findMany({
      where: { severity: severity as any },
      orderBy: { createdAt: 'desc' },
    });

    return issues.map((issue) => this.mapToIssueDto(issue));
  }

  /**
   * Request resubmission with deadline and email notification
   * This is the "Request Additional Information" control
   */
  async requestResubmission(
    issueId: string,
    dto: RequestResubmissionDto,
    adminUserId: string,
  ): Promise<ReviewIssueDto> {
    const issue = await this.prisma.reviewIssue.findUnique({
      where: { id: issueId },
      include: {
        review: {
          include: {
            readerAssignment: {
              include: {
                readerProfile: { include: { user: true } },
                book: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Get admin user for audit logging
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
      select: { email: true },
    });

    // Calculate resubmission deadline
    const resubmissionDeadline = new Date(Date.now() + dto.deadlineHours * 60 * 60 * 1000);

    // Update issue to RESUBMISSION_PENDING status
    const updatedIssue = await this.prisma.reviewIssue.update({
      where: { id: issueId },
      data: {
        status: 'RESUBMISSION_PENDING',
        resubmissionRequested: true,
        readerNotified: true,
      },
    });

    // Change review status to PENDING_SUBMISSION
    await this.prisma.review.update({
      where: { id: issue.reviewId },
      data: {
        status: 'PENDING_SUBMISSION' as any,
      },
    });

    // Update assignment status to IN_PROGRESS and set new deadline
    await this.prisma.readerAssignment.update({
      where: { id: issue.review.readerAssignmentId },
      data: {
        status: AssignmentStatus.IN_PROGRESS,
        deadlineAt: resubmissionDeadline,
        extensionReason: `Resubmission requested: ${dto.instructions}`,
      },
    });

    // Send email notification to reader
    const assignment = issue.review.readerAssignment;
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        'READER_RESUBMISSION_REQUESTED' as any,
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          bookTitle: assignment.book.title,
          resubmissionInstructions: dto.instructions,
          resubmissionDeadline: resubmissionDeadline.toISOString(),
          dashboardUrl: `${appUrl}/reader/assignments`,
        },
        assignment.readerProfile.userId,
        (assignment.readerProfile.user as any).preferredLanguage || 'EN',
      );
    } catch (error) {
      this.logger.error(`Failed to send resubmission request email: ${error.message}`);
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminUser?.email || 'unknown',
      userRole: UserRole.ADMIN,
      action: 'issue.resubmission_requested',
      entity: 'ReviewIssue',
      entityId: issueId,
      changes: {
        previousStatus: issue.status,
        newStatus: 'RESUBMISSION_PENDING',
        instructions: dto.instructions,
        deadlineHours: dto.deadlineHours,
        resubmissionDeadline: resubmissionDeadline.toISOString(),
      },
      description: `Resubmission requested for issue. Deadline: ${resubmissionDeadline.toISOString()}. Instructions: ${dto.instructions}`,
      severity: LogSeverity.INFO,
    });

    return this.mapToIssueDto(updatedIssue);
  }

  /**
   * Helper: Map Prisma issue to DTO
   */
  private mapToIssueDto(issue: any): ReviewIssueDto {
    return {
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
    };
  }
}
