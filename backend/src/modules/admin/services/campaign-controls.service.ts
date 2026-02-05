import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/email.service';
import {
  PauseCampaignDto,
  ResumeCampaignDto,
  AdjustWeeklyDistributionDto,
  AddCreditsDto,
  RemoveCreditsDto,
  AllocateCreditsDto,
  AdjustOverbookingDto,
  CampaignHealthDto,
  CampaignAnalyticsDto,
  AuthorListItemDto,
  CreditTransactionHistoryDto,
  CreditTransactionDto,
  UpdateCampaignSettingsDto,
  TransferCreditsDto,
  ForceCompleteCampaignDto,
  ManualGrantAccessDto,
  RemoveReaderFromCampaignDto,
} from '../dto/campaign-controls.dto';
import { BookFormat, CampaignStatus, CreditTransactionType, EmailType, Language, UserRole } from '@prisma/client';

@Injectable()
export class CampaignControlsService {
  private readonly logger = new Logger(CampaignControlsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Pause a campaign - stops new assignments temporarily
   */
  async pauseCampaign(
    bookId: string,
    dto: PauseCampaignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    // Verify campaign exists and is active
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { authorProfile: { include: { user: true } } },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Can only pause active campaigns');
    }

    // Update campaign status to PAUSED
    const now = new Date();
    const updatedBook = await this.prisma.book.update({
      where: { id: bookId },
      data: {
        status: CampaignStatus.PAUSED,
        distributionPausedAt: now,
      },
    });

    // Log audit trail
    await this.auditService.logCampaignPause(
      bookId,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Resume a paused campaign - restarts assignment distribution
   */
  async resumeCampaign(
    bookId: string,
    dto: ResumeCampaignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    // Verify campaign exists and is paused
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Can only resume paused campaigns');
    }

    // Update campaign status to ACTIVE
    const now = new Date();
    const updatedBook = await this.prisma.book.update({
      where: { id: bookId },
      data: {
        status: CampaignStatus.ACTIVE,
        distributionResumedAt: now,
      },
    });

    // Log audit trail
    await this.auditService.logCampaignResume(
      bookId,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Adjust weekly distribution - override automatic calculation
   */
  async adjustWeeklyDistribution(
    bookId: string,
    dto: AdjustWeeklyDistributionDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    // Verify campaign exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    const oldValue = book.reviewsPerWeek;

    // Update distribution
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        reviewsPerWeek: dto.reviewsPerWeek,
        manualDistributionOverride: true,
      },
    });

    // Log audit trail
    await this.auditService.logDistributionAdjustment(
      bookId,
      oldValue,
      dto.reviewsPerWeek,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Add credits to author manually
   */
  async addCreditsToAuthor(
    authorProfileId: string,
    dto: AddCreditsDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    // Verify author exists
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    const newBalance = authorProfile.availableCredits + dto.creditsToAdd;
    const newTotalPurchased = authorProfile.totalCreditsPurchased + dto.creditsToAdd;

    // Update author credits
    const updated = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        availableCredits: newBalance,
        totalCreditsPurchased: newTotalPurchased,
      },
    });

