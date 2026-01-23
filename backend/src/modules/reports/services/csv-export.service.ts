import { Injectable } from '@nestjs/common';
import {
  FinancialReportDto,
  OperationalReportDto,
  AffiliateReportDto,
} from '../dto/admin-reports.dto';

@Injectable()
export class CsvExportService {
  /**
   * Generate CSV for Financial Report
   */
  generateFinancialReportCsv(report: FinancialReportDto): string {
    let csv = '';

    // Header
    csv += '=== FINANCIAL REPORT ===\n';
    csv += `Period: ${report.period.startDate} to ${report.period.endDate}\n\n`;

    // Revenue Summary
    csv += '--- REVENUE SUMMARY ---\n';
    csv += 'Category,Amount\n';
    csv += `Total Revenue,${report.revenue.totalRevenue}\n`;
    csv += `One-Time Purchases,${report.revenue.oneTimePurchases}\n`;
    csv += `Subscription Revenue,${report.revenue.subscriptionRevenue}\n`;
    csv += `Keyword Research Revenue,${report.revenue.keywordResearchRevenue}\n\n`;

    // Revenue by Package Type
    csv += '--- REVENUE BY PACKAGE TYPE ---\n';
    csv += 'Package Name,Credits,Total Revenue,Purchase Count\n';
    report.revenue.revenueByPackageType.forEach((pkg) => {
      csv += `${pkg.packageName},${pkg.credits},${pkg.totalRevenue},${pkg.purchaseCount}\n`;
    });
    csv += '\n';

    // Revenue by Payment Method
    csv += '--- REVENUE BY PAYMENT METHOD ---\n';
    csv += 'Payment Method,Total Revenue,Transaction Count\n';
    report.revenue.revenueByPaymentMethod.forEach((method) => {
      csv += `${method.paymentMethod},${method.totalRevenue},${method.transactionCount}\n`;
    });
    csv += '\n';

    // Reader Payouts
    csv += '--- READER PAYOUTS ---\n';
    csv += `Total Payouts,${report.payouts.readerPayouts.total}\n`;
    csv += `Pending Payouts,${report.payouts.readerPayouts.pending}\n`;
    csv += `Completed Payouts,${report.payouts.readerPayouts.completed}\n\n`;
    csv += 'Payment Method,Total,Count\n';
    report.payouts.readerPayouts.byMethod.forEach((method) => {
      csv += `${method.method},${method.total},${method.count}\n`;
    });
    csv += '\n';

    // Affiliate Payouts
    csv += '--- AFFILIATE PAYOUTS ---\n';
    csv += `Total Payouts,${report.payouts.affiliatePayouts.total}\n`;
    csv += `Pending Payouts,${report.payouts.affiliatePayouts.pending}\n`;
    csv += `Completed Payouts,${report.payouts.affiliatePayouts.completed}\n\n`;
    csv += 'Payment Method,Total,Count\n';
    report.payouts.affiliatePayouts.byMethod.forEach((method) => {
      csv += `${method.method},${method.total},${method.count}\n`;
    });
    csv += '\n';

    // Net Revenue
    csv += '--- NET REVENUE ---\n';
    csv += `Gross Revenue,${report.netRevenue.grossRevenue}\n`;
    csv += `Total Payouts,${report.netRevenue.totalPayouts}\n`;
    csv += `Net Revenue,${report.netRevenue.netRevenue}\n`;
    csv += `Profit Margin,${report.netRevenue.profitMargin}%\n\n`;

    // Revenue Trend
    csv += '--- REVENUE TREND ---\n';
    csv += 'Date,Revenue,Payouts,Net\n';
    report.revenueTrend.forEach((trend) => {
      csv += `${trend.date},${trend.revenue},${trend.payouts},${trend.net}\n`;
    });

    return csv;
  }

