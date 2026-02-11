import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole, LogSeverity } from '@prisma/client';

/**
 * Service for audit logging all admin actions and critical operations
 */
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an admin action with full context
   */
  async logAdminAction(params: {
    userId: string | null;
    userEmail: string;
    userRole: UserRole;
    action: string;
    entity: string;
    entityId?: string;
    changes?: Record<string, any>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: LogSeverity;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        userEmail: params.userEmail,
        userRole: params.userRole,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        changes: params.changes ? JSON.stringify(params.changes) : null,
        description: params.description,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        severity: params.severity || LogSeverity.INFO,
      },
    });
  }

  /**
   * Log campaign pause action
   */
  async logCampaignPause(
    bookId: string,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'campaign.paused',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign paused. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });
  }

  /**
   * Log campaign resume action
   */
  async logCampaignResume(
    bookId: string,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'campaign.resumed',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign resumed. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });
  }

  /**
   * Log distribution adjustment
   */
  async logDistributionAdjustment(
    bookId: string,
    oldValue: number,
    newValue: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'campaign.distribution_adjusted',
      entity: 'Book',
      entityId: bookId,
      changes: {
        field: 'reviewsPerWeek',
        before: oldValue,
        after: newValue,
      },
      description: `Weekly distribution adjusted from ${oldValue} to ${newValue}. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log manual credit addition
   */
  async logCreditAddition(
    authorProfileId: string,
    creditsAdded: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'credits.added',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        creditsAdded,
      },
      description: `Manual credit addition: ${creditsAdded} credits. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log manual credit removal
   */
  async logCreditRemoval(
    authorProfileId: string,
    creditsRemoved: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'credits.removed',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        creditsRemoved,
      },
      description: `Manual credit removal: ${creditsRemoved} credits. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log credit allocation to campaign
   */
  async logCreditAllocation(
    bookId: string,
    creditsAllocated: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'credits.allocated',
      entity: 'Book',
      entityId: bookId,
      changes: {
        creditsAllocated,
      },
      description: `Manual credit allocation to campaign: ${creditsAllocated} credits. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });
  }

  /**
   * Log deadline extension
   */
  async logDeadlineExtension(
    assignmentId: string,
    extensionHours: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'assignment.deadline_extended',
      entity: 'ReaderAssignment',
      entityId: assignmentId,
      changes: {
        extensionHours,
      },
      description: `Deadline extended by ${extensionHours} hours. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });
  }

  /**
   * Log reader reassignment
   */
  async logReassignment(
    assignmentId: string,
    oldBookId: string,
    newBookId: string,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'assignment.reassigned',
      entity: 'ReaderAssignment',
      entityId: assignmentId,
      changes: {
        oldBookId,
        newBookId,
      },
      description: `Reader reassigned to different book. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log bulk reassignment
   */
  async logBulkReassignment(
    assignmentIds: string[],
    targetBookId: string,
    reason: string,
    successCount: number,
    failureCount: number,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'assignment.bulk_reassigned',
      entity: 'ReaderAssignment',
      changes: {
        assignmentCount: assignmentIds.length,
        targetBookId,
        successCount,
        failureCount,
      },
      description: `Bulk reassignment: ${assignmentIds.length} assignments to book ${targetBookId}. Success: ${successCount}, Failed: ${failureCount}. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log assignment cancellation
   */
  async logAssignmentCancellation(
    assignmentId: string,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'assignment.cancelled',
      entity: 'ReaderAssignment',
      entityId: assignmentId,
      description: `Assignment cancelled. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log overbooking adjustment
   */
  async logOverbookingAdjustment(
    bookId: string,
    oldPercent: number,
    newPercent: number,
    reason: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'campaign.overbooking_adjusted',
      entity: 'Book',
      entityId: bookId,
      changes: {
        field: 'overBookingPercent',
        before: oldPercent,
        after: newPercent,
      },
      description: `Overbooking percentage adjusted from ${oldPercent}% to ${newPercent}%. Reason: ${reason}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });
  }

  /**
   * Log manual coupon application
   */
  async logCouponManualApply(
    couponId: string,
    couponCode: string,
    userId: string,
    targetPurchaseId: string | null,
    targetResearchId: string | null,
    discountApplied: number,
    adminNote: string | undefined,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'coupon.manual_apply',
      entity: 'Coupon',
      entityId: couponId,
      changes: {
        couponCode,
        appliedToUserId: userId,
        creditPurchaseId: targetPurchaseId,
        keywordResearchId: targetResearchId,
        discountApplied,
      },
      description: `Coupon '${couponCode}' manually applied to user ${userId}. Discount: $${discountApplied.toFixed(2)}.${adminNote ? ` Note: ${adminNote}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Log setting change
   */
  async logSettingChange(
    settingKey: string,
    oldValue: string,
    newValue: string,
    reason: string | undefined,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'setting.updated',
      entity: 'SystemSetting',
      entityId: settingKey,
      changes: {
        field: settingKey,
        before: oldValue,
        after: newValue,
      },
      description: `Setting '${settingKey}' updated from '${oldValue}' to '${newValue}'${reason ? `. Reason: ${reason}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getAuditLogsForEntity(entity: string, entityId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get recent admin actions
   */
  async getRecentAdminActions(limit: number = 20) {
    return this.prisma.auditLog.findMany({
      where: {
        userRole: UserRole.ADMIN,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByAction(action: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        action,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs by severity
   */
  async getAuditLogsBySeverity(severity: LogSeverity, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        severity,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get audit logs for specific admin user
   */
  async getAuditLogsByUser(userId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
