import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FinancialReportDto {
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
  netRevenue: {
    grossRevenue: number;
    totalPayouts: number;
    netRevenue: number;
    profitMargin: number;
  };
  revenueTrend: Array<{
    date: string;
    revenue: number;
    payouts: number;
    net: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface OperationalReportDto {
  campaignHealth: {
    totalCampaigns: number;
    activeCampaigns: number;
    onScheduleCampaigns: number;
    delayedCampaigns: number;
    completionRate: number;
    averageCampaignDuration: number;
  };
  readerMetrics: {
    totalActiveReaders: number;
    reviewCompletionRate: number;
    averageReviewsPerReader: number;
    deadlineMissRate: number;
    averageCompletionTime: number;
  };
  validationMetrics: {
    totalReviewsSubmitted: number;
    totalReviewsValidated: number;
    totalReviewsRejected: number;
    approvalRate: number;
    averageValidationTime: number;
    commonRejectionReasons: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };
  amazonRemovalMetrics: {
    totalRemovals: number;
    removalRate: number;
    replacementsProvided: number;
    withinGuaranteePeriod: number;
    // Section 12.5 required fields
    replacementRate: number; // Percentage: (replacements provided / eligible for replacement) * 100
    averageDaysToRemoval: number; // Average days from validation to removal detection
    // Per-campaign breakdown
    perCampaignBreakdown: Array<{
      campaignId: string;
      campaignTitle: string;
      totalRemovals: number;
      replacementsProvided: number;
      eligibleForReplacement: number;
      averageDaysToRemoval: number;
    }>;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface AffiliateReportDto {
  topAffiliates: Array<{
    affiliateId: string;
    affiliateName: string;
    referralCode: string;
    totalRevenue: number;
    totalConversions: number;
    totalClicks: number;
    conversionRate: number;
    totalCommission: number;
    pendingCommission: number;
  }>;
  overallPerformance: {
    totalAffiliates: number;
    activeAffiliates: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    averageConversionRate: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
  };
  conversionRates: Array<{
    affiliateId: string;
    affiliateName: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
  }>;
  commissionCosts: {
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    totalCommissionPending: number;
    averageCommissionRate: number;
    commissionByAffiliate: Array<{
      affiliateId: string;
      affiliateName: string;
      totalCommission: number;
      paidCommission: number;
      pendingCommission: number;
    }>;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminReportsApi = {
  /**
   * Get Financial Report
   */
  async getFinancialReport(
    startDate: string,
    endDate: string,
  ): Promise<FinancialReportDto> {
    const response = await apiClient.get<FinancialReportDto>(
      `/admin/reports/financial?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },

  /**
   * Export Financial Report as CSV - Downloads via authenticated API call
   */
  async downloadFinancialReportCsv(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/financial/export/csv?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  /**
   * Get Operational Report
   */
  async getOperationalReport(
    startDate: string,
    endDate: string,
  ): Promise<OperationalReportDto> {
    const response = await apiClient.get<OperationalReportDto>(
      `/admin/reports/operational?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },

  /**
   * Export Operational Report as CSV - Downloads via authenticated API call
   */
  async downloadOperationalReportCsv(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/operational/export/csv?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  /**
   * Get Affiliate Report
   */
  async getAffiliateReport(
    startDate: string,
    endDate: string,
  ): Promise<AffiliateReportDto> {
    const response = await apiClient.get<AffiliateReportDto>(
      `/admin/reports/affiliates?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data;
  },

  /**
   * Export Affiliate Report as CSV - Downloads via authenticated API call
   */
  async downloadAffiliateReportCsv(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/affiliates/export/csv?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  // ============================================
  // PDF EXPORT (Section 14.4)
  // ============================================

  /**
   * Export Financial Report as PDF - Downloads via authenticated API call
   */
  async downloadFinancialReportPdf(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/financial/export/pdf?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  /**
   * Export Operational Report as PDF - Downloads via authenticated API call
   */
  async downloadOperationalReportPdf(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/operational/export/pdf?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  /**
   * Export Affiliate Report as PDF - Downloads via authenticated API call
   */
  async downloadAffiliateReportPdf(startDate: string, endDate: string): Promise<Blob> {
    const response = await apiClient.get(
      `/admin/reports/affiliates/export/pdf?startDate=${startDate}&endDate=${endDate}`,
      { responseType: 'blob' },
    );
    return response.data;
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Trigger download of a blob file
   */
  triggerFileDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
