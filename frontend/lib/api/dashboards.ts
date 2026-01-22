import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface CampaignSectionItemDto {
  id: string;
  bookTitle: string;
  authorName: string;
  status: string;
  targetReviews: number;
  reviewsDelivered: number;
  reviewsValidated: number;
  completionPercentage: number;
  currentWeek: number;
  totalWeeks: number;
  expectedReviewsByNow: number;
  variance: number;
  issue?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  campaignStartDate: string;
  expectedEndDate?: string;
}

export interface AdminDashboardDto {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    completedCampaigns: number;
    totalAuthors: number;
    totalReaders: number;
    totalClosers: number;
    totalAffiliates: number;
    totalReviewsPendingValidation: number;
    reviewsInProgress: number;
    overdueReviews: number;
    creditsInCirculation: number;
    totalIssuesFlagged: number;
  };
  healthyCampaigns: CampaignSectionItemDto[];
  delayedCampaigns: CampaignSectionItemDto[];
  issuesCampaigns: CampaignSectionItemDto[];
  campaignsRequiringAttention: Array<{
    id: string;
    bookTitle: string;
    authorName: string;
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
  }>;
  recentAdminActions: Array<{
    id: string;
    action: string;
    entity: string;
    description: string;
    performedBy: string;
    performedAt: string;
  }>;
  revenue: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
    totalAllTime: number;
  };
  activeSubscriptions: number;
  platformHealth: {
    averageReviewCompletionRate: number;
    averageReaderReliabilityScore: number;
    averageReviewValidationTime: number;
    amazonRemovalRate: number;
  };
  systemHealth: {
    databaseStatus: 'healthy' | 'degraded' | 'down';
    cacheStatus: 'healthy' | 'degraded' | 'down';
    queueStatus: 'healthy' | 'degraded' | 'down';
    lastHealthCheck: string;
  };
  quickActions: {
    flaggedReviewsCount: number;
    pendingDisputesCount: number;
    pendingAffiliateApplicationsCount: number;
    pendingSupportTicketsCount: number;
    pendingPayoutRequestsCount: number;
  };
}

export interface AuthorCampaignTrackingDto {
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
  weeklyProgress: Array<{
    weekNumber: number;
    weekStartDate: string;
    weekEndDate: string;
    plannedReviews: number;
    actualReviews: number;
    validated: number;
    variance: number;
  }>;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  averageRating: number;
  health: {
    status: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule';
    message: string;
  };
  delays: Array<{
    date: string;
    reason: string;
    impact: string;
  }>;
  amazonRemovals: {
    total: number;
    withinGuarantee: number;
    afterGuarantee: number;
    replacementsProvided: number;
  };
}

export interface ReaderPerformanceStatsDto {
  reader: {
    id: string;
    name: string;
    email: string;
    memberSince: string;
  };
  performance: {
    totalAssignments: number;
    reviewsCompleted: number;
    reviewsExpired: number;
    reviewsRejected: number;
    completionRate: number;
    reliabilityScore: number;
    averageInternalRating: number;
  };
  amazonRemovals: {
    total: number;
    removalRate: number;
  };
  wallet: {
    currentBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    pendingPayouts: number;
  };
  recentAssignments: Array<{
    id: string;
    bookTitle: string;
    status: string;
    assignedDate: string;
    completedDate?: string;
    rating?: number;
  }>;
  performanceOverTime: Array<{
    month: string;
    completedReviews: number;
    expiredReviews: number;
    earnings: number;
  }>;
  flags: {
    isFlagged: boolean;
    flagReason?: string;
    flaggedAt?: string;
  };
}

export interface TransactionHistoryDto {
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
  creditTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    balanceAfter: number;
    performedBy?: string;
    createdAt: string;
  }>;
  summary: {
    totalSpent: number;
    totalCreditsPurchased: number;
    totalCreditsUsed: number;
    availableCredits: number;
    activeSubscriptions: number;
  };
}

