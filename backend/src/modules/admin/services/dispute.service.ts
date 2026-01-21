import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  CreateDisputeDto,
  ResolveDisputeDto,
  EscalateDisputeDto,
  UpdateDisputeStatusDto,
  GetDisputesQueryDto,
  DisputeResponseDto,
  DisputeStatus,
  DisputePriority,
} from '../dto/dispute.dto';
import { UserRole, AppealStatus } from '@prisma/client';

/**
 * SLA deadlines by priority (in hours)
 * Per requirements: 24 hours for standard, 4 hours for critical
 */
const SLA_HOURS_BY_PRIORITY: Record<string, number> = {
  LOW: 48,      // 48 hours for low priority
  MEDIUM: 24,   // 24 hours for standard
  HIGH: 8,      // 8 hours for high priority
  CRITICAL: 4,  // 4 hours for critical
};

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Calculate SLA deadline based on priority
   */
  private calculateSlaDeadline(priority: string): Date {
    const hours = SLA_HOURS_BY_PRIORITY[priority] || 24;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
  }

  /**
   * Track first response and check SLA breach
   */
  private async trackFirstResponse(dispute: any, adminUserId: string): Promise<{ firstResponseAt: Date; slaBreached: boolean }> {
    // If already responded, don't update
    if (dispute.firstResponseAt) {
      return { firstResponseAt: dispute.firstResponseAt, slaBreached: dispute.slaBreached };
    }

    const now = new Date();
    const slaBreached = dispute.slaDeadline ? now > dispute.slaDeadline : false;

    return { firstResponseAt: now, slaBreached };
  }

  /**
   * Create a new dispute with SLA deadline tracking
   */
  async createDispute(
    dto: CreateDisputeDto,
    userId: string,
    userRole: UserRole,
  ): Promise<DisputeResponseDto> {
    const priority = dto.priority || DisputePriority.MEDIUM;
    const slaDeadline = this.calculateSlaDeadline(priority);

    const dispute = await this.prisma.dispute.create({
      data: {
        userId,
        userRole,
        type: dto.type as any,
        description: dto.description,
        priority: priority as any,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
        status: 'OPEN' as any,
        slaDeadline,
        appealStatus: AppealStatus.NONE,
      },
    });

    this.logger.log(`Dispute ${dispute.id} created with SLA deadline: ${slaDeadline.toISOString()}`);

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'dispute.created',
      entity: 'Dispute',
      entityId: dispute.id,
      userId,
      userEmail: '', // Populated from context
      userRole,
      description: `Dispute created: ${dto.type}`,
      changes: {
        type: dto.type,
        priority: dto.priority || DisputePriority.MEDIUM,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
      },
    });

    return this.mapToResponseDto(dispute);
  }

  /**
   * Get all open disputes (admin)
   */
  async getOpenDisputes(): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] as any[],
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return disputes.map((d) => this.mapToResponseDto(d));
  }

  /**
   * Get disputes with filters
   */
  async getDisputes(query: GetDisputesQueryDto): Promise<DisputeResponseDto[]> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const disputes = await this.prisma.dispute.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return disputes.map((d) => this.mapToResponseDto(d));
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId: string): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return this.mapToResponseDto(dispute);
  }

  /**
   * Resolve a dispute
   */
  async resolveDispute(
    disputeId: string,
    dto: ResolveDisputeDto,
    adminUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
      throw new BadRequestException('Dispute is already resolved or rejected');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: (dto.status || DisputeStatus.RESOLVED) as any,
        resolution: dto.resolution,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'dispute.resolved',
      entity: 'Dispute',
      entityId: disputeId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Dispute resolved: ${dto.status || DisputeStatus.RESOLVED}`,
      changes: {
        previousStatus: dispute.status,
        newStatus: dto.status || DisputeStatus.RESOLVED,
        resolution: dto.resolution,
      },
    });

    return this.mapToResponseDto(updatedDispute);
  }

  /**
   * Escalate a dispute
   */
  async escalateDispute(
    disputeId: string,
    dto: EscalateDisputeDto,
    adminUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
      throw new BadRequestException('Cannot escalate a resolved or rejected dispute');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'ESCALATED' as any,
        escalatedBy: adminUserId,
        escalatedAt: new Date(),
        escalationReason: dto.reason,
        priority: 'CRITICAL' as any, // Escalated disputes become critical priority
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'dispute.escalated',
      entity: 'Dispute',
      entityId: disputeId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Dispute escalated: ${dto.reason}`,
      changes: {
        previousStatus: dispute.status,
        previousPriority: dispute.priority,
        escalationReason: dto.reason,
      },
    });

    return this.mapToResponseDto(updatedDispute);
  }

  /**
   * Update dispute status
   */
  async updateDisputeStatus(
    disputeId: string,
    dto: UpdateDisputeStatusDto,
    adminUserId: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Track first response time and SLA breach
    const { firstResponseAt, slaBreached } = await this.trackFirstResponse(dispute, adminUserId);

    const updateData: any = {
      status: dto.status as any,
      firstResponseAt: dispute.firstResponseAt || firstResponseAt,
      firstResponseBy: dispute.firstResponseBy || adminUserId,
      slaBreached: dispute.slaBreached || slaBreached,
    };

    if (dto.adminNotes) {
      updateData.adminNotes = dto.adminNotes;
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });

    // Log if SLA was breached
    if (slaBreached && !dispute.slaBreached) {
      this.logger.warn(`SLA breached for dispute ${disputeId}`);
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'dispute.status_updated',
      entity: 'Dispute',
      entityId: disputeId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Dispute status updated to ${dto.status}`,
      changes: {
        previousStatus: dispute.status,
        newStatus: dto.status,
        adminNotes: dto.adminNotes,
      },
    });

    return this.mapToResponseDto(updatedDispute);
  }

  /**
   * Get disputes by user
   */
  async getDisputesByUser(userId: string): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return disputes.map((d) => this.mapToResponseDto(d));
  }

  /**
   * Get dispute statistics for dashboard
   */
  async getDisputeStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    escalated: number;
    resolved: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const [
      total,
      open,
      inProgress,
      escalated,
      resolved,
      byType,
      byPriority,
    ] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.dispute.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.dispute.count({ where: { status: 'ESCALATED' } }),
      this.prisma.dispute.count({ where: { status: 'RESOLVED' } }),
      this.prisma.dispute.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.dispute.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
    ]);

    return {
      total,
      open,
      inProgress,
      escalated,
      resolved,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * File an appeal for a resolved dispute (one per issue)
   * Per requirements: User appeals allowed (one per issue)
   */
  async fileAppeal(
    disputeId: string,
    userId: string,
    appealReason: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Verify the user owns this dispute
    if (dispute.userId !== userId) {
      throw new BadRequestException('You can only appeal your own disputes');
    }

    // Check if dispute is resolved or rejected (can only appeal closed disputes)
    if (dispute.status !== 'RESOLVED' && dispute.status !== 'REJECTED') {
      throw new BadRequestException('Can only appeal resolved or rejected disputes');
    }

    // Check if user has already filed an appeal (one per issue)
    if (dispute.appealStatus && dispute.appealStatus !== AppealStatus.NONE) {
      throw new BadRequestException('You have already filed an appeal for this dispute. Only one appeal is allowed per issue.');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        appealedAt: new Date(),
        appealReason,
        appealStatus: AppealStatus.PENDING,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'dispute.appeal_filed',
      entity: 'Dispute',
      entityId: disputeId,
      userId,
      userEmail: '',
      userRole: dispute.userRole,
      description: `Appeal filed for dispute`,
      changes: {
        appealReason,
        previousAppealStatus: dispute.appealStatus,
      },
    });

    this.logger.log(`Appeal filed for dispute ${disputeId} by user ${userId}`);

    return this.mapToResponseDto(updatedDispute);
  }

  /**
   * Resolve an appeal (admin only)
   */
  async resolveAppeal(
    disputeId: string,
    adminUserId: string,
    approved: boolean,
    resolution: string,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.appealStatus !== AppealStatus.PENDING) {
      throw new BadRequestException('No pending appeal found for this dispute');
    }

    const newStatus = approved ? AppealStatus.APPROVED : AppealStatus.REJECTED;

    const updateData: any = {
      appealStatus: newStatus,
      appealResolvedBy: adminUserId,
      appealResolvedAt: new Date(),
      appealResolution: resolution,
    };

    // If appeal is approved, reopen the dispute
    if (approved) {
      updateData.status = 'IN_PROGRESS';
      updateData.resolution = null;
      updateData.resolvedAt = null;
      updateData.resolvedBy = null;
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: approved ? 'dispute.appeal_approved' : 'dispute.appeal_rejected',
      entity: 'Dispute',
      entityId: disputeId,
      userId: adminUserId,
      userEmail: '',
      userRole: UserRole.ADMIN,
      description: `Appeal ${approved ? 'approved' : 'rejected'}: ${resolution}`,
      changes: {
        appealStatus: newStatus,
        appealResolution: resolution,
        disputeReopened: approved,
      },
    });

    this.logger.log(`Appeal for dispute ${disputeId} ${approved ? 'approved' : 'rejected'} by admin ${adminUserId}`);

    return this.mapToResponseDto(updatedDispute);
  }

  /**
   * Get SLA statistics
   */
  async getSlaStats(): Promise<{
    totalWithSla: number;
    breached: number;
    complianceRate: number;
    averageResponseTimeHours: number;
    byPriority: {
      priority: string;
      total: number;
      breached: number;
      complianceRate: number;
    }[];
  }> {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const [totalWithSla, breached, responseTimes, priorityStats] = await Promise.all([
      this.prisma.dispute.count({
        where: { firstResponseAt: { not: null } },
      }),
      this.prisma.dispute.count({
        where: { slaBreached: true },
      }),
      this.prisma.dispute.findMany({
        where: { firstResponseAt: { not: null } },
        select: { createdAt: true, firstResponseAt: true },
      }),
      Promise.all(priorities.map(async (priority) => {
        const [total, priorityBreached] = await Promise.all([
          this.prisma.dispute.count({
            where: { priority: priority as any, firstResponseAt: { not: null } },
          }),
          this.prisma.dispute.count({
            where: { priority: priority as any, slaBreached: true },
          }),
        ]);
        return {
          priority,
          total,
          breached: priorityBreached,
          complianceRate: total > 0 ? Math.round(((total - priorityBreached) / total) * 100 * 100) / 100 : 100,
        };
      })),
    ]);

    const complianceRate = totalWithSla > 0
      ? ((totalWithSla - breached) / totalWithSla) * 100
      : 100;

    const averageResponseTimeHours = responseTimes.length > 0
      ? responseTimes.reduce((sum, d) => {
          const diff = (d.firstResponseAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60);
          return sum + diff;
        }, 0) / responseTimes.length
      : 0;

    return {
      totalWithSla,
      breached,
      complianceRate: Math.round(complianceRate * 100) / 100,
      averageResponseTimeHours: Math.round(averageResponseTimeHours * 100) / 100,
      byPriority: priorityStats,
    };
  }

  /**
   * Map Prisma dispute to response DTO
   */
  private mapToResponseDto(dispute: any): DisputeResponseDto {
    return {
      id: dispute.id,
      userId: dispute.userId,
      userRole: dispute.userRole,
      type: dispute.type,
      description: dispute.description,
      status: dispute.status,
      priority: dispute.priority,
      relatedEntityType: dispute.relatedEntityType,
      relatedEntityId: dispute.relatedEntityId,
      resolution: dispute.resolution,
      resolvedBy: dispute.resolvedBy,
      resolvedAt: dispute.resolvedAt,
      escalatedBy: dispute.escalatedBy,
      escalatedAt: dispute.escalatedAt,
      escalationReason: dispute.escalationReason,
      adminNotes: dispute.adminNotes,
      // SLA tracking fields
      firstResponseAt: dispute.firstResponseAt,
      firstResponseBy: dispute.firstResponseBy,
      slaDeadline: dispute.slaDeadline,
      slaBreached: dispute.slaBreached,
      // Appeal fields
      appealedAt: dispute.appealedAt,
      appealReason: dispute.appealReason,
      appealStatus: dispute.appealStatus,
      appealResolvedBy: dispute.appealResolvedBy,
      appealResolvedAt: dispute.appealResolvedAt,
      appealResolution: dispute.appealResolution,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }
}
