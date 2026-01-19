import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/email.service';
import {
  ExtendDeadlineDto,
  ReassignReaderDto,
  BulkReassignDto,
  CancelAssignmentDto,
  CorrectAssignmentErrorDto,
  BulkReassignResultDto,
  AssignmentExceptionDto,
  ShortenDeadlineDto,
} from '../dto/exception-handling.dto';
import { AssignmentStatus } from '@prisma/client';

@Injectable()
export class ExceptionHandlingService {
  private readonly logger = new Logger(ExceptionHandlingService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Extend deadline for a specific reader assignment
   */
  async extendDeadline(
    assignmentId: string,
    dto: ExtendDeadlineDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: assignmentId },
      include: { book: true, readerProfile: { include: { user: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (!assignment.deadlineAt) {
      throw new BadRequestException('Assignment does not have a deadline set');
    }

    // Calculate new deadline
    const currentDeadline = new Date(assignment.deadlineAt);
    const newDeadline = new Date(currentDeadline.getTime() + dto.extensionHours * 60 * 60 * 1000);

    // Update assignment
    const updated = await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        deadlineAt: newDeadline,
        deadlineExtendedAt: new Date(),
        extensionReason: dto.reason,
      },
    });

    // Log audit trail
    await this.auditService.logDeadlineExtension(
      assignmentId,
      dto.extensionHours,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    // Send email notification to reader
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        'READER_DEADLINE_EXTENDED' as any,
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          bookTitle: assignment.book.title,
          extensionHours: dto.extensionHours,
          oldDeadline: currentDeadline.toISOString(),
          newDeadline: newDeadline.toISOString(),
          reason: dto.reason,
          dashboardUrl: `${appUrl}/reader/assignments`,
        },
        assignment.readerProfile.userId,
        (assignment.readerProfile.user as any).preferredLanguage || 'EN',
      );
    } catch (error) {
      this.logger.error(`Failed to send deadline extension email: ${error.message}`);
    }

    return {
      assignmentId,
      oldDeadline: currentDeadline.toISOString(),
      newDeadline: newDeadline.toISOString(),
      extensionHours: dto.extensionHours,
      reason: dto.reason,
    };
  }

  /**
   * Shorten deadline for a specific reader assignment
   */
  async shortenDeadline(
    assignmentId: string,
    dto: ShortenDeadlineDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: assignmentId },
      include: { book: true, readerProfile: { include: { user: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (!assignment.deadlineAt) {
      throw new BadRequestException('Assignment does not have a deadline set');
    }

    // Calculate new deadline
    const currentDeadline = new Date(assignment.deadlineAt);
    const newDeadline = new Date(currentDeadline.getTime() - dto.reductionHours * 60 * 60 * 1000);

    // Ensure new deadline is still in the future
    if (newDeadline <= new Date()) {
      throw new BadRequestException('Cannot shorten deadline to a past date');
    }

    // Update assignment
    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        deadlineAt: newDeadline,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: 'ADMIN' as any,
      action: 'assignment.deadline_shortened',
      entity: 'ReaderAssignment',
      entityId: assignmentId,
      description: `Deadline shortened by ${dto.reductionHours} hours. Reason: ${dto.reason}`,
      changes: {
        oldDeadline: currentDeadline.toISOString(),
        newDeadline: newDeadline.toISOString(),
        reductionHours: dto.reductionHours,
        reason: dto.reason,
      },
      ipAddress,
    });

    // Send email notification to reader about the shortened deadline
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        'READER_DEADLINE_EXTENDED' as any, // Use same template, wording handles both extend/shorten
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          bookTitle: assignment.book.title,
          extensionHours: -dto.reductionHours, // Negative to indicate shortening
          oldDeadline: currentDeadline.toISOString(),
          newDeadline: newDeadline.toISOString(),
          reason: dto.reason,
          dashboardUrl: `${appUrl}/reader/assignments`,
        },
        assignment.readerProfile.userId,
        (assignment.readerProfile.user as any).preferredLanguage || 'EN',
      );
    } catch (error) {
      this.logger.error(`Failed to send deadline shortening email: ${error.message}`);
    }

    return {
      assignmentId,
      oldDeadline: currentDeadline.toISOString(),
      newDeadline: newDeadline.toISOString(),
      reductionHours: dto.reductionHours,
      reason: dto.reason,
    };
  }

  /**
   * Reassign reader to different book
   */
  async reassignReader(
    assignmentId: string,
    dto: ReassignReaderDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: assignmentId },
      include: { book: true, readerProfile: { include: { user: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const targetBook = await this.prisma.book.findUnique({
      where: { id: dto.targetBookId },
    });

    if (!targetBook) {
      throw new NotFoundException('Target book not found');
    }

    // Update old assignment to REASSIGNED status
    await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.REASSIGNED,
        reassignmentReason: dto.reason,
        reassignedBy: adminUserId,
        reassignedAt: new Date(),
      },
    });

    // Create new assignment for target book
    const newAssignment = await this.prisma.readerAssignment.create({
      data: {
        bookId: dto.targetBookId,
        readerProfileId: assignment.readerProfileId,
        formatAssigned: assignment.formatAssigned,
        creditsValue: assignment.creditsValue,
        status: AssignmentStatus.WAITING,
        isReassignment: true,
        originalAssignmentId: assignmentId,
        reassignmentReason: dto.reason,
      },
    });

    // Log audit trail
    await this.auditService.logReassignment(
      assignmentId,
      assignment.bookId,
      dto.targetBookId,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    // Send email notification to reader about reassignment
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        'READER_ASSIGNMENT_REASSIGNED' as any,
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          oldBookTitle: assignment.book.title,
          newBookTitle: targetBook.title,
          reason: dto.reason,
          dashboardUrl: `${appUrl}/reader/assignments`,
        },
        assignment.readerProfile.userId,
        (assignment.readerProfile.user as any).preferredLanguage || 'EN',
      );
    } catch (error) {
      this.logger.error(`Failed to send reassignment email: ${error.message}`);
    }

    return {
      oldAssignmentId: assignmentId,
      newAssignmentId: newAssignment.id,
      oldBookId: assignment.bookId,
      newBookId: dto.targetBookId,
      reason: dto.reason,
    };
  }

  /**
   * Bulk reassign multiple assignments
   */
  async bulkReassign(
    dto: BulkReassignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<BulkReassignResultDto> {
    const targetBook = await this.prisma.book.findUnique({
      where: { id: dto.targetBookId },
    });

    if (!targetBook) {
      throw new NotFoundException('Target book not found');
    }

    const results: Array<{ assignmentId: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    for (const assignmentId of dto.assignmentIds) {
      try {
        await this.reassignReader(
          assignmentId,
          { targetBookId: dto.targetBookId, reason: dto.reason, notes: dto.notes },
          adminUserId,
          adminEmail,
          ipAddress,
        );
        results.push({ assignmentId, success: true });
        successCount++;
      } catch (error) {
        results.push({
          assignmentId,
          success: false,
          error: error.message || 'Unknown error',
        });
        failureCount++;
      }
    }

    // Log bulk operation
    await this.auditService.logBulkReassignment(
      dto.assignmentIds,
      dto.targetBookId,
      dto.reason,
      successCount,
      failureCount,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return {
      totalProcessed: dto.assignmentIds.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Cancel an assignment
   */
  async cancelAssignment(
    assignmentId: string,
    dto: CancelAssignmentDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: assignmentId },
      include: { book: { include: { authorProfile: true } }, readerProfile: { include: { user: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Update assignment status to CANCELLED
    const updated = await this.prisma.readerAssignment.update({
      where: { id: assignmentId },
      data: {
        status: AssignmentStatus.CANCELLED,
        cancelledBy: adminUserId,
        cancellationReason: dto.reason,
      },
    });

    // Handle credit refund if requested
    let creditsRefunded = 0;
    if (dto.refundCredits && assignment.book.authorProfileId) {
      creditsRefunded = assignment.creditsValue;

      // Refund credits to the book's remaining credits
      await this.prisma.book.update({
        where: { id: assignment.bookId },
        data: {
          creditsRemaining: { increment: creditsRefunded },
        },
      });

      // Also update author's available credits
      await this.prisma.authorProfile.update({
        where: { id: assignment.book.authorProfileId },
        data: {
          availableCredits: { increment: creditsRefunded },
        },
      });
    }

    // Log audit trail
    await this.auditService.logAssignmentCancellation(
      assignmentId,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    // Send email notification to reader about cancellation
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        assignment.readerProfile.user.email,
        'READER_ASSIGNMENT_CANCELLED' as any,
        {
          userName: assignment.readerProfile.user.name || 'Reader',
          bookTitle: assignment.book.title,
          reason: dto.reason,
          dashboardUrl: `${appUrl}/reader/assignments`,
        },
        assignment.readerProfile.userId,
        (assignment.readerProfile.user as any).preferredLanguage || 'EN',
      );
    } catch (error) {
      this.logger.error(`Failed to send cancellation email: ${error.message}`);
    }

    return {
      assignmentId,
      previousStatus: assignment.status,
      newStatus: AssignmentStatus.CANCELLED,
      reason: dto.reason,
      creditsRefunded,
    };
  }

  /**
   * Correct assignment errors
   */
  async correctAssignmentError(
    assignmentId: string,
    dto: CorrectAssignmentErrorDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: assignmentId },
      include: { book: true, readerProfile: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    let correctionResult: any = {};

    switch (dto.errorType) {
      case 'WRONG_FORMAT':
        // Toggle format if wrong format was assigned
        const newFormat = assignment.formatAssigned === 'EBOOK' ? 'AUDIOBOOK' : 'EBOOK';
        const newCreditsValue = newFormat === 'AUDIOBOOK' ? 2 : 1;
        correctionResult = await this.prisma.readerAssignment.update({
          where: { id: assignmentId },
          data: {
            formatAssigned: newFormat as any,
            creditsValue: newCreditsValue,
          },
        });
        break;

      case 'MISSING_CREDITS':
        // This would trigger credit allocation (handled separately)
        correctionResult = { message: 'Credit allocation needed - use credit allocation endpoint' };
        break;

      default:
        correctionResult = { message: 'Error logged for manual review' };
    }

    // Log the correction with the action taken
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: 'ADMIN' as any,
      action: 'assignment.error_corrected',
      entity: 'ReaderAssignment',
      entityId: assignmentId,
      description: `Error corrected: ${dto.errorType}. Action: ${dto.correctionAction}. Details: ${dto.description}`,
      ipAddress,
      severity: 'WARNING' as any,
    });

    return {
      assignmentId,
      errorType: dto.errorType,
      correctionAction: dto.correctionAction,
      description: dto.description,
      result: correctionResult,
    };
  }

  /**
   * Get all assignment exceptions
   */
  async getAssignmentExceptions(
    bookId?: string,
    readerProfileId?: string,
    limit: number = 50,
  ): Promise<AssignmentExceptionDto[]> {
    // Build where clause
    const whereClause: any = {
      OR: [
        { deadlineExtendedAt: { not: null } },
        { reassignedAt: { not: null } },
        { cancelledBy: { not: null } },
      ],
    };

    // Add optional filters
    if (bookId) {
      whereClause.bookId = bookId;
    }
    if (readerProfileId) {
      whereClause.readerProfileId = readerProfileId;
    }

    // Query assignments with exceptions (extended deadlines, reassignments, cancellations)
    const assignments = await this.prisma.readerAssignment.findMany({
      where: whereClause,
      include: {
        book: true,
        readerProfile: { include: { user: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return assignments.map((assignment) => {
      let exceptionType: 'EXPIRED' | 'DEADLINE_EXTENSION' | 'REASSIGNMENT' | 'CANCELLATION' | 'ERROR_CORRECTION' =
        'DEADLINE_EXTENSION';
      let createdAt = assignment.createdAt.toISOString();
      let reason = '';
      let status = 'pending';

      if (assignment.status === 'EXPIRED') {
        exceptionType = 'EXPIRED';
        status = 'overdue';
        reason = 'Assignment deadline expired';
      } else if (assignment.cancelledBy) {
        exceptionType = 'CANCELLATION';
        status = 'cancelled';
        reason = assignment.cancellationReason || 'No reason provided';
      } else if (assignment.reassignedAt) {
        exceptionType = 'REASSIGNMENT';
        status = 'reassigned';
        reason = assignment.reassignmentReason || 'No reason provided';
      } else if (assignment.deadlineExtendedAt) {
        exceptionType = 'DEADLINE_EXTENSION';
        status = 'extended';
        reason = assignment.extensionReason || 'No reason provided';
      }

      return {
        id: assignment.id,
        bookId: assignment.bookId,
        bookTitle: assignment.book.title,
        readerProfileId: assignment.readerProfileId,
        readerName: assignment.readerProfile.user.name || 'Unknown',
        exceptionType,
        reason,
        status,
        createdAt,
        resolvedAt: assignment.reassignedAt?.toISOString() || assignment.deadlineExtendedAt?.toISOString(),
      };
    });
  }
}