/**
 * Activity types for author activity feed (Section 2.1)
 */
export enum AuthorActivityType {
  REVIEW_DELIVERED = 'REVIEW_DELIVERED',
  CAMPAIGN_STATUS_CHANGE = 'CAMPAIGN_STATUS_CHANGE',
  CREDIT_PURCHASE = 'CREDIT_PURCHASE',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

export interface AuthorActivityItemDto {
  id: string;
  type: AuthorActivityType;
  bookTitle?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthorActivityFeedDto {
  activities: AuthorActivityItemDto[];
  total: number;
}

export interface AdminRevenueAnalyticsDto {
  monthlyRevenue: Array<{
    month: string;
    oneTimePayments: number;
    subscriptionPayments: number;
    total: number;
  }>;
  revenueBySource: {
    oneTimePurchases: number;
    subscriptions: number;
    keywordResearch: number;
  };
  topPackages: Array<{
    packageName: string;
    credits: number;
    price: number;
    purchaseCount: number;
    totalRevenue: number;
  }>;
  subscriptionMetrics: {
    activeSubscriptions: number;
    monthlyRecurringRevenue: number;
    churnRate: number;
    averageSubscriptionValue: number;
  };
  growth: {
    newCustomersThisMonth: number;
    newCustomersLastMonth: number;
    growthRate: number;
  };
}

// ============================================
// API CLIENT METHODS
// ============================================

export const dashboardsApi = {
  /**
   * Get admin dashboard
   */
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    const response = await apiClient.get<AdminDashboardDto>('/dashboard/admin');
    return response.data;
  },

  /**
   * Get campaign tracking for author
   */
  async getCampaignTracking(bookId: string): Promise<AuthorCampaignTrackingDto> {
    const response = await apiClient.get<AuthorCampaignTrackingDto>(
      `/dashboard/author/campaigns/${bookId}`,
    );
    return response.data;
  },

  /**
   * Get reader performance stats
   */
  async getReaderStats(): Promise<ReaderPerformanceStatsDto> {
    const response = await apiClient.get<ReaderPerformanceStatsDto>('/dashboard/reader/stats');
    return response.data;
  },

  /**
   * Get transaction history for author
   */
  async getTransactionHistory(): Promise<TransactionHistoryDto> {
    const response = await apiClient.get<TransactionHistoryDto>('/dashboard/transactions');
    return response.data;
  },

  /**
   * Get admin revenue analytics
   */
  async getAdminRevenueAnalytics(): Promise<AdminRevenueAnalyticsDto> {
    const response = await apiClient.get<AdminRevenueAnalyticsDto>('/dashboard/admin/revenue');
    return response.data;
  },

  /**
   * Get author transaction history for admin
   */
  async getAuthorTransactionsForAdmin(authorProfileId: string): Promise<TransactionHistoryDto> {
    const response = await apiClient.get<TransactionHistoryDto>(
      `/dashboard/admin/author/${authorProfileId}/transactions`,
    );
    return response.data;
  },

  /**
   * Get reader performance stats for admin
   */
  async getReaderStatsForAdmin(readerProfileId: string): Promise<ReaderPerformanceStatsDto> {
    const response = await apiClient.get<ReaderPerformanceStatsDto>(
      `/dashboard/admin/reader/${readerProfileId}/stats`,
    );
    return response.data;
  },

  /**
   * Get campaign tracking for admin
   */
  async getCampaignTrackingForAdmin(bookId: string): Promise<AuthorCampaignTrackingDto> {
    const response = await apiClient.get<AuthorCampaignTrackingDto>(
      `/dashboard/admin/campaign/${bookId}`,
    );
    return response.data;
  },

  /**
   * Get author activity feed (Section 2.1)
   */
  async getAuthorActivityFeed(): Promise<AuthorActivityFeedDto> {
    const response = await apiClient.get<AuthorActivityFeedDto>('/dashboard/author/activity');
    return response.data;
  },
};