  /**
   * Generate CSV for Operational Report
   */
  generateOperationalReportCsv(report: OperationalReportDto): string {
    let csv = '';

    // Header
    csv += '=== OPERATIONAL REPORT ===\n';
    csv += `Period: ${report.period.startDate} to ${report.period.endDate}\n\n`;

    // Campaign Health
    csv += '--- CAMPAIGN HEALTH ---\n';
    csv += 'Metric,Value\n';
    csv += `Total Campaigns,${report.campaignHealth.totalCampaigns}\n`;
    csv += `Active Campaigns,${report.campaignHealth.activeCampaigns}\n`;
    csv += `On-Schedule Campaigns,${report.campaignHealth.onScheduleCampaigns}\n`;
    csv += `Delayed Campaigns,${report.campaignHealth.delayedCampaigns}\n`;
    csv += `Completion Rate,${report.campaignHealth.completionRate}%\n`;
    csv += `Average Campaign Duration (days),${report.campaignHealth.averageCampaignDuration}\n\n`;

    // Reader Metrics
    csv += '--- READER METRICS ---\n';
    csv += 'Metric,Value\n';
    csv += `Total Active Readers,${report.readerMetrics.totalActiveReaders}\n`;
    csv += `Review Completion Rate,${report.readerMetrics.reviewCompletionRate}%\n`;
    csv += `Average Reviews Per Reader,${report.readerMetrics.averageReviewsPerReader}\n`;
    csv += `Deadline Miss Rate,${report.readerMetrics.deadlineMissRate}%\n`;
    csv += `Average Completion Time (hours),${report.readerMetrics.averageCompletionTime}\n\n`;

    // Validation Metrics
    csv += '--- VALIDATION METRICS ---\n';
    csv += 'Metric,Value\n';
    csv += `Total Reviews Submitted,${report.validationMetrics.totalReviewsSubmitted}\n`;
    csv += `Total Reviews Validated,${report.validationMetrics.totalReviewsValidated}\n`;
    csv += `Total Reviews Rejected,${report.validationMetrics.totalReviewsRejected}\n`;
    csv += `Approval Rate,${report.validationMetrics.approvalRate}%\n`;
    csv += `Average Validation Time (hours),${report.validationMetrics.averageValidationTime}\n\n`;

    // Common Rejection Reasons
    csv += '--- COMMON REJECTION REASONS ---\n';
    csv += 'Reason,Count,Percentage\n';
    report.validationMetrics.commonRejectionReasons.forEach((reason) => {
      csv += `${reason.reason},${reason.count},${reason.percentage}%\n`;
    });
    csv += '\n';

    // Amazon Removal Metrics (Section 12.5: Replacement Statistics)
    csv += '--- AMAZON REMOVAL METRICS (14-Day Replacement Guarantee) ---\n';
    csv += 'Metric,Value\n';
    csv += `Total Removals,${report.amazonRemovalMetrics.totalRemovals}\n`;
    csv += `Removal Rate,${report.amazonRemovalMetrics.removalRate}%\n`;
    csv += `Replacements Provided,${report.amazonRemovalMetrics.replacementsProvided}\n`;
    csv += `Within Guarantee Period,${report.amazonRemovalMetrics.withinGuaranteePeriod}\n`;
    csv += `Replacement Rate,${report.amazonRemovalMetrics.replacementRate}%\n`;
    csv += `Average Days to Removal,${report.amazonRemovalMetrics.averageDaysToRemoval}\n\n`;

    // Per-Campaign Breakdown (Section 12.5)
    if (report.amazonRemovalMetrics.perCampaignBreakdown && report.amazonRemovalMetrics.perCampaignBreakdown.length > 0) {
      csv += '--- PER-CAMPAIGN REMOVAL BREAKDOWN ---\n';
      csv += 'Campaign Title,Total Removals,Replacements Provided,Eligible for Replacement,Average Days to Removal\n';
      report.amazonRemovalMetrics.perCampaignBreakdown.forEach((campaign) => {
        csv += `"${campaign.campaignTitle}",${campaign.totalRemovals},${campaign.replacementsProvided},${campaign.eligibleForReplacement},${campaign.averageDaysToRemoval}\n`;
      });
    }

    return csv;
  }

  /**
   * Generate CSV for Affiliate Report
   */
  generateAffiliateReportCsv(report: AffiliateReportDto): string {
    let csv = '';

    // Header
    csv += '=== AFFILIATE REPORT ===\n';
    csv += `Period: ${report.period.startDate} to ${report.period.endDate}\n\n`;

    // Overall Performance
    csv += '--- OVERALL PERFORMANCE ---\n';
    csv += 'Metric,Value\n';
    csv += `Total Affiliates,${report.overallPerformance.totalAffiliates}\n`;
    csv += `Active Affiliates,${report.overallPerformance.activeAffiliates}\n`;
    csv += `Total Clicks,${report.overallPerformance.totalClicks}\n`;
    csv += `Total Conversions,${report.overallPerformance.totalConversions}\n`;
    csv += `Total Revenue,${report.overallPerformance.totalRevenue}\n`;
    csv += `Average Conversion Rate,${report.overallPerformance.averageConversionRate}%\n`;
    csv += `Total Commission Paid,${report.overallPerformance.totalCommissionPaid}\n`;
    csv += `Total Commission Pending,${report.overallPerformance.totalCommissionPending}\n\n`;

    // Top Affiliates
    csv += '--- TOP AFFILIATES BY REVENUE ---\n';
    csv += 'Affiliate Name,Referral Code,Revenue,Conversions,Clicks,Conversion Rate,Total Commission,Pending Commission\n';
    report.topAffiliates.forEach((affiliate) => {
      csv += `${affiliate.affiliateName},${affiliate.referralCode},${affiliate.totalRevenue},${affiliate.totalConversions},${affiliate.totalClicks},${affiliate.conversionRate}%,${affiliate.totalCommission},${affiliate.pendingCommission}\n`;
    });
    csv += '\n';

    // Conversion Rates
    csv += '--- TOP CONVERSION RATES ---\n';
    csv += 'Affiliate Name,Clicks,Conversions,Conversion Rate\n';
    report.conversionRates.forEach((affiliate) => {
      csv += `${affiliate.affiliateName},${affiliate.clicks},${affiliate.conversions},${affiliate.conversionRate}%\n`;
    });
    csv += '\n';

    // Commission Costs
    csv += '--- COMMISSION COSTS SUMMARY ---\n';
    csv += `Total Commission Earned,${report.commissionCosts.totalCommissionEarned}\n`;
    csv += `Total Commission Paid,${report.commissionCosts.totalCommissionPaid}\n`;
    csv += `Total Commission Pending,${report.commissionCosts.totalCommissionPending}\n`;
    csv += `Average Commission Rate,${report.commissionCosts.averageCommissionRate}%\n\n`;

    // Commission by Affiliate
    csv += '--- COMMISSION BY AFFILIATE ---\n';
    csv += 'Affiliate Name,Total Commission,Paid Commission,Pending Commission\n';
    report.commissionCosts.commissionByAffiliate.forEach((affiliate) => {
      csv += `${affiliate.affiliateName},${affiliate.totalCommission},${affiliate.paidCommission},${affiliate.pendingCommission}\n`;
    });

    return csv;
  }
}
