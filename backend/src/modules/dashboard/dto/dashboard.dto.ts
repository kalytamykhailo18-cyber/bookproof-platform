import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Campaign item for dashboard sections
 */
export class CampaignSectionItemDto {
  @ApiProperty({ description: 'Campaign/Book ID' })
  id: string;

  @ApiProperty({ description: 'Book title' })
  bookTitle: string;

  @ApiProperty({ description: 'Author name' })
  authorName: string;

  @ApiProperty({ description: 'Campaign status' })
  status: string;

  @ApiProperty({ description: 'Target number of reviews' })
  targetReviews: number;

  @ApiProperty({ description: 'Reviews delivered so far' })
  reviewsDelivered: number;

  @ApiProperty({ description: 'Reviews validated so far' })
  reviewsValidated: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;

  @ApiProperty({ description: 'Current week number' })
  currentWeek: number;

  @ApiProperty({ description: 'Total weeks planned' })
  totalWeeks: number;

  @ApiProperty({ description: 'Expected reviews by this week' })
  expectedReviewsByNow: number;

  @ApiProperty({ description: 'Variance from expected (positive = ahead, negative = behind)' })
  variance: number;

  @ApiPropertyOptional({ description: 'Issue description (for issues section)' })
  issue?: string;

  @ApiPropertyOptional({ description: 'Issue severity' })
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ description: 'Campaign start date' })
  campaignStartDate: string;

  @ApiPropertyOptional({ description: 'Expected end date' })
  expectedEndDate?: string;
}

/**
 * Response DTO for admin dashboard overview
 */
export class AdminDashboardDto {
  @ApiProperty({ description: 'Summary statistics' })
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    completedCampaigns: number;
    totalAuthors: number;
    totalReaders: number;
    totalReviewsPendingValidation: number;
    totalIssuesFlagged: number;
  };

  @ApiProperty({ description: 'Healthy campaigns - running on schedule with normal progress' })
  healthyCampaigns: CampaignSectionItemDto[];

  @ApiProperty({ description: 'Delayed campaigns - falling behind expected delivery rate' })
  delayedCampaigns: CampaignSectionItemDto[];

  @ApiProperty({ description: 'Campaigns with issues - quality problems, rejections, or reader complaints' })
  issuesCampaigns: CampaignSectionItemDto[];

  @ApiProperty({ description: 'Campaigns requiring attention (legacy - combines delayed and issues)' })
  campaignsRequiringAttention: Array<{
    id: string;
    bookTitle: string;
    authorName: string;
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
  }>;

  @ApiProperty({ description: 'Recent admin actions (last 10)' })
  recentAdminActions: Array<{
    id: string;
    action: string;
    entity: string;
    performedBy: string;
    performedAt: string;
    description: string;
  }>;

  @ApiProperty({ description: 'Revenue statistics' })
  revenue: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
    totalAllTime: number;
  };

  @ApiProperty({ description: 'Active subscriptions count' })
  activeSubscriptions: number;

  @ApiProperty({ description: 'Platform health indicators' })
  platformHealth: {
    averageReviewCompletionRate: number;
    averageReaderReliabilityScore: number;
    averageReviewValidationTime: number; // in hours
    amazonRemovalRate: number;
  };
}

/**
 * Response DTO for author campaign tracking dashboard
 */
export class AuthorCampaignTrackingDto {
  @ApiProperty({ description: 'Campaign details' })
  campaign: {
    id: string;
    bookTitle: string;
    status: string;
    targetReviews: number;
    reviewsDelivered: number;
    reviewsValidated: number;
    completionPercentage: number;
    campaignStartDate: string;
    expectedEndDate: string;
    currentWeek: number;
    totalWeeks: number;
  };

  @ApiProperty({ description: 'Weekly progress breakdown' })
  weeklyProgress: Array<{
    weekNumber: number;
    weekStartDate: string;
    weekEndDate: string;
    plannedReviews: number;
    actualReviews: number;
    validated: number;
    variance: number;
  }>;

  @ApiProperty({ description: 'Review distribution by rating' })
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };

  @ApiProperty({ description: 'Average internal rating' })
  averageRating: number;

  @ApiProperty({ description: 'Campaign health status' })
  health: {
    status: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule';
    message: string;
  };

  @ApiProperty({ description: 'Delays encountered' })
  delays: Array<{
    date: string;
    reason: string;
    impact: string;
  }>;

  @ApiProperty({ description: 'Amazon removal statistics' })
  amazonRemovals: {
    total: number;
    withinGuarantee: number;
    afterGuarantee: number;
    replacementsProvided: number;
  };
}

