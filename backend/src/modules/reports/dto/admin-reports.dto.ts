// Admin Reports DTOs
// Financial, Operational, and Affiliate Reports for Admin Dashboard

export class FinancialReportDto {
  // Revenue Breakdown
  revenue: {
    totalRevenue: number;
    oneTimePurchases: number;
    subscriptionRevenue: number;
    keywordResearchRevenue: number;
    revenueByPackageType: Array<{
      packageName: string;
      credits: number;
      totalRevenue: number;
      purchaseCount: number;
    }>;
    revenueByPaymentMethod: Array<{
      paymentMethod: string;
      totalRevenue: number;
      transactionCount: number;
    }>;
  };

  // Payout Information
  payouts: {
    readerPayouts: {
      total: number;
      pending: number;
      completed: number;
      byMethod: Array<{
        method: string;
        total: number;
        count: number;
      }>;
    };
    affiliatePayouts: {
      total: number;
      pending: number;
      completed: number;
      byMethod: Array<{
        method: string;
        total: number;
        count: number;
      }>;
    };
  };

  // Net Revenue
  netRevenue: {
    grossRevenue: number;
    totalPayouts: number;
    netRevenue: number;
    profitMargin: number; // Percentage
  };

  // Revenue Trend (over time)
  revenueTrend: Array<{
    date: string; // ISO date or month
    revenue: number;
    payouts: number;
    net: number;
  }>;

  // Period
  period: {
    startDate: string;
    endDate: string;
  };
}

export class OperationalReportDto {
  // Campaign Health Metrics
  campaignHealth: {
    totalCampaigns: number;
    activeCampaigns: number;
    onScheduleCampaigns: number;
    delayedCampaigns: number;
    completionRate: number; // Percentage
    averageCampaignDuration: number; // Days
  };

  // Reader Performance Metrics
  readerMetrics: {
    totalActiveReaders: number;
    reviewCompletionRate: number; // Percentage
    averageReviewsPerReader: number;
    deadlineMissRate: number; // Percentage
    averageCompletionTime: number; // Hours
  };

  // Validation Metrics
  validationMetrics: {
    totalReviewsSubmitted: number;
    totalReviewsValidated: number;
    totalReviewsRejected: number;
    approvalRate: number; // Percentage
    averageValidationTime: number; // Hours
    commonRejectionReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };

  // Amazon Removal Tracking
  amazonRemovalMetrics: {
    totalRemovals: number;
    removalRate: number; // Percentage
    replacementsProvided: number;
    withinGuaranteePeriod: number;
  };

  // Period
  period: {
    startDate: string;
    endDate: string;
  };
}

export class AffiliateReportDto {
  // Top Performing Affiliates
  topAffiliates: Array<{
    affiliateId: string;
    affiliateName: string;
    referralCode: string;
    totalRevenue: number;
    totalConversions: number;
    totalClicks: number;
    conversionRate: number; // Percentage
    totalCommission: number;
    pendingCommission: number;
  }>;

  // Overall Affiliate Performance
  overallPerformance: {
    totalAffiliates: number;
    activeAffiliates: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    averageConversionRate: number; // Percentage
    totalCommissionPaid: number;
    totalCommissionPending: number;
  };

  // Conversion Rates by Affiliate
  conversionRates: Array<{
    affiliateId: string;
    affiliateName: string;
    clicks: number;
    conversions: number;
    conversionRate: number; // Percentage
  }>;

  // Commission Costs
  commissionCosts: {
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
    averageCommissionRate: number; // Percentage
    commissionByAffiliate: Array<{
      affiliateId: string;
      affiliateName: string;
      totalCommission: number;
      paidCommission: number;
      pendingCommission: number;
    }>;
  };

  // Period
  period: {
    startDate: string;
    endDate: string;
  };
}

// Export Options DTOs
export class ExportQueryDto {
  startDate: string;
  endDate: string;
  format?: 'csv' | 'pdf';
}

export class DateRangeQueryDto {
  startDate: string;
  endDate: string;
}