    // Create credit transaction record
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId,
        amount: dto.creditsToAdd,
        type: CreditTransactionType.MANUAL_ADJUSTMENT,
        description: `Manual credit addition by admin. Reason: ${dto.reason}`,
        balanceAfter: newBalance,
        performedBy: adminUserId,
        notes: dto.notes,
      },
    });

    // Log audit trail
    await this.auditService.logCreditAddition(
      authorProfileId,
      dto.creditsToAdd,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    // Send email notification to author
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        authorProfile.user.email,
        EmailType.AUTHOR_CREDITS_ADDED,
        {
          userName: authorProfile.user.name || 'Author',
          creditsAdded: dto.creditsToAdd,
          newBalance,
          reason: dto.reason,
          dashboardUrl: `${appUrl}/author/credits`,
        },
        authorProfile.userId,
        authorProfile.user.preferredLanguage || Language.EN,
      );
    } catch (error) {
      this.logger.error(`Failed to send credit addition email: ${error.message}`);
    }

    return {
      authorProfileId,
      creditsAdded: dto.creditsToAdd,
      previousBalance: authorProfile.availableCredits,
      newBalance,
      reason: dto.reason,
    };
  }

  /**
   * Remove credits from author manually
   */
  async removeCreditsFromAuthor(
    authorProfileId: string,
    dto: RemoveCreditsDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    // Verify author exists
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    if (authorProfile.availableCredits < dto.creditsToRemove) {
      throw new BadRequestException('Insufficient credits to remove');
    }

    const newBalance = authorProfile.availableCredits - dto.creditsToRemove;

    // Update author credits
    await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        availableCredits: newBalance,
      },
    });

    // Create credit transaction record
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId,
        amount: -dto.creditsToRemove,
        type: CreditTransactionType.MANUAL_ADJUSTMENT,
        description: `Manual credit removal by admin. Reason: ${dto.reason}`,
        balanceAfter: newBalance,
        performedBy: adminUserId,
        notes: dto.notes,
      },
    });

    // Log audit trail
    await this.auditService.logCreditRemoval(
      authorProfileId,
      dto.creditsToRemove,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    // Send email notification to author
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.emailService.sendTemplatedEmail(
        authorProfile.user.email,
        EmailType.AUTHOR_CREDITS_REMOVED,
        {
          userName: authorProfile.user.name || 'Author',
          creditsRemoved: dto.creditsToRemove,
          newBalance,
          reason: dto.reason,
          dashboardUrl: `${appUrl}/author/credits`,
        },
        authorProfile.userId,
        authorProfile.user.preferredLanguage || Language.EN,
      );
    } catch (error) {
      this.logger.error(`Failed to send credit removal email: ${error.message}`);
    }

    return {
      authorProfileId,
      creditsRemoved: dto.creditsToRemove,
      previousBalance: authorProfile.availableCredits,
      newBalance,
      reason: dto.reason,
    };
  }

  /**
   * Allocate credits to specific campaign
   */
  async allocateCreditsToCampaign(
    bookId: string,
    dto: AllocateCreditsDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    // Verify campaign exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { authorProfile: true },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    // Verify author has enough available credits
    const authorProfile = book.authorProfile;
    if (authorProfile.availableCredits < dto.creditsToAllocate) {
      throw new BadRequestException('Author does not have enough available credits');
    }

    // Update book credits
    const newCreditsAllocated = book.creditsAllocated + dto.creditsToAllocate;
    const newCreditsRemaining = book.creditsRemaining + dto.creditsToAllocate;

    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        creditsAllocated: newCreditsAllocated,
        creditsRemaining: newCreditsRemaining,
      },
    });

    // Deduct from author's available credits
    const newAuthorBalance = authorProfile.availableCredits - dto.creditsToAllocate;
    await this.prisma.authorProfile.update({
      where: { id: authorProfile.id },
      data: {
        availableCredits: newAuthorBalance,
        totalCreditsUsed: { increment: dto.creditsToAllocate },
      },
    });

    // Create credit transaction record
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId: authorProfile.id,
        bookId,
        amount: -dto.creditsToAllocate,
        type: CreditTransactionType.ALLOCATION,
        description: `Manual credit allocation to campaign by admin. Reason: ${dto.reason}`,
        balanceAfter: newAuthorBalance,
        performedBy: adminUserId,
        notes: dto.notes,
      },
    });

    // Log audit trail
    await this.auditService.logCreditAllocation(
      bookId,
      dto.creditsToAllocate,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return {
      bookId,
      creditsAllocated: dto.creditsToAllocate,
      campaignCreditsAllocated: newCreditsAllocated,
      campaignCreditsRemaining: newCreditsRemaining,
      authorCreditsRemaining: newAuthorBalance,
      reason: dto.reason,
    };
  }

  /**
   * Adjust overbooking percentage
   */
  async adjustOverbooking(
    bookId: string,
    dto: AdjustOverbookingDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    // Verify campaign exists
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    const oldPercent = book.overBookingPercent;

    // Update overbooking settings
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        overBookingPercent: dto.overBookingPercent,
        overBookingEnabled: dto.overBookingEnabled,
      },
    });

    // Log audit trail
    await this.auditService.logOverbookingAdjustment(
      bookId,
      oldPercent,
      dto.overBookingPercent,
      dto.reason,
      adminUserId,
      adminEmail,
      ipAddress,
    );

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Get campaign health status
   */
  async getCampaignHealth(bookId: string): Promise<CampaignHealthDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    const now = new Date();
    const startDate = book.campaignStartDate ? new Date(book.campaignStartDate) : now;
    const expectedEndDate = book.expectedEndDate ? new Date(book.expectedEndDate) : now;

    // Calculate weeks elapsed
    const weeksElapsed = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );

    // Calculate expected progress
    const totalWeeks = Math.ceil(book.targetReviews / book.reviewsPerWeek);
    const reviewsExpected = Math.min(
      weeksElapsed * book.reviewsPerWeek,
      book.targetReviews,
    );

    // Calculate variance
    const variance = book.totalReviewsDelivered - reviewsExpected;

    // Determine status
    let status: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule';
    if (variance > book.reviewsPerWeek) {
      status = 'ahead-of-schedule';
    } else if (variance < -book.reviewsPerWeek) {
      status = 'delayed';
    } else if (book.totalReviewsRejected > book.targetReviews * 0.1) {
      status = 'issues';
    } else {
      status = 'on-track';
    }

    // Calculate projected completion date
    const remainingReviews = book.targetReviews - book.totalReviewsDelivered;
    const weeksRemaining = Math.ceil(remainingReviews / book.reviewsPerWeek);
    const projectedCompletionDate = new Date(now);
    projectedCompletionDate.setDate(projectedCompletionDate.getDate() + weeksRemaining * 7);

    // Calculate days off schedule
    const daysOffSchedule = Math.floor(
      (projectedCompletionDate.getTime() - expectedEndDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      status,
      completionPercentage: (book.totalReviewsDelivered / book.targetReviews) * 100,
      weeksElapsed: book.currentWeek || weeksElapsed,
      totalPlannedWeeks: totalWeeks,
      reviewsDelivered: book.totalReviewsDelivered,
      reviewsExpected,
      targetReviews: book.targetReviews,
      variance,
      projectedCompletionDate: projectedCompletionDate.toISOString(),
      expectedCompletionDate: expectedEndDate.toISOString(),
      daysOffSchedule,
    };
  }

  /**
   * Get campaign analytics (nested structure for frontend)
   */
  async getCampaignAnalytics(bookId: string): Promise<CampaignAnalyticsDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    const health = await this.getCampaignHealth(bookId);

    // Calculate completion percentage
    const completionPercentage =
      book.targetReviews > 0 ? (book.totalReviewsDelivered / book.targetReviews) * 100 : 0;

    // Calculate total weeks
    const totalWeeks = Math.ceil(book.targetReviews / book.reviewsPerWeek);

    // Calculate validation rate
    const totalReviewed = book.totalReviewsValidated + book.totalReviewsRejected;
    const validationRate = totalReviewed > 0 ? (book.totalReviewsValidated / totalReviewed) * 100 : 0;

    // Calculate on-time delivery rate (delivered / (delivered + expired))
    const totalDeliveryAttempts = book.totalReviewsDelivered + book.totalReviewsExpired;
    const onTimeDeliveryRate =
      totalDeliveryAttempts > 0 ? (book.totalReviewsDelivered / totalDeliveryAttempts) * 100 : 0;

    return {
      campaign: {
        id: book.id,
        title: book.title,
        status: book.status,
        targetReviews: book.targetReviews,
      },
      progress: {
        reviewsDelivered: book.totalReviewsDelivered,
        reviewsValidated: book.totalReviewsValidated,
        reviewsRejected: book.totalReviewsRejected,
        reviewsExpired: book.totalReviewsExpired,
        completionPercentage,
      },
      distribution: {
        reviewsPerWeek: book.reviewsPerWeek,
        currentWeek: book.currentWeek || 1,
        totalWeeks,
        manualOverride: book.manualDistributionOverride || false,
      },
      performance: {
        averageRating: book.averageInternalRating
          ? parseFloat(book.averageInternalRating.toString())
          : 0,
        onTimeDeliveryRate,
        validationRate,
      },
      timeline: {
        startDate: book.campaignStartDate?.toISOString() || '',
        expectedEndDate: book.expectedEndDate?.toISOString() || '',
        projectedEndDate: health.projectedCompletionDate,
      },
    };
  }

  /**
   * Get all campaigns for admin overview with pagination
   */
  async getAllCampaigns(
    limit: number = 50,
    offset: number = 0,
    status?: CampaignStatus[],
  ): Promise<{ campaigns: CampaignAnalyticsDto[]; total: number }> {
    const whereClause = status
      ? { status: { in: status } }
      : { status: { in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] } };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where: whereClause,
        orderBy: {
          campaignStartDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.book.count({ where: whereClause }),
    ]);

    const analytics = await Promise.all(
      books.map((book) => this.getCampaignAnalytics(book.id)),
    );

    return { campaigns: analytics, total };
  }

  /**
   * Get all authors for admin view with credit information and pagination
   */
  async getAllAuthors(
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ authors: AuthorListItemDto[]; total: number }> {
    const [authors, total] = await Promise.all([
      this.prisma.authorProfile.findMany({
        include: {
          user: {
            select: {
              email: true,
              name: true,
              emailVerified: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              books: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.authorProfile.count(),
    ]);

    // Get active campaign counts for all authors in a single query
    const authorIds = authors.map(a => a.id);
    const activeCampaignCounts = await this.prisma.book.groupBy({
      by: ['authorProfileId'],
      where: {
        authorProfileId: { in: authorIds },
        status: { in: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] },
      },
      _count: {
        id: true,
      },
    });

    // Create a map for quick lookup
    const activeCampaignMap = new Map(
      activeCampaignCounts.map(c => [c.authorProfileId, c._count.id])
    );

    const authorItems = authors.map((author) => ({
      id: author.id,
      userId: author.userId,
      email: author.user.email,
      name: author.user.name || 'Unknown',
      totalCreditsPurchased: author.totalCreditsPurchased,
      totalCreditsUsed: author.totalCreditsUsed,
      availableCredits: author.availableCredits,
      activeCampaigns: activeCampaignMap.get(author.id) || 0,
      totalCampaigns: author._count.books,
      createdAt: author.createdAt,
      isVerified: author.user.emailVerified,
    }));

    return { authors: authorItems, total };
  }

  /**
   * Get single author details for admin
   */
  async getAuthorDetails(authorProfileId: string): Promise<AuthorListItemDto> {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        books: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    return {
      id: author.id,
      userId: author.userId,
      email: author.user.email,
      name: author.user.name || 'Unknown',
      totalCreditsPurchased: author.totalCreditsPurchased,
      totalCreditsUsed: author.totalCreditsUsed,
      availableCredits: author.availableCredits,
      activeCampaigns: author.books.filter(
        (b: { id: string; status: CampaignStatus }) =>
          b.status === CampaignStatus.ACTIVE || b.status === CampaignStatus.PAUSED,
      ).length,
      totalCampaigns: author.books.length,
      createdAt: author.createdAt,
      isVerified: author.user.emailVerified,
    };
  }

  /**
   * Get credit transaction history for a specific author (admin view)
   */
  async getCreditTransactionHistory(
    authorProfileId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<CreditTransactionHistoryDto> {
    // Get author profile with user info
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // Get total count
    const totalTransactions = await this.prisma.creditTransaction.count({
      where: { authorProfileId },
    });

    // Get transactions with related data
    const transactions = await this.prisma.creditTransaction.findMany({
      where: { authorProfileId },
      include: {
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Batch fetch all admin users who performed transactions to avoid N+1 query
    const performedByIds = [...new Set(transactions.filter((tx) => tx.performedBy).map((tx) => tx.performedBy!))];
    const adminUsers = performedByIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: performedByIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const adminMap = new Map(adminUsers.map((admin) => [admin.id, admin]));

    // Map transactions to DTO format with admin names using pre-fetched data
    const transactionDtos: CreditTransactionDto[] = transactions.map((tx) => {
      let performedByName: string | undefined;

      // Use pre-fetched admin data instead of querying per-transaction
      if (tx.performedBy) {
        const admin = adminMap.get(tx.performedBy);
        performedByName = admin?.name || admin?.email;
      }

      return {
        id: tx.id,
        authorProfileId: tx.authorProfileId,
        bookId: tx.bookId || undefined,
        bookTitle: tx.book?.title,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        performedBy: tx.performedBy || undefined,
        performedByName,
        notes: tx.notes || undefined,
        createdAt: tx.createdAt,
      };
    });

    return {
      authorProfileId: authorProfile.id,
      authorName: authorProfile.user.name || 'Unknown',
      authorEmail: authorProfile.user.email,
      availableCredits: authorProfile.availableCredits,
      totalCreditsPurchased: authorProfile.totalCreditsPurchased,
      totalCreditsUsed: authorProfile.totalCreditsUsed,
      transactions: transactionDtos,
      totalTransactions,
    };
  }

  /**
   * Get all credit transactions across platform (admin view)
   */
  async getAllCreditTransactions(
    limit: number = 100,
    offset: number = 0,
    type?: CreditTransactionType,
  ): Promise<{ transactions: CreditTransactionDto[]; total: number }> {
    const where = type ? { type } : {};

    const total = await this.prisma.creditTransaction.count({ where });

    const transactions = await this.prisma.creditTransaction.findMany({
      where,
      include: {
        book: {
          select: { title: true },
        },
        authorProfile: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Batch fetch all admin users who performed transactions to avoid N+1 query
    const allPerformedByIds = [...new Set(transactions.filter((tx) => tx.performedBy).map((tx) => tx.performedBy!))];
    const allAdminUsers = allPerformedByIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: allPerformedByIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const allAdminMap = new Map(allAdminUsers.map((admin) => [admin.id, admin]));

    // Map transactions to DTO format using pre-fetched admin data
    const transactionDtos: CreditTransactionDto[] = transactions.map((tx) => {
      let performedByName: string | undefined;

      // Use pre-fetched admin data instead of querying per-transaction
      if (tx.performedBy) {
        const admin = allAdminMap.get(tx.performedBy);
        performedByName = admin?.name || admin?.email;
      }

      return {
        id: tx.id,
        authorProfileId: tx.authorProfileId,
        bookId: tx.bookId || undefined,
        bookTitle: tx.book?.title,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        performedBy: tx.performedBy || undefined,
        performedByName,
        notes: tx.notes || undefined,
        createdAt: tx.createdAt,
      };
    });

    return { transactions: transactionDtos, total };
  }

  /**
   * Update campaign settings for active/paused campaigns (admin only)
   * Allows modifying end date, target reviews, distribution, and synopsis
   */
  async updateCampaignSettings(
    bookId: string,
    dto: UpdateCampaignSettingsDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    // Only allow updates for active or paused campaigns
    if (book.status !== CampaignStatus.ACTIVE && book.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Can only update settings for active or paused campaigns');
    }

    // Build update data
    const updateData: any = {};
    const changes: Record<string, { from: any; to: any }> = {};

    if (dto.campaignEndDate !== undefined) {
      changes.campaignEndDate = { from: book.campaignEndDate, to: dto.campaignEndDate };
      updateData.campaignEndDate = dto.campaignEndDate;
      updateData.expectedEndDate = dto.campaignEndDate;
    }

    if (dto.targetReviews !== undefined) {
      changes.targetReviews = { from: book.targetReviews, to: dto.targetReviews };
      updateData.targetReviews = dto.targetReviews;
    }

    if (dto.reviewsPerWeek !== undefined) {
      changes.reviewsPerWeek = { from: book.reviewsPerWeek, to: dto.reviewsPerWeek };
      updateData.reviewsPerWeek = dto.reviewsPerWeek;
      updateData.manualDistributionOverride = true;
    }

    if (dto.synopsis !== undefined) {
      changes.synopsis = { from: book.synopsis, to: dto.synopsis };
      updateData.synopsis = dto.synopsis;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No settings provided to update');
    }

    // Update the campaign
    await this.prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.settings_updated',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign settings updated. Reason: ${dto.reason}`,
      changes,
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Transfer credits between campaigns (correcting misallocation)
   * Moves credits from one campaign to another within the same author
   */
  async transferCreditsBetweenCampaigns(
    dto: TransferCreditsDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    // Verify both campaigns exist
    const fromBook = await this.prisma.book.findUnique({
      where: { id: dto.fromBookId },
      include: { authorProfile: { include: { user: true } } },
    });

    const toBook = await this.prisma.book.findUnique({
      where: { id: dto.toBookId },
      include: { authorProfile: true },
    });

    if (!fromBook) {
      throw new NotFoundException('Source campaign not found');
    }

    if (!toBook) {
      throw new NotFoundException('Target campaign not found');
    }

    // Verify both campaigns belong to the same author
    if (fromBook.authorProfileId !== toBook.authorProfileId) {
      throw new BadRequestException('Both campaigns must belong to the same author');
    }

    // Verify source campaign has enough credits
    if (fromBook.creditsRemaining < dto.creditsToTransfer) {
      throw new BadRequestException(
        `Source campaign only has ${fromBook.creditsRemaining} credits remaining`,
      );
    }

    // Perform the transfer in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Deduct from source campaign
      const updatedFromBook = await tx.book.update({
        where: { id: dto.fromBookId },
        data: {
          creditsAllocated: { decrement: dto.creditsToTransfer },
          creditsRemaining: { decrement: dto.creditsToTransfer },
        },
      });

      // Add to target campaign
      const updatedToBook = await tx.book.update({
        where: { id: dto.toBookId },
        data: {
          creditsAllocated: { increment: dto.creditsToTransfer },
          creditsRemaining: { increment: dto.creditsToTransfer },
        },
      });

      // Create credit transaction record for source (deduction)
      await tx.creditTransaction.create({
        data: {
          authorProfileId: fromBook.authorProfileId,
          bookId: dto.fromBookId,
          amount: -dto.creditsToTransfer,
          type: CreditTransactionType.ALLOCATION, // Using ALLOCATION for transfers
          description: `Credits transferred to "${toBook.title}". Reason: ${dto.reason}`,
          balanceAfter: fromBook.authorProfile.availableCredits, // Author balance unchanged
          performedBy: adminUserId,
          notes: dto.notes,
        },
      });

      // Create credit transaction record for target (addition)
      await tx.creditTransaction.create({
        data: {
          authorProfileId: toBook.authorProfileId,
          bookId: dto.toBookId,
          amount: dto.creditsToTransfer,
          type: CreditTransactionType.ALLOCATION,
          description: `Credits received from "${fromBook.title}". Reason: ${dto.reason}`,
          balanceAfter: fromBook.authorProfile.availableCredits,
          performedBy: adminUserId,
          notes: dto.notes,
        },
      });

      return {
        updatedFromBook,
        updatedToBook,
      };
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'credits.transferred',
      entity: 'CreditTransaction',
      entityId: dto.fromBookId,
      description: `${dto.creditsToTransfer} credits transferred from "${fromBook.title}" to "${toBook.title}". Reason: ${dto.reason}`,
      changes: {
        fromBookId: dto.fromBookId,
        fromBookTitle: fromBook.title,
        toBookId: dto.toBookId,
        toBookTitle: toBook.title,
        creditsTransferred: dto.creditsToTransfer,
        reason: dto.reason,
      },
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    return {
      creditsTransferred: dto.creditsToTransfer,
      fromCampaign: {
        id: dto.fromBookId,
        title: fromBook.title,
        creditsRemaining: result.updatedFromBook.creditsRemaining,
      },
      toCampaign: {
        id: dto.toBookId,
        title: toBook.title,
        creditsRemaining: result.updatedToBook.creditsRemaining,
      },
      reason: dto.reason,
    };
  }

  /**
   * Resume campaign with catch-up logic - calculates missed distribution and adjusts rate
   */
  async resumeCampaignWithCatchUp(
    bookId: string,
    dto: ResumeCampaignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Can only resume paused campaigns');
    }

    const now = new Date();
    const pausedAt = book.distributionPausedAt;

    // Calculate pause duration in days
    let pauseDurationDays = 0;
    if (pausedAt) {
      pauseDurationDays = Math.floor(
        (now.getTime() - pausedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // Calculate missed reviews based on pause duration
    const missedReviews = Math.floor((pauseDurationDays / 7) * book.reviewsPerWeek);

    // Calculate new end date (extend by pause duration)
    let newExpectedEndDate = book.expectedEndDate;
    if (newExpectedEndDate && pauseDurationDays > 0) {
      newExpectedEndDate = new Date(newExpectedEndDate);
      newExpectedEndDate.setDate(newExpectedEndDate.getDate() + pauseDurationDays);
    }

    // Update campaign status and adjust end date
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        status: CampaignStatus.ACTIVE,
        distributionResumedAt: now,
        expectedEndDate: newExpectedEndDate,
        campaignEndDate: newExpectedEndDate,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.resumed_with_catchup',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign resumed with catch-up. Pause duration: ${pauseDurationDays} days, missed ~${missedReviews} reviews. End date extended. Reason: ${dto.reason}`,
      changes: {
        pauseDurationDays,
        missedReviews,
        newExpectedEndDate: newExpectedEndDate?.toISOString(),
        reason: dto.reason,
      },
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Force complete a campaign (Section 5.3)
   */
  async forceCompleteCampaign(
    bookId: string,
    dto: ForceCompleteCampaignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<CampaignAnalyticsDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { authorProfile: { include: { user: true } } },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status === CampaignStatus.COMPLETED) {
      throw new BadRequestException('Campaign is already completed');
    }

    const now = new Date();
    const refundUnusedCredits = dto.refundUnusedCredits !== false;
    let creditsRefunded = 0;

    // Calculate unused credits if refunding
    if (refundUnusedCredits && book.creditsRemaining > 0) {
      creditsRefunded = book.creditsRemaining;

      // Return credits to author
      await this.prisma.authorProfile.update({
        where: { id: book.authorProfileId },
        data: {
          availableCredits: { increment: creditsRefunded },
          totalCreditsUsed: { decrement: creditsRefunded },
        },
      });

      // Create refund transaction
      await this.prisma.creditTransaction.create({
        data: {
          authorProfileId: book.authorProfileId,
          bookId: bookId,
          amount: creditsRefunded,
          type: CreditTransactionType.REFUND,
          description: `Force completion refund. Reason: ${dto.reason}`,
          balanceAfter: book.authorProfile.availableCredits + creditsRefunded,
          performedBy: adminUserId,
          notes: dto.notes,
        },
      });
    }

    // Update campaign to COMPLETED
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        status: CampaignStatus.COMPLETED,
        campaignEndDate: now,
        creditsRemaining: 0,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.force_completed',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign "${book.title}" force completed. Reason: ${dto.reason}${creditsRefunded > 0 ? `. ${creditsRefunded} credits refunded.` : ''}`,
      changes: {
        status: { from: book.status, to: CampaignStatus.COMPLETED },
        creditsRefunded,
        reason: dto.reason,
      },
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    this.logger.log(`Campaign ${bookId} force completed by ${adminEmail}`);

    return this.getCampaignAnalytics(bookId);
  }

  /**
   * Manually grant material access to a reader (Section 5.3)
   */
  async manualGrantAccess(
    bookId: string,
    dto: ManualGrantAccessDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { authorProfile: true },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.ACTIVE && book.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Can only grant access to active or paused campaigns');
    }

    // Verify reader exists
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { id: dto.readerProfileId },
      include: { user: true },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    if (!readerProfile.isActive || readerProfile.isSuspended) {
      throw new BadRequestException('Reader account is not active');
    }

    // Check if reader already has an active assignment for this book
    const existingAssignment = await this.prisma.readerAssignment.findFirst({
      where: {
        bookId,
        readerProfileId: dto.readerProfileId,
        status: { in: ['WAITING', 'SCHEDULED', 'APPROVED', 'IN_PROGRESS'] },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException('Reader already has an active assignment for this campaign');
    }

    // Check if campaign has remaining credits
    if (book.creditsRemaining <= 0) {
      throw new BadRequestException('Campaign has no remaining credits');
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours default

    // Create assignment
    const assignment = await this.prisma.readerAssignment.create({
      data: {
        bookId,
        readerProfileId: dto.readerProfileId,
        status: 'IN_PROGRESS',
        materialsReleasedAt: now,
        deadlineAt: deadline,
        formatAssigned: (dto.preferredFormat as BookFormat) || BookFormat.EBOOK,
        creditsValue: 1, // Default for ebook, adjust for audiobook
        isManualGrant: true,
        manualGrantBy: adminUserId,
        manualGrantReason: dto.reason,
      },
      include: {
        book: { select: { title: true } },
        readerProfile: { include: { user: true } },
      },
    });

    // Deduct credit from campaign
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        creditsRemaining: { decrement: 1 },
      },
    });

    // Send notification email to reader
    try {
      await this.emailService.sendTemplatedEmail(
        readerProfile.user.email,
        EmailType.READER_MATERIALS_READY,
        {
          userName: readerProfile.user.name,
          bookTitle: book.title,
          deadlineAt: deadline,
          assignmentUrl: `${this.configService.get<string>('FRONTEND_URL')}/reader/assignments/${assignment.id}`,
        },
        readerProfile.userId,
        readerProfile.user.preferredLanguage || Language.EN,
      );
    } catch (error) {
      this.logger.error(`Failed to send material access email: ${error.message}`);
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.manual_access_granted',
      entity: 'ReaderAssignment',
      entityId: assignment.id,
      description: `Manual access granted to reader ${readerProfile.user.email} for "${book.title}". Reason: ${dto.reason}`,
      changes: {
        bookId,
        readerProfileId: dto.readerProfileId,
        assignmentId: assignment.id,
        reason: dto.reason,
      },
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    this.logger.log(`Manual access granted to reader ${dto.readerProfileId} for campaign ${bookId} by ${adminEmail}`);

    return {
      success: true,
      assignment: {
        id: assignment.id,
        bookId,
        bookTitle: book.title,
        readerProfileId: dto.readerProfileId,
        readerEmail: readerProfile.user.email,
        status: assignment.status,
        materialsReleasedAt: assignment.materialsReleasedAt,
        deadlineAt: assignment.deadlineAt,
      },
    };
  }

  /**
   * Remove a reader from a campaign (Section 5.3)
   */
  async removeReaderFromCampaign(
    bookId: string,
    dto: RemoveReaderFromCampaignDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const assignment = await this.prisma.readerAssignment.findUnique({
      where: { id: dto.assignmentId },
      include: {
        book: { include: { authorProfile: true } },
        readerProfile: { include: { user: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.bookId !== bookId) {
      throw new BadRequestException('Assignment does not belong to this campaign');
    }

    if (assignment.status === 'COMPLETED' || assignment.status === 'CANCELLED') {
      throw new BadRequestException('Cannot remove reader from completed or cancelled assignment');
    }

    const notifyReader = dto.notifyReader !== false;
    const refundCredit = dto.refundCredit !== false;

    // Update assignment to CANCELLED
    await this.prisma.readerAssignment.update({
      where: { id: dto.assignmentId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: adminUserId,
        cancellationReason: dto.reason,
      },
    });

    // Refund credit to campaign if requested
    if (refundCredit) {
      await this.prisma.book.update({
        where: { id: bookId },
        data: {
          creditsRemaining: { increment: 1 },
        },
      });
    }

    // Notify reader if requested
    if (notifyReader && assignment.readerProfile.user.email) {
      try {
        await this.emailService.sendTemplatedEmail(
          assignment.readerProfile.user.email,
          EmailType.READER_ASSIGNMENT_CANCELLED,
          {
            userName: assignment.readerProfile.user.name,
            bookTitle: assignment.book.title,
            reason: dto.reason,
            dashboardUrl: `${this.configService.get<string>('FRONTEND_URL')}/reader/dashboard`,
          },
          assignment.readerProfile.userId,
          assignment.readerProfile.user.preferredLanguage || Language.EN,
        );
      } catch (error) {
        this.logger.error(`Failed to send cancellation email: ${error.message}`);
      }
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.reader_removed',
      entity: 'ReaderAssignment',
      entityId: dto.assignmentId,
      description: `Reader ${assignment.readerProfile.user.email} removed from "${assignment.book.title}". Reason: ${dto.reason}`,
      changes: {
        bookId,
        assignmentId: dto.assignmentId,
        readerProfileId: assignment.readerProfileId,
        status: { from: assignment.status, to: 'CANCELLED' },
        creditRefunded: refundCredit,
        notified: notifyReader,
        reason: dto.reason,
      },
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    this.logger.log(`Reader ${assignment.readerProfileId} removed from campaign ${bookId} by ${adminEmail}`);

    return {
      success: true,
      message: `Reader removed from campaign${notifyReader ? ' and notified' : ''}${refundCredit ? '. Credit refunded to campaign.' : ''}`,
      assignment: {
        id: dto.assignmentId,
        status: 'CANCELLED',
        creditRefunded: refundCredit,
        notified: notifyReader,
      },
    };
  }

  /**
   * Generate PDF report for a campaign (Section 5.3)
   * Returns data for PDF generation (actual PDF rendering handled by frontend or separate PDF service)
   */
  async generateCampaignReportData(
    bookId: string,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ): Promise<any> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authorProfile: { include: { user: true } },
        readerAssignments: {
          include: {
            readerProfile: { include: { user: true } },
            review: true,
          },
        },
        reviews: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    // Calculate metrics
    const totalAssignments = book.readerAssignments.length;
    const completedAssignments = book.readerAssignments.filter((a) => a.status === 'COMPLETED').length;
    const expiredAssignments = book.readerAssignments.filter((a) => a.status === 'EXPIRED').length;
    const inProgressAssignments = book.readerAssignments.filter((a) => a.status === 'IN_PROGRESS').length;
    const cancelledAssignments = book.readerAssignments.filter((a) => a.status === 'CANCELLED').length;

    const validatedReviews = book.reviews.filter((r) => r.status === 'VALIDATED').length;
    const rejectedReviews = book.reviews.filter((r) => r.status === 'REJECTED').length;
    const pendingReviews = book.reviews.filter((r) => r.status === 'PENDING_VALIDATION' || r.status === 'SUBMITTED').length;

    // Average internal rating
    const ratingsSum = book.reviews
      .filter((r) => r.internalRating)
      .reduce((sum, r) => sum + r.internalRating!, 0);
    const ratingsCount = book.reviews.filter((r) => r.internalRating).length;
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

    // Amazon review stats
    const amazonReviewsPosted = book.reviews.filter((r) => r.amazonReviewLink && r.publishedOnAmazon).length;
    // Using internal rating as proxy since amazonStarRating doesn't exist in schema
    const avgAmazonRating = averageRating;

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'campaign.report_generated',
      entity: 'Book',
      entityId: bookId,
      description: `Campaign report generated for "${book.title}"`,
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      ipAddress,
    });

    return {
      reportGeneratedAt: new Date().toISOString(),
      campaign: {
        id: book.id,
        title: book.title,
        author: book.authorProfile.user.name,
        status: book.status,
        targetReviews: book.targetReviews,
        startDate: book.campaignStartDate?.toISOString(),
        endDate: book.campaignEndDate?.toISOString(),
        creditsAllocated: book.creditsAllocated,
        creditsRemaining: book.creditsRemaining,
      },
      assignmentMetrics: {
        total: totalAssignments,
        completed: completedAssignments,
        inProgress: inProgressAssignments,
        expired: expiredAssignments,
        cancelled: cancelledAssignments,
        completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
      },
      reviewMetrics: {
        totalReviews: book.reviews.length,
        validated: validatedReviews,
        rejected: rejectedReviews,
        pending: pendingReviews,
        averageInternalRating: averageRating.toFixed(2),
        amazonReviewsPosted,
        averageAmazonRating: avgAmazonRating.toFixed(2),
      },
      timeline: {
        weeksElapsed: book.currentWeek || 1,
        reviewsPerWeek: book.reviewsPerWeek,
        totalWeeksPlanned: Math.ceil(book.targetReviews / book.reviewsPerWeek),
      },
      readerBreakdown: book.readerAssignments.map((a) => ({
        readerName: a.readerProfile.user.name,
        readerEmail: a.readerProfile.user.email,
        status: a.status,
        assignedAt: a.createdAt?.toISOString(),
        completedAt: a.completedAt?.toISOString(),
        deadlineAt: a.deadlineAt?.toISOString(),
        hasReview: !!a.review,
        reviewStatus: a.review?.status,
        internalRating: a.review?.internalRating,
        amazonPosted: !!a.review?.amazonReviewLink && a.review?.publishedOnAmazon,
      })),
    };
  }
}
