import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { LogSeverity, UserRole } from '@prisma/client';
import {
  SuspendReaderDto,
  UnsuspendReaderDto,
  AdjustWalletBalanceDto,
  UpdateReaderNotesDto,
} from '../dto/reader-management.dto';

/**
 * Service for admin reader management operations
 */
@Injectable()
export class ReaderManagementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Suspend a reader account
   */
  async suspendReader(
    readerProfileId: string,
    dto: SuspendReaderDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: { user: true },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    if (reader.isSuspended) {
      throw new BadRequestException('Reader is already suspended');
    }

    // Update reader profile
    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedBy: adminUserId,
        suspendReason: dto.reason,
        isActive: false, // Automatically deactivate when suspended
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.suspended',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      changes: {
        isSuspended: { before: false, after: true },
        isActive: { before: reader.isActive, after: false },
      },
      description: `Reader ${reader.user.email} suspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    return updatedReader;
  }

  /**
   * Unsuspend a reader account
   */
  async unsuspendReader(
    readerProfileId: string,
    dto: UnsuspendReaderDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: { user: true },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    if (!reader.isSuspended) {
      throw new BadRequestException('Reader is not suspended');
    }

    // Update reader profile
    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: null,
        suspendReason: null,
        isActive: true, // Reactivate when unsuspended
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.unsuspended',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      changes: {
        isSuspended: { before: true, after: false },
        isActive: { before: false, after: true },
      },
      description: `Reader ${reader.user.email} unsuspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return updatedReader;
  }

  /**
   * Adjust reader wallet balance (admin override)
   */
  async adjustWalletBalance(
    readerProfileId: string,
    dto: AdjustWalletBalanceDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: { user: true },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    const oldBalance = Number(reader.walletBalance);
    const adjustment = Number(dto.amount);
    const newBalance = oldBalance + adjustment;

    if (newBalance < 0) {
      throw new BadRequestException('Wallet balance cannot be negative');
    }

    // Update wallet balance and total earned if positive adjustment
    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        walletBalance: newBalance,
        totalEarned: adjustment > 0 ? { increment: adjustment } : undefined,
      },
      include: { user: true },
    });

    // Create wallet transaction record
    await this.prisma.walletTransaction.create({
      data: {
        readerProfileId,
        amount: adjustment,
        type: 'ADJUSTMENT',
        description: dto.reason,
        balanceBefore: oldBalance,
        balanceAfter: newBalance,
        performedBy: adminUserId,
        notes: dto.notes,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.wallet_adjusted',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      changes: {
        walletBalance: {
          before: oldBalance,
          after: newBalance,
        },
        adjustment,
      },
      description: `Reader ${reader.user.email} wallet adjusted by $${adjustment.toFixed(2)}. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    return updatedReader;
  }

  /**
   * Update reader admin notes
   */
  async updateAdminNotes(
    readerProfileId: string,
    dto: UpdateReaderNotesDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: { user: true },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        adminNotes: dto.adminNotes,
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.notes_updated',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      description: `Reader ${reader.user.email} admin notes updated`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return updatedReader;
  }
}
