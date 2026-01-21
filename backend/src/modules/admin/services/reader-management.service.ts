import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { LogSeverity, UserRole } from '@prisma/client';
import {
  SuspendReaderDto,
  UnsuspendReaderDto,
  AdjustWalletBalanceDto,
  UpdateReaderNotesDto,
  FlagReaderDto,
  UnflagReaderDto,
  AddAdminNoteDto,
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
   * Get all readers with filters
   */
  async getAllReaders(filters: {
    search?: string;
    status?: 'all' | 'active' | 'suspended' | 'flagged';
    contentPreference?: string;
    minReliabilityScore?: number;
    hasVerifiedAmazon?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    // Search filter
    if (filters.search) {
      where.OR = [
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      switch (filters.status) {
        case 'active':
          where.isActive = true;
          where.isSuspended = false;
          break;
        case 'suspended':
          where.isSuspended = true;
          break;
        case 'flagged':
          where.isFlagged = true;
          break;
      }
    }

    // Content preference filter
    if (filters.contentPreference && filters.contentPreference !== 'all') {
      where.contentPreference = filters.contentPreference;
    }

    // Reliability score filter
    if (filters.minReliabilityScore !== undefined) {
      where.reliabilityScore = { gte: filters.minReliabilityScore };
    }

    // Amazon verification filter
    if (filters.hasVerifiedAmazon !== undefined) {
      if (filters.hasVerifiedAmazon) {
        where.amazonProfiles = { some: { isVerified: true } };
      } else {
        where.amazonProfiles = { none: { isVerified: true } };
      }
    }

    const readers = await this.prisma.readerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isBanned: true,
            bannedAt: true,
            banReason: true,
            emailVerified: true,
          },
        },
        amazonProfiles: {
          select: { id: true, isVerified: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return readers.map((reader) => ({
      id: reader.id,
      userId: reader.userId,
      email: reader.user.email,
      name: reader.user.name,
      country: reader.country,
      language: reader.language,
      contentPreference: reader.contentPreference,
      walletBalance: Number(reader.walletBalance),
      totalEarned: Number(reader.totalEarned),
      totalWithdrawn: Number(reader.totalWithdrawn),
      reviewsCompleted: reader.reviewsCompleted,
      reviewsExpired: reader.reviewsExpired,
      reviewsRejected: reader.reviewsRejected,
      reliabilityScore: reader.reliabilityScore ? Number(reader.reliabilityScore) : 100,
      completionRate: reader.completionRate ? Number(reader.completionRate) : 100,
      isActive: reader.isActive,
      isFlagged: reader.isFlagged,
      flagReason: reader.flagReason,
      isBanned: reader.user.isBanned,
      emailVerified: reader.user.emailVerified,
      amazonProfilesCount: reader.amazonProfiles.length,
      verifiedAmazonProfiles: reader.amazonProfiles.filter((p) => p.isVerified).length,
      createdAt: reader.createdAt,
      lastActiveAt: reader.lastActiveAt,
    }));
  }

  /**
   * Get reader stats for admin dashboard
   */
  async getReaderStats() {
    const [
      totalReaders,
      activeReaders,
      suspendedReaders,
      flaggedReaders,
      walletStats,
      newReadersThisMonth,
    ] = await Promise.all([
      this.prisma.readerProfile.count(),
      this.prisma.readerProfile.count({ where: { isActive: true, isSuspended: false } }),
      this.prisma.readerProfile.count({ where: { isSuspended: true } }),
      this.prisma.readerProfile.count({ where: { isFlagged: true } }),
      this.prisma.readerProfile.aggregate({
        _sum: { walletBalance: true },
        _avg: { reliabilityScore: true, completionRate: true },
      }),
      this.prisma.readerProfile.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Get pending payouts
    const pendingPayouts = await this.prisma.payoutRequest.count({
      where: { status: 'PENDING' },
    });

    return {
      totalReaders,
      activeReaders,
      suspendedReaders,
      flaggedReaders,
      newReadersThisMonth,
      totalWalletBalance: walletStats._sum.walletBalance ? Number(walletStats._sum.walletBalance) : 0,
      pendingPayouts,
      averageReliabilityScore: walletStats._avg.reliabilityScore ? Number(walletStats._avg.reliabilityScore) : 100,
      averageCompletionRate: walletStats._avg.completionRate ? Number(walletStats._avg.completionRate) : 100,
    };
  }

  /**
   * Get reader details by ID (including user-level data for Section 5.2)
   */
  async getReaderDetails(readerProfileId: string) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isBanned: true,
            bannedAt: true,
            banReason: true,
            emailVerified: true,
          },
        },
        amazonProfiles: true,
        assignments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            book: { select: { id: true, title: true } },
          },
        },
        walletTransactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        payoutRequests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdByUser: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    return {
      id: reader.id,
      userId: reader.userId,
      email: reader.user.email,
      name: reader.user.name,
      country: reader.country,
      language: reader.language,
      contentPreference: reader.contentPreference,
      preferredGenres: reader.preferredGenres,
      walletBalance: Number(reader.walletBalance),
      totalEarned: Number(reader.totalEarned),
      totalWithdrawn: Number(reader.totalWithdrawn),
      reviewsCompleted: reader.reviewsCompleted,
      reviewsExpired: reader.reviewsExpired,
      reviewsRejected: reader.reviewsRejected,
      reliabilityScore: reader.reliabilityScore ? Number(reader.reliabilityScore) : 100,
      completionRate: reader.completionRate ? Number(reader.completionRate) : 100,
      isActive: reader.isActive,
      isFlagged: reader.isFlagged,
      flagReason: reader.flagReason,
      // User-level fields (Section 5.2)
      isBanned: reader.user.isBanned,
      bannedAt: reader.user.bannedAt,
      banReason: reader.user.banReason,
      emailVerified: reader.user.emailVerified,
      amazonProfilesCount: reader.amazonProfiles.length,
      verifiedAmazonProfiles: reader.amazonProfiles.filter((p) => p.isVerified).length,
      amazonProfiles: reader.amazonProfiles.map((p) => ({
        id: p.id,
        profileUrl: p.profileUrl,
        profileName: p.profileName,
        isVerified: p.isVerified,
        verifiedAt: p.verifiedAt,
        createdAt: p.createdAt,
      })),
      recentAssignments: reader.assignments.map((a) => ({
        id: a.id,
        bookId: a.bookId,
        bookTitle: a.book.title,
        format: a.formatAssigned,
        status: a.status,
        assignedAt: a.createdAt,
        submittedAt: a.submittedAt,
        deadline: a.reviewDeadline,
      })),
      walletTransactions: reader.walletTransactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
      payoutHistory: reader.payoutRequests.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        paymentMethod: p.paymentMethod,
        requestedAt: p.createdAt,
        processedAt: p.processedAt,
      })),
      adminNotes: reader.adminNotes.map((n) => ({
        id: n.id,
        content: n.content,
        createdBy: n.createdBy,
        createdByName: n.createdByUser?.name || n.createdByUser?.email || 'Admin',
        createdAt: n.createdAt,
      })),
      createdAt: reader.createdAt,
      lastActiveAt: reader.lastActiveAt,
    };
  }

  /**
   * Get reader review history
   */
  async getReaderReviewHistory(
    readerProfileId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const reader = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
    });

    if (!reader) {
      throw new NotFoundException('Reader profile not found');
    }

    const [reviews, total] = await Promise.all([
      this.prisma.queueAssignment.findMany({
        where: {
          readerProfileId,
          status: {
            in: ['SUBMITTED', 'VALIDATED', 'REJECTED', 'COMPLETED'],
          },
        },
        include: {
          book: { select: { id: true, title: true } },
          review: { select: { id: true, rating: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.queueAssignment.count({
        where: {
          readerProfileId,
          status: {
            in: ['SUBMITTED', 'VALIDATED', 'REJECTED', 'COMPLETED'],
          },
        },
      }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        bookId: r.book.id,
        bookTitle: r.book.title,
        rating: r.review?.rating || 0,
        status: r.status,
        submittedAt: r.submittedAt,
        validatedAt: r.validatedAt,
      })),
      total,
    };
  }

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

  /**
   * Flag a reader for attention
   */
  async flagReader(
    readerProfileId: string,
    dto: FlagReaderDto,
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

    if (reader.isFlagged) {
      throw new BadRequestException('Reader is already flagged');
    }

    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        isFlagged: true,
        flagReason: dto.reason,
        flaggedAt: new Date(),
        flaggedBy: adminUserId,
      },
      include: { user: true },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.flagged',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      changes: { isFlagged: { before: false, after: true } },
      description: `Reader ${reader.user.email} flagged. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    return this.getReaderDetails(readerProfileId);
  }

  /**
   * Remove flag from a reader
   */
  async unflagReader(
    readerProfileId: string,
    dto: UnflagReaderDto,
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

    if (!reader.isFlagged) {
      throw new BadRequestException('Reader is not flagged');
    }

    const updatedReader = await this.prisma.readerProfile.update({
      where: { id: readerProfileId },
      data: {
        isFlagged: false,
        flagReason: null,
        flaggedAt: null,
        flaggedBy: null,
      },
      include: { user: true },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.unflagged',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      changes: { isFlagged: { before: true, after: false } },
      description: `Reader ${reader.user.email} unflagged. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return this.getReaderDetails(readerProfileId);
  }

  /**
   * Add admin note to reader
   */
  async addAdminNote(
    readerProfileId: string,
    dto: AddAdminNoteDto,
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

    await this.prisma.readerAdminNote.create({
      data: {
        readerProfileId,
        content: dto.content,
        createdBy: adminUserId,
      },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.note_added',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      description: `Admin note added to reader ${reader.user.email}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return this.getReaderDetails(readerProfileId);
  }

  /**
   * Delete admin note from reader
   */
  async deleteAdminNote(
    readerProfileId: string,
    noteId: string,
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

    const note = await this.prisma.readerAdminNote.findFirst({
      where: { id: noteId, readerProfileId },
    });

    if (!note) {
      throw new NotFoundException('Admin note not found');
    }

    await this.prisma.readerAdminNote.delete({
      where: { id: noteId },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.note_deleted',
      entity: 'ReaderProfile',
      entityId: readerProfileId,
      description: `Admin note deleted from reader ${reader.user.email}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return this.getReaderDetails(readerProfileId);
  }

  /**
   * Manually verify Amazon profile
   */
  async verifyAmazonProfile(
    readerProfileId: string,
    amazonProfileId: string,
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

    const amazonProfile = await this.prisma.amazonProfile.findFirst({
      where: { id: amazonProfileId, readerProfileId },
    });

    if (!amazonProfile) {
      throw new NotFoundException('Amazon profile not found');
    }

    if (amazonProfile.isVerified) {
      throw new BadRequestException('Amazon profile is already verified');
    }

    await this.prisma.amazonProfile.update({
      where: { id: amazonProfileId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
      },
    });

    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'reader.amazon_verified',
      entity: 'AmazonProfile',
      entityId: amazonProfileId,
      changes: { isVerified: { before: false, after: true } },
      description: `Amazon profile manually verified for reader ${reader.user.email}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return this.getReaderDetails(readerProfileId);
  }
}
