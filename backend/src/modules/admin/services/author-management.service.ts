import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { LogSeverity, UserRole } from '@prisma/client';
import {
  SuspendAuthorDto,
  UnsuspendAuthorDto,
  UpdateAuthorNotesDto,
} from '../dto/author-management.dto';

/**
 * Service for admin author management operations
 */
@Injectable()
export class AuthorManagementService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Suspend an author account
   */
  async suspendAuthor(
    authorProfileId: string,
    dto: SuspendAuthorDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    if (author.isSuspended) {
      throw new BadRequestException('Author is already suspended');
    }

    // Update author profile
    const updatedAuthor = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedBy: adminUserId,
        suspendReason: dto.reason,
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'author.suspended',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        isSuspended: { before: false, after: true },
      },
      description: `Author ${author.user.email} suspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    return updatedAuthor;
  }

  /**
   * Unsuspend an author account
   */
  async unsuspendAuthor(
    authorProfileId: string,
    dto: UnsuspendAuthorDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    if (!author.isSuspended) {
      throw new BadRequestException('Author is not suspended');
    }

    // Update author profile
    const updatedAuthor = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: null,
        suspendReason: null,
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'author.unsuspended',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        isSuspended: { before: true, after: false },
      },
      description: `Author ${author.user.email} unsuspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return updatedAuthor;
  }

  /**
   * Update author admin notes
   */
  async updateAdminNotes(
    authorProfileId: string,
    dto: UpdateAuthorNotesDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    const updatedAuthor = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
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
      action: 'author.notes_updated',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      description: `Author ${author.user.email} admin notes updated`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return updatedAuthor;
  }
}