/**
 * Response DTO for reader performance statistics
 */
export class ReaderPerformanceStatsDto {
  @ApiProperty({ description: 'Reader profile info' })
  reader: {
    id: string;
    name: string;
    email: string;
    memberSince: string;
  };

  @ApiProperty({ description: 'Performance metrics' })
  performance: {
    totalAssignments: number;
    reviewsCompleted: number;
    reviewsExpired: number;
    reviewsRejected: number;
    completionRate: number;
    reliabilityScore: number;
    averageInternalRating: number;
  };

  @ApiProperty({ description: 'Amazon removal tracking' })
  amazonRemovals: {
    total: number;
    removalRate: number;
  };

  @ApiProperty({ description: 'Wallet information' })
  wallet: {
    currentBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    pendingPayouts: number;
  };

  @ApiProperty({ description: 'Recent assignments (last 10)' })
  recentAssignments: Array<{
    id: string;
    bookTitle: string;
    status: string;
    assignedDate: string;
    completedDate?: string;
    rating?: number;
  }>;

  @ApiProperty({ description: 'Performance over time (last 12 months)' })
  performanceOverTime: Array<{
    month: string;
    completedReviews: number;
    expiredReviews: number;
    earnings: number;
  }>;

  @ApiProperty({ description: 'Status flags' })
  flags: {
    isFlagged: boolean;
    flagReason?: string;
    flaggedAt?: string;
  };
}

/**
 * Response DTO for transaction history
 */
export class TransactionHistoryDto {
  @ApiProperty({ description: 'One-time purchases' })
  oneTimePurchases: Array<{
    id: string;
    packageName: string;
    credits: number;
    amountPaid: number;
    currency: string;
    purchaseDate: string;
    activated: boolean;
    activatedAt?: string;
    validityDays: number;
    expiresAt: string;
    paymentStatus: string;
  }>;

  @ApiProperty({ description: 'Subscription payments' })
  subscriptionPayments: Array<{
    id: string;
    planName: string;
    creditsPerMonth: number;
    amount: number;
    currency: string;
    billingDate: string;
    status: string;
    periodStart: string;
    periodEnd: string;
  }>;

  @ApiProperty({ description: 'Credit transactions' })
  creditTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    balanceAfter: number;
    performedBy?: string;
    createdAt: string;
  }>;

  @ApiProperty({ description: 'Summary totals' })
  summary: {
    totalSpent: number;
    totalCreditsPurchased: number;
    totalCreditsUsed: number;
    availableCredits: number;
    activeSubscriptions: number;
  };
}

/**
 * Response DTO for campaign analytics with comparisons
 */
export class CampaignAnalyticsComparisonDto {
  @ApiProperty({ description: 'Current campaign data' })
  currentCampaign: AuthorCampaignTrackingDto;

  @ApiProperty({ description: 'Platform average benchmarks' })
  platformAverages: {
    averageCompletionRate: number;
    averageRating: number;
    averageWeeksToComplete: number;
    averageRemovalRate: number;
  };

  @ApiProperty({ description: 'Performance comparison' })
  comparison: {
    completionRateVsAverage: number; // percentage difference
    ratingVsAverage: number;
    speedVsAverage: number; // faster or slower
  };
}

/**
 * Response DTO for admin revenue analytics
 */
export class AdminRevenueAnalyticsDto {
  @ApiProperty({ description: 'Monthly revenue breakdown (last 12 months)' })
  monthlyRevenue: Array<{
    month: string;
    oneTimePayments: number;
    subscriptionPayments: number;
    total: number;
  }>;

  @ApiProperty({ description: 'Revenue by source' })
  revenueBySource: {
    oneTimePurchases: number;
    subscriptions: number;
    keywordResearch: number;
  };

  @ApiProperty({ description: 'Top performing packages' })
  topPackages: Array<{
    packageName: string;
    credits: number;
    price: number;
    purchaseCount: number;
    totalRevenue: number;
  }>;

  @ApiProperty({ description: 'Subscription metrics' })
  subscriptionMetrics: {
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    churnRate: number;
    averageSubscriptionValue: number;
  };

  @ApiProperty({ description: 'Growth metrics' })
  growth: {
    newCustomersThisMonth: number;
    newCustomersLastMonth: number;
    growthRate: number;
  };
}
