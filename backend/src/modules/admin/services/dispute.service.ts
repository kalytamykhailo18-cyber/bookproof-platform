import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
import { UserRole } from '@prisma/client';

@Injectable()
export class DisputeService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Create a new dispute
   */
  async createDispute(
    dto: CreateDisputeDto,
    userId: string,
    userRole: UserRole,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.create({
      data: {
        userId,
        userRole,
        type: dto.type as any,
        description: dto.description,
        priority: (dto.priority || DisputePriority.MEDIUM) as any,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
        status: 'OPEN' as any,
      },
    });

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

    const updateData: any = {
      status: dto.status as any,
    };

    if (dto.adminNotes) {
      updateData.adminNotes = dto.adminNotes;
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });

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
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
    };
  }
}
