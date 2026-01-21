import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  AdminDashboardDto,
  AuthorCampaignTrackingDto,
  ReaderPerformanceStatsDto,
  TransactionHistoryDto,
  CampaignAnalyticsComparisonDto,
  AdminRevenueAnalyticsDto,
  CampaignSectionItemDto,
} from './dto/dashboard.dto';
import { CampaignStatus, AssignmentStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a book belongs to an author
   */
  async isBookOwner(bookId: string, authorProfileId: string): Promise<boolean> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: bookId,
        authorProfileId,
      },
    });
    return !!book;
  }

  /**
   * Get admin dashboard overview
   */
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const now = new Date();

    // Get summary statistics
    const [
      totalCampaigns,
      activeCampaigns,
      pausedCampaigns,
      completedCampaigns,
      totalAuthors,
      totalReaders,
      totalClosers,
      totalAffiliates,
      totalReviewsPendingValidation,
      reviewsInProgress,
      overdueReviews,
      totalIssuesFlagged,
      flaggedReviewsCount,
      pendingDisputesCount,
      pendingAffiliateApplicationsCount,
      pendingPayoutRequestsCount,
      creditsData,
    ] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.book.count({ where: { status: CampaignStatus.ACTIVE } }),
      this.prisma.book.count({ where: { status: CampaignStatus.PAUSED } }),
      this.prisma.book.count({ where: { status: CampaignStatus.COMPLETED } }),
      this.prisma.authorProfile.count(),
      this.prisma.readerProfile.count(),
      this.prisma.closerProfile.count(),
      this.prisma.affiliateProfile.count({ where: { isApproved: true } }),
      this.prisma.review.count({ where: { status: 'SUBMITTED' as any } }),
      // Reviews in progress (within 72-hour window)
      this.prisma.readerAssignment.count({
        where: {
          status: AssignmentStatus.IN_PROGRESS,
          deadlineAt: { gte: now },
        }
      }),
      // Overdue reviews (past deadline but not completed)
      this.prisma.readerAssignment.count({
        where: {
          status: { in: [AssignmentStatus.IN_PROGRESS, AssignmentStatus.SCHEDULED] },
          deadlineAt: { lt: now },
        }
      }),
      this.prisma.reviewIssue.count({ where: { status: 'OPEN' as any } }),
      // Flagged reviews requiring admin attention
      this.prisma.review.count({ where: { status: 'FLAGGED' as any } }),
      // Pending disputes
      this.prisma.dispute.count({ where: { status: 'OPEN' as any } }),
      // Pending affiliate applications (not approved and not rejected)
      this.prisma.affiliateProfile.count({ where: { isApproved: false, rejectedAt: null } }),
      // Pending payout requests (REQUESTED or PENDING_REVIEW status)
      this.prisma.payoutRequest.count({ where: { status: { in: ['REQUESTED', 'PENDING_REVIEW'] } } }),
      // Credits in circulation (purchased but not consumed)
      this.prisma.authorProfile.aggregate({
        _sum: { availableCredits: true },
      }),
    ]);

    const creditsInCirculation = creditsData._sum.availableCredits || 0;

    // Get all active campaigns with author details for categorization
    const allActiveCampaigns = await this.prisma.book.findMany({
      where: {
        status: CampaignStatus.ACTIVE,
      },
      include: { authorProfile: { include: { user: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    // Batch fetch open issue counts for all active campaigns to avoid N+1 query
    const campaignIds = allActiveCampaigns.map((book) => book.id);
    const openIssuesCounts = await this.prisma.reviewIssue.groupBy({
      by: ['reviewId'],
      where: {
        review: { bookId: { in: campaignIds } },
        status: 'OPEN' as any,
      },
      _count: { id: true },
    });

    // Get the bookIds that have open issues
    const reviewsWithIssues = openIssuesCounts.length > 0
      ? await this.prisma.review.findMany({
          where: { id: { in: openIssuesCounts.map((i) => i.reviewId) } },
          select: { bookId: true },
        })
      : [];
    const booksWithOpenIssues = new Set(reviewsWithIssues.map((r) => r.bookId));

    // Categorize campaigns into healthy, delayed, and issues
    const healthyCampaigns: CampaignSectionItemDto[] = [];
    const delayedCampaigns: CampaignSectionItemDto[] = [];
    const issuesCampaigns: CampaignSectionItemDto[] = [];

    for (const book of allActiveCampaigns) {
      const startDate = book.campaignStartDate || book.createdAt;
      const weeksElapsed = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      const totalWeeks = Math.ceil(book.targetReviews / (book.reviewsPerWeek || 5));
      const expectedReviewsByNow = Math.min(weeksElapsed * (book.reviewsPerWeek || 5), book.targetReviews);
      const variance = book.totalReviewsDelivered - expectedReviewsByNow;
      const completionPercentage = book.targetReviews > 0
        ? (book.totalReviewsDelivered / book.targetReviews) * 100
        : 0;

      const campaignItem: CampaignSectionItemDto = {
        id: book.id,
        bookTitle: book.title,
        authorName: book.authorProfile.user.name,
        status: book.status,
        targetReviews: book.targetReviews,
        reviewsDelivered: book.totalReviewsDelivered,
        reviewsValidated: book.totalReviewsValidated,
        completionPercentage,
        currentWeek: book.currentWeek,
        totalWeeks,
        expectedReviewsByNow,
        variance,
        campaignStartDate: startDate.toISOString(),
        expectedEndDate: book.expectedEndDate?.toISOString(),
      };

      // Check for issues first (quality problems, rejections, reader complaints)
      const hasHighRejections = book.totalReviewsRejected > book.targetReviews * 0.1;
      // Use pre-fetched data instead of querying per-campaign
      const hasOpenIssues = booksWithOpenIssues.has(book.id);

      if (hasHighRejections || hasOpenIssues) {
        issuesCampaigns.push({
          ...campaignItem,
          issue: hasHighRejections
            ? `High rejection rate (${book.totalReviewsRejected} rejected)`
            : 'Open issues pending resolution',
          severity: hasHighRejections && book.totalReviewsRejected > 10 ? 'CRITICAL' : 'MEDIUM',
        });
      } else if (variance < -(book.reviewsPerWeek || 5)) {
        // Campaign is behind by more than one week's worth of reviews
        delayedCampaigns.push({
          ...campaignItem,
          issue: `Behind schedule by ${Math.abs(variance)} reviews`,
          severity: variance < -(2 * (book.reviewsPerWeek || 5)) ? 'HIGH' : 'MEDIUM',
        });
      } else {
        // Campaign is on track or ahead of schedule
        healthyCampaigns.push(campaignItem);
      }
    }

    // Get campaigns requiring attention (legacy - combines paused + high rejections)
    const campaignsRequiringAttention = await this.prisma.book.findMany({
      where: {
        OR: [
          { status: CampaignStatus.PAUSED },
          { totalReviewsRejected: { gt: 5 } },
        ],
      },
      include: { authorProfile: { include: { user: true } } },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });

    // Get recent admin actions
    const recentAdminActions = await this.prisma.auditLog.findMany({
      where: { userRole: 'ADMIN' as any },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Calculate revenue statistics
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthPurchases = await this.prisma.creditPurchase.aggregate({
      where: {
        purchaseDate: { gte: startOfMonth },
        paymentStatus: 'COMPLETED' as any,
      },
      _sum: { amountPaid: true },
    });

    const lastMonthPurchases = await this.prisma.creditPurchase.aggregate({
      where: {
        purchaseDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        paymentStatus: 'COMPLETED' as any,
      },
      _sum: { amountPaid: true },
    });

    const totalRevenue = await this.prisma.creditPurchase.aggregate({
      where: { paymentStatus: 'COMPLETED' as any },
      _sum: { amountPaid: true },
    });

    const thisMonth = parseFloat(thisMonthPurchases._sum.amountPaid?.toString() || '0');
    const lastMonth = parseFloat(lastMonthPurchases._sum.amountPaid?.toString() || '0');
    const percentageChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Get active subscriptions count
    const activeSubscriptions = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' as any },
    });

    // Calculate platform health
    const allReaderProfiles = await this.prisma.readerProfile.findMany({
      select: {
        completionRate: true,
        reliabilityScore: true,
        removalRate: true,
      },
    });

    const avgCompletionRate =
      allReaderProfiles.reduce(
        (sum, profile) => sum + parseFloat(profile.completionRate?.toString() || '0'),
        0,
      ) / (allReaderProfiles.length || 1);

    const avgReliabilityScore =
      allReaderProfiles.reduce(
        (sum, profile) => sum + parseFloat(profile.reliabilityScore?.toString() || '0'),
        0,
      ) / (allReaderProfiles.length || 1);

    const avgRemovalRate =
      allReaderProfiles.reduce(
        (sum, profile) => sum + parseFloat(profile.removalRate?.toString() || '0'),
        0,
      ) / (allReaderProfiles.length || 1);

    return {
      summary: {
        totalCampaigns,
        activeCampaigns,
        pausedCampaigns,
        completedCampaigns,
        totalAuthors,
        totalReaders,
        totalClosers,
        totalAffiliates,
        totalReviewsPendingValidation,
        reviewsInProgress,
        overdueReviews,
        creditsInCirculation,
        totalIssuesFlagged,
      },
      healthyCampaigns,
      delayedCampaigns,
      issuesCampaigns,
      campaignsRequiringAttention: campaignsRequiringAttention.map((book) => ({
        id: book.id,
        bookTitle: book.title,
        authorName: book.authorProfile.user.name,
        issue:
          book.status === CampaignStatus.PAUSED
            ? 'Campaign is paused'
            : `High rejection rate (${book.totalReviewsRejected} rejected)`,
        severity: book.totalReviewsRejected > 10 ? 'CRITICAL' : 'MEDIUM',
        createdAt: book.createdAt.toISOString(),
      })),
      recentAdminActions: recentAdminActions.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        performedBy: log.userEmail || 'Unknown',
        performedAt: log.createdAt.toISOString(),
        description: log.description || '',
      })),
      revenue: {
        thisMonth,
        lastMonth,
        percentageChange,
        totalAllTime: parseFloat(totalRevenue._sum.amountPaid?.toString() || '0'),
      },
      activeSubscriptions,
      platformHealth: {
        averageReviewCompletionRate: avgCompletionRate,
        averageReaderReliabilityScore: avgReliabilityScore,
        averageReviewValidationTime: 24, // Stub - would calculate from review data
        amazonRemovalRate: avgRemovalRate,
      },
      systemHealth: {
        databaseStatus: 'healthy', // In production, would check actual connection health
        cacheStatus: 'healthy', // In production, would check Redis connection
        queueStatus: 'healthy', // In production, would check BullMQ health
        lastHealthCheck: new Date().toISOString(),
      },
      quickActions: {
        flaggedReviewsCount,
        pendingDisputesCount,
        pendingAffiliateApplicationsCount,
        pendingSupportTicketsCount: 0, // No support ticket model yet
        pendingPayoutRequestsCount,
      },
    };
  }

  /**
   * Get author campaign tracking dashboard
   */
  async getAuthorCampaignTracking(bookId: string): Promise<AuthorCampaignTrackingDto> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { weeklySnapshots: { orderBy: { weekNumber: 'asc' } } },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    // Calculate completion percentage
    const completionPercentage = (book.totalReviewsDelivered / book.targetReviews) * 100;

    // Calculate weeks
    const startDate = book.campaignStartDate || new Date();
    const now = new Date();
    const weeksElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = Math.ceil(book.targetReviews / book.reviewsPerWeek);

    // Get rating distribution
    const reviews = await this.prisma.review.findMany({
      where: { bookId, status: 'VALIDATED' as any },
      select: { internalRating: true },
    });

    const ratingDistribution = {
      fiveStar: reviews.filter((r) => r.internalRating === 5).length,
      fourStar: reviews.filter((r) => r.internalRating === 4).length,
      threeStar: reviews.filter((r) => r.internalRating === 3).length,
      twoStar: reviews.filter((r) => r.internalRating === 2).length,
      oneStar: reviews.filter((r) => r.internalRating === 1).length,
    };

    // Determine health status
    const expectedReviews = Math.min(weeksElapsed * book.reviewsPerWeek, book.targetReviews);
    const variance = book.totalReviewsDelivered - expectedReviews;

    let healthStatus: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule' = 'on-track';
    if (variance > book.reviewsPerWeek) {
      healthStatus = 'ahead-of-schedule';
    } else if (variance < -book.reviewsPerWeek) {
      healthStatus = 'delayed';
    } else if (book.totalReviewsRejected > book.targetReviews * 0.1) {
      healthStatus = 'issues';
    }

    // Get Amazon removals
    const removedReviews = await this.prisma.review.findMany({
      where: { bookId, removedByAmazon: true },
    });

    const amazonRemovals = {
      total: removedReviews.length,
      withinGuarantee: removedReviews.filter((r) => r.replacementEligible).length,
      afterGuarantee: removedReviews.filter((r) => !r.replacementEligible).length,
      replacementsProvided: removedReviews.filter((r) => r.replacementProvided).length,
    };

    return {
      campaign: {
        id: book.id,
        bookTitle: book.title,
        status: book.status,
        targetReviews: book.targetReviews,
        reviewsDelivered: book.totalReviewsDelivered,
        reviewsValidated: book.totalReviewsValidated,
        completionPercentage,
        campaignStartDate: startDate.toISOString(),
        expectedEndDate: book.expectedEndDate?.toISOString() || '',
        currentWeek: book.currentWeek,
        totalWeeks,
      },
      weeklyProgress: book.weeklySnapshots.map((snapshot) => ({
        weekNumber: snapshot.weekNumber,
        weekStartDate: snapshot.weekStartDate.toISOString(),
        weekEndDate: snapshot.weekEndDate.toISOString(),
        plannedReviews: snapshot.plannedReviews,
        actualReviews: snapshot.actualReviews,
        validated: snapshot.reviewsValidated,
        variance: snapshot.actualReviews - snapshot.plannedReviews,
      })),
      ratingDistribution,
      averageRating: book.averageInternalRating ? parseFloat(book.averageInternalRating.toString()) : 0,
      health: {
        status: healthStatus,
        message:
          healthStatus === 'on-track'
            ? 'Campaign is progressing as planned'
            : healthStatus === 'delayed'
            ? `Campaign is ${Math.abs(variance)} reviews behind schedule`
            : healthStatus === 'ahead-of-schedule'
            ? `Campaign is ${variance} reviews ahead of schedule`
            : `High rejection rate detected`,
      },
      delays: [], // Stub - would query delay records
      amazonRemovals,
    };
  }

  /**
   * Get reader performance statistics
   */
  async getReaderPerformanceStats(readerProfileId: string): Promise<ReaderPerformanceStatsDto> {
    const readerProfile = await this.prisma.readerProfile.findUnique({
      where: { id: readerProfileId },
      include: {
        user: true,
        assignments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { book: true, review: true },
        },
      },
    });

    if (!readerProfile) {
      throw new NotFoundException('Reader profile not found');
    }

    const totalAssignments = await this.prisma.readerAssignment.count({
      where: { readerProfileId },
    });

    // Get performance over time (last 12 months)
    const monthsAgo12 = new Date();
    monthsAgo12.setMonth(monthsAgo12.getMonth() - 12);

    const reviews = await this.prisma.review.findMany({
      where: {
        readerProfileId,
        createdAt: { gte: monthsAgo12 },
      },
      include: { walletTransaction: true },
    });

    // Group by month
    const performanceByMonth: { [key: string]: { completed: number; expired: number; earnings: number } } = {};
    reviews.forEach((review) => {
      const month = review.createdAt.toISOString().substring(0, 7);
      if (!performanceByMonth[month]) {
        performanceByMonth[month] = { completed: 0, expired: 0, earnings: 0 };
      }

      if (review.status === 'VALIDATED') {
        performanceByMonth[month].completed++;
        performanceByMonth[month].earnings += parseFloat(
          review.walletTransaction?.amount?.toString() || '0',
        );
      }
    });

    const performanceOverTime = Object.entries(performanceByMonth).map(([month, data]) => ({
      month,
      completedReviews: data.completed,
      expiredReviews: data.expired,
      earnings: data.earnings,
    }));

    return {
      reader: {
        id: readerProfile.id,
        name: readerProfile.user.name,
        email: readerProfile.user.email,
        memberSince: readerProfile.createdAt.toISOString(),
      },
      performance: {
        totalAssignments,
        reviewsCompleted: readerProfile.reviewsCompleted,
        reviewsExpired: readerProfile.reviewsExpired,
        reviewsRejected: readerProfile.reviewsRejected,
        completionRate: parseFloat(readerProfile.completionRate?.toString() || '0'),
        reliabilityScore: parseFloat(readerProfile.reliabilityScore?.toString() || '0'),
        averageInternalRating: parseFloat(readerProfile.averageInternalRating?.toString() || '0'),
      },
      amazonRemovals: {
        total: readerProfile.reviewsRemovedByAmazon,
        removalRate: parseFloat(readerProfile.removalRate?.toString() || '0'),
      },
      wallet: {
        currentBalance: parseFloat(readerProfile.walletBalance.toString()),
        totalEarned: parseFloat(readerProfile.totalEarned.toString()),
        totalWithdrawn: parseFloat(readerProfile.totalWithdrawn.toString()),
        pendingPayouts: 0, // Would query from PayoutRequest
      },
      recentAssignments: readerProfile.assignments.map((assignment) => ({
        id: assignment.id,
        bookTitle: assignment.book.title,
        status: assignment.status,
        assignedDate: assignment.createdAt.toISOString(),
        completedDate: assignment.review?.submittedAt?.toISOString(),
        rating: assignment.review?.internalRating,
      })),
      performanceOverTime,
      flags: {
        isFlagged: readerProfile.isFlagged,
        flagReason: readerProfile.flagReason ?? undefined,
        flaggedAt: readerProfile.flaggedAt?.toISOString(),
      },
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(authorProfileId: string): Promise<TransactionHistoryDto> {
    const [purchases, subscriptions, creditTransactions] = await Promise.all([
      this.prisma.creditPurchase.findMany({
        where: { authorProfileId },
        include: { packageTier: true },
        orderBy: { purchaseDate: 'desc' },
      }),
      this.prisma.subscription.findMany({
        where: { authorProfileId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditTransaction.findMany({
        where: { authorProfileId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
    });

    const activeSubscriptionsCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;

    return {
      oneTimePurchases: purchases.map((purchase) => ({
        id: purchase.id,
        packageName: purchase.packageTier?.name || 'Custom Package',
        credits: purchase.credits,
        amountPaid: parseFloat(purchase.amountPaid.toString()),
        currency: purchase.currency,
        purchaseDate: purchase.purchaseDate.toISOString(),
        activated: purchase.activated,
        activatedAt: purchase.activatedAt?.toISOString(),
        validityDays: purchase.validityDays,
        expiresAt: purchase.activationWindowExpiresAt.toISOString(),
        paymentStatus: purchase.paymentStatus,
      })),
      subscriptionPayments: subscriptions.map((subscription) => ({
        id: subscription.id,
        planName: subscription.planName,
        creditsPerMonth: subscription.creditsPerMonth,
        amount: parseFloat(subscription.pricePerMonth.toString()),
        currency: subscription.currency,
        billingDate: subscription.currentPeriodStart.toISOString(),
        status: subscription.status,
        periodStart: subscription.currentPeriodStart.toISOString(),
        periodEnd: subscription.currentPeriodEnd.toISOString(),
      })),
      creditTransactions: creditTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        balanceAfter: transaction.balanceAfter,
        performedBy: transaction.performedBy ?? undefined,
        createdAt: transaction.createdAt.toISOString(),
      })),
      summary: {
        totalSpent: purchases.reduce((sum, p) => sum + parseFloat(p.amountPaid.toString()), 0),
        totalCreditsPurchased: authorProfile!.totalCreditsPurchased,
        totalCreditsUsed: authorProfile!.totalCreditsUsed,
        availableCredits: authorProfile!.availableCredits,
        activeSubscriptions: activeSubscriptionsCount,
      },
    };
  }

  /**
   * Get admin revenue analytics
   */
  async getAdminRevenueAnalytics(): Promise<AdminRevenueAnalyticsDto> {
    // Get last 12 months revenue
    const monthsAgo12 = new Date();
    monthsAgo12.setMonth(monthsAgo12.getMonth() - 12);

    const purchases = await this.prisma.creditPurchase.findMany({
      where: {
        purchaseDate: { gte: monthsAgo12 },
        paymentStatus: 'COMPLETED' as any,
      },
      orderBy: { purchaseDate: 'asc' },
    });

    // Group by month
    const monthlyRevenueMap: { [key: string]: { oneTime: number; subscription: number } } = {};
    purchases.forEach((purchase) => {
      const month = purchase.purchaseDate.toISOString().substring(0, 7);
      if (!monthlyRevenueMap[month]) {
        monthlyRevenueMap[month] = { oneTime: 0, subscription: 0 };
      }
      monthlyRevenueMap[month].oneTime += parseFloat(purchase.amountPaid.toString());
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, data]) => ({
      month,
      oneTimePayments: data.oneTime,
      subscriptionPayments: data.subscription,
      total: data.oneTime + data.subscription,
    }));

    // Revenue by source
    const totalOneTime = purchases.reduce((sum, p) => sum + parseFloat(p.amountPaid.toString()), 0);

    // Top packages
    const packageStats = await this.prisma.packageTier.findMany({
      include: {
        purchases: {
          where: { paymentStatus: 'COMPLETED' as any },
        },
      },
    });

    const topPackages = packageStats
      .map((pkg) => ({
        packageName: pkg.name,
        credits: pkg.credits,
        price: parseFloat(pkg.basePrice.toString()),
        purchaseCount: pkg.purchases.length,
        totalRevenue: pkg.purchases.reduce((sum, p) => sum + parseFloat(p.amountPaid.toString()), 0),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Subscription metrics
    const subscriptions = await this.prisma.subscription.findMany({
      where: { status: 'ACTIVE' as any },
    });

    const monthlyRecurringRevenue = subscriptions.reduce(
      (sum, s) => sum + parseFloat(s.pricePerMonth.toString()),
      0,
    );

    return {
      monthlyRevenue,
      revenueBySource: {
        oneTimePurchases: totalOneTime,
        subscriptions: monthlyRecurringRevenue,
        keywordResearch: 0, // Stub
      },
      topPackages,
      subscriptionMetrics: {
        activeSubscriptions: subscriptions.length,
        monthlyRecurringRevenue,
        churnRate: 0, // Would calculate from canceled subscriptions
        averageSubscriptionValue:
          subscriptions.length > 0
            ? monthlyRecurringRevenue / subscriptions.length
            : 0,
      },
      growth: {
        newCustomersThisMonth: 0, // Stub - would query new AuthorProfiles this month
        newCustomersLastMonth: 0, // Stub
        growthRate: 0,
      },
    };
  }
}
