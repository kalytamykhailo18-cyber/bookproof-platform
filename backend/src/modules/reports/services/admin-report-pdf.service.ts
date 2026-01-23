import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import {
  FinancialReportDto,
  OperationalReportDto,
  AffiliateReportDto,
} from '../dto/admin-reports.dto';

/**
 * Service for generating PDF reports for admin analytics (Section 14.4)
 * Supports Financial, Operational, and Affiliate reports
 */
@Injectable()
export class AdminReportPdfService {
  private readonly logger = new Logger(AdminReportPdfService.name);

  /**
   * Generate Financial Report PDF
   */
  async generateFinancialReportPdf(report: FinancialReportDto): Promise<Buffer> {
    this.logger.log('Generating Financial Report PDF');
    const html = this.generateFinancialHtml(report);
    return this.convertHtmlToPdf(html);
  }

  /**
   * Generate Operational Report PDF
   */
  async generateOperationalReportPdf(report: OperationalReportDto): Promise<Buffer> {
    this.logger.log('Generating Operational Report PDF');
    const html = this.generateOperationalHtml(report);
    return this.convertHtmlToPdf(html);
  }

  /**
   * Generate Affiliate Report PDF
   */
  async generateAffiliateReportPdf(report: AffiliateReportDto): Promise<Buffer> {
    this.logger.log('Generating Affiliate Report PDF');
    const html = this.generateAffiliateHtml(report);
    return this.convertHtmlToPdf(html);
  }

  private getCommonStyles(): string {
    return `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        line-height: 1.6;
        background: #fff;
        font-size: 12px;
      }

      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        margin: 0 auto;
        background: white;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 15px;
        border-bottom: 3px solid #3498db;
        margin-bottom: 25px;
      }

      .logo {
        font-size: 28px;
        font-weight: 900;
        color: #3498db;
      }

      .report-info {
        text-align: right;
        color: #6c757d;
      }

      .report-info h1 {
        font-size: 20px;
        color: #2c3e50;
        margin-bottom: 5px;
      }

      .report-info p {
        font-size: 12px;
      }

      h2 {
        font-size: 16px;
        color: #2c3e50;
        margin: 25px 0 15px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e9ecef;
        font-weight: 600;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin: 20px 0;
      }

      .metric {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid #e9ecef;
      }

      .metric h3 {
        font-size: 22px;
        color: #3498db;
        margin-bottom: 5px;
        font-weight: 700;
      }

      .metric.positive h3 {
        color: #27ae60;
      }

      .metric.negative h3 {
        color: #e74c3c;
      }

      .metric.warning h3 {
        color: #f39c12;
      }

      .metric p {
        font-size: 11px;
        color: #6c757d;
        font-weight: 500;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }

      .table th {
        background: #3498db;
        color: white;
        padding: 10px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
      }

      .table td {
        padding: 10px;
        border-bottom: 1px solid #e9ecef;
        font-size: 11px;
      }

      .table tr:nth-child(even) {
        background: #f8f9fa;
      }

      .table .amount {
        text-align: right;
        font-weight: 600;
      }

      .table .positive {
        color: #27ae60;
      }

      .table .negative {
        color: #e74c3c;
      }

      .trend-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid #e9ecef;
      }

      .trend-row:nth-child(even) {
        background: #f8f9fa;
      }

      .summary-box {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 6px;
        margin: 20px 0;
      }

      .summary-box h3 {
        font-size: 14px;
        margin-bottom: 15px;
        opacity: 0.9;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
      }

      .summary-item {
        text-align: center;
      }

      .summary-item .value {
        font-size: 24px;
        font-weight: 700;
      }

      .summary-item .label {
        font-size: 10px;
        opacity: 0.8;
        margin-top: 5px;
      }

      .footer {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 2px solid #dee2e6;
        text-align: center;
        color: #6c757d;
        font-size: 10px;
      }

      .page-break {
        page-break-before: always;
      }

      @media print {
        .page {
          margin: 0;
          border: none;
        }
      }
    </style>
    `;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private generateFinancialHtml(report: FinancialReportDto): string {
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report</title>
  ${this.getCommonStyles()}
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Financial Report</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
        <p>Generated: ${generatedDate}</p>
      </div>
    </div>

    <!-- Revenue Summary -->
    <h2>Revenue Summary</h2>
    <div class="metrics-grid">
      <div class="metric positive">
        <h3>${this.formatCurrency(report.revenue.totalRevenue)}</h3>
        <p>Total Revenue</p>
      </div>
      <div class="metric">
        <h3>${this.formatCurrency(report.revenue.oneTimePurchases)}</h3>
        <p>One-Time Purchases</p>
      </div>
      <div class="metric">
        <h3>${this.formatCurrency(report.revenue.subscriptionRevenue)}</h3>
        <p>Subscription Revenue</p>
      </div>
      <div class="metric">
        <h3>${this.formatCurrency(report.revenue.keywordResearchRevenue)}</h3>
        <p>Keyword Research</p>
      </div>
    </div>

    <!-- Net Revenue Summary -->
    <div class="summary-box">
      <h3>Net Revenue Analysis</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${this.formatCurrency(report.netRevenue.grossRevenue)}</div>
          <div class="label">Gross Revenue</div>
        </div>
        <div class="summary-item">
          <div class="value">${this.formatCurrency(report.netRevenue.totalPayouts)}</div>
          <div class="label">Total Payouts</div>
        </div>
        <div class="summary-item">
          <div class="value">${this.formatCurrency(report.netRevenue.netRevenue)}</div>
          <div class="label">Net Revenue</div>
        </div>
        <div class="summary-item">
          <div class="value">${report.netRevenue.profitMargin}%</div>
          <div class="label">Profit Margin</div>
        </div>
      </div>
    </div>

    <!-- Revenue by Package Type -->
    <h2>Revenue by Package Type</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Package Name</th>
          <th>Credits</th>
          <th>Purchases</th>
          <th class="amount">Total Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${report.revenue.revenueByPackageType.map(pkg => `
          <tr>
            <td>${pkg.packageName}</td>
            <td>${pkg.credits}</td>
            <td>${pkg.purchaseCount}</td>
            <td class="amount positive">${this.formatCurrency(pkg.totalRevenue)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Revenue by Payment Method -->
    <h2>Revenue by Payment Method</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Transactions</th>
          <th class="amount">Total Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${report.revenue.revenueByPaymentMethod.map(method => `
          <tr>
            <td style="text-transform: capitalize;">${method.paymentMethod}</td>
            <td>${method.transactionCount}</td>
            <td class="amount positive">${this.formatCurrency(method.totalRevenue)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="page page-break">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Financial Report - Payouts</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
      </div>
    </div>

    <!-- Reader Payouts -->
    <h2>Reader Payouts</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${this.formatCurrency(report.payouts.readerPayouts.total)}</h3>
        <p>Total</p>
      </div>
      <div class="metric positive">
        <h3>${this.formatCurrency(report.payouts.readerPayouts.completed)}</h3>
        <p>Completed</p>
      </div>
      <div class="metric warning">
        <h3>${this.formatCurrency(report.payouts.readerPayouts.pending)}</h3>
        <p>Pending</p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Count</th>
          <th class="amount">Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.payouts.readerPayouts.byMethod.map(method => `
          <tr>
            <td style="text-transform: capitalize;">${method.method}</td>
            <td>${method.count}</td>
            <td class="amount">${this.formatCurrency(method.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Affiliate Payouts -->
    <h2>Affiliate Payouts</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${this.formatCurrency(report.payouts.affiliatePayouts.total)}</h3>
        <p>Total</p>
      </div>
      <div class="metric positive">
        <h3>${this.formatCurrency(report.payouts.affiliatePayouts.completed)}</h3>
        <p>Completed</p>
      </div>
      <div class="metric warning">
        <h3>${this.formatCurrency(report.payouts.affiliatePayouts.pending)}</h3>
        <p>Pending</p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Payment Method</th>
          <th>Count</th>
          <th class="amount">Total</th>
        </tr>
      </thead>
      <tbody>
        ${report.payouts.affiliatePayouts.byMethod.map(method => `
          <tr>
            <td style="text-transform: capitalize;">${method.method}</td>
            <td>${method.count}</td>
            <td class="amount">${this.formatCurrency(method.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Revenue Trend -->
    ${report.revenueTrend.length > 0 ? `
    <h2>Revenue Trend</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th class="amount">Revenue</th>
          <th class="amount">Payouts</th>
          <th class="amount">Net</th>
        </tr>
      </thead>
      <tbody>
        ${report.revenueTrend.map(trend => `
          <tr>
            <td>${trend.date}</td>
            <td class="amount positive">${this.formatCurrency(trend.revenue)}</td>
            <td class="amount negative">${this.formatCurrency(trend.payouts)}</td>
            <td class="amount ${trend.net >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trend.net)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      <p><strong>BookProof</strong> - Financial Report</p>
      <p>This report is confidential and intended for internal use only.</p>
      <p>Generated: ${generatedDate}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private generateOperationalHtml(report: OperationalReportDto): string {
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Operational Report</title>
  ${this.getCommonStyles()}
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Operational Report</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
        <p>Generated: ${generatedDate}</p>
      </div>
    </div>

    <!-- Campaign Health -->
    <h2>Campaign Health</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${report.campaignHealth.totalCampaigns}</h3>
        <p>Total Campaigns</p>
      </div>
      <div class="metric">
        <h3>${report.campaignHealth.activeCampaigns}</h3>
        <p>Active</p>
      </div>
      <div class="metric positive">
        <h3>${report.campaignHealth.onScheduleCampaigns}</h3>
        <p>On Schedule</p>
      </div>
      <div class="metric warning">
        <h3>${report.campaignHealth.delayedCampaigns}</h3>
        <p>Delayed</p>
      </div>
    </div>

    <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="metric">
        <h3>${report.campaignHealth.completionRate}%</h3>
        <p>Completion Rate</p>
      </div>
      <div class="metric">
        <h3>${report.campaignHealth.averageCampaignDuration.toFixed(0)} days</h3>
        <p>Average Duration</p>
      </div>
    </div>

    <!-- Reader Performance Metrics -->
    <h2>Reader Performance Metrics</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${report.readerMetrics.totalActiveReaders}</h3>
        <p>Active Readers</p>
      </div>
      <div class="metric positive">
        <h3>${report.readerMetrics.reviewCompletionRate}%</h3>
        <p>Completion Rate</p>
      </div>
      <div class="metric">
        <h3>${report.readerMetrics.averageReviewsPerReader.toFixed(1)}</h3>
        <p>Avg Reviews/Reader</p>
      </div>
      <div class="metric warning">
        <h3>${report.readerMetrics.deadlineMissRate}%</h3>
        <p>Deadline Miss Rate</p>
      </div>
    </div>

    <div class="metrics-grid" style="grid-template-columns: 1fr;">
      <div class="metric">
        <h3>${report.readerMetrics.averageCompletionTime.toFixed(1)} hours</h3>
        <p>Average Completion Time</p>
      </div>
    </div>

    <!-- Validation Metrics -->
    <h2>Validation Metrics</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${report.validationMetrics.totalReviewsSubmitted}</h3>
        <p>Submitted</p>
      </div>
      <div class="metric positive">
        <h3>${report.validationMetrics.totalReviewsValidated}</h3>
        <p>Validated</p>
      </div>
      <div class="metric negative">
        <h3>${report.validationMetrics.totalReviewsRejected}</h3>
        <p>Rejected</p>
      </div>
      <div class="metric">
        <h3>${report.validationMetrics.averageValidationTime.toFixed(1)}h</h3>
        <p>Avg Validation Time</p>
      </div>
    </div>

    <div class="summary-box">
      <h3>Validation Summary</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="summary-item">
          <div class="value">${report.validationMetrics.approvalRate}%</div>
          <div class="label">Approval Rate</div>
        </div>
        <div class="summary-item">
          <div class="value">${report.validationMetrics.commonRejectionReasons.length}</div>
          <div class="label">Unique Rejection Reasons</div>
        </div>
      </div>
    </div>
  </div>

  <div class="page page-break">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Operational Report - Details</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
      </div>
    </div>

    <!-- Common Rejection Reasons -->
    ${report.validationMetrics.commonRejectionReasons.length > 0 ? `
    <h2>Common Rejection Reasons</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Reason</th>
          <th>Count</th>
          <th class="amount">Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${report.validationMetrics.commonRejectionReasons.map(reason => `
          <tr>
            <td>${reason.reason}</td>
            <td>${reason.count}</td>
            <td class="amount">${reason.percentage}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <!-- Amazon Removal Metrics -->
    <h2>Amazon Removal Metrics (14-Day Replacement Guarantee)</h2>
    <div class="metrics-grid">
      <div class="metric negative">
        <h3>${report.amazonRemovalMetrics.totalRemovals}</h3>
        <p>Total Removals</p>
      </div>
      <div class="metric">
        <h3>${report.amazonRemovalMetrics.removalRate}%</h3>
        <p>Removal Rate</p>
      </div>
      <div class="metric positive">
        <h3>${report.amazonRemovalMetrics.replacementsProvided}</h3>
        <p>Replacements Provided</p>
      </div>
      <div class="metric">
        <h3>${report.amazonRemovalMetrics.replacementRate}%</h3>
        <p>Replacement Rate</p>
      </div>
    </div>

    <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="metric">
        <h3>${report.amazonRemovalMetrics.averageDaysToRemoval.toFixed(1)} days</h3>
        <p>Avg Days to Removal</p>
      </div>
      <div class="metric">
        <h3>${report.amazonRemovalMetrics.withinGuaranteePeriod}</h3>
        <p>Within Guarantee Period</p>
      </div>
    </div>

    <!-- Per-Campaign Breakdown -->
    ${report.amazonRemovalMetrics.perCampaignBreakdown && report.amazonRemovalMetrics.perCampaignBreakdown.length > 0 ? `
    <h2>Per-Campaign Removal Breakdown</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Campaign</th>
          <th>Removals</th>
          <th>Replacements</th>
          <th>Avg Days</th>
        </tr>
      </thead>
      <tbody>
        ${report.amazonRemovalMetrics.perCampaignBreakdown.map(campaign => `
          <tr>
            <td>${campaign.campaignTitle}</td>
            <td>${campaign.totalRemovals}</td>
            <td>${campaign.replacementsProvided}</td>
            <td>${campaign.averageDaysToRemoval.toFixed(1)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      <p><strong>BookProof</strong> - Operational Report</p>
      <p>This report is confidential and intended for internal use only.</p>
      <p>Generated: ${generatedDate}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private generateAffiliateHtml(report: AffiliateReportDto): string {
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Report</title>
  ${this.getCommonStyles()}
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Affiliate Performance Report</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
        <p>Generated: ${generatedDate}</p>
      </div>
    </div>

    <!-- Overall Performance Summary -->
    <h2>Overall Performance</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${report.overallPerformance.totalAffiliates}</h3>
        <p>Total Affiliates</p>
      </div>
      <div class="metric">
        <h3>${report.overallPerformance.activeAffiliates}</h3>
        <p>Active Affiliates</p>
      </div>
      <div class="metric positive">
        <h3>${this.formatCurrency(report.overallPerformance.totalRevenue)}</h3>
        <p>Total Revenue</p>
      </div>
      <div class="metric">
        <h3>${report.overallPerformance.averageConversionRate}%</h3>
        <p>Avg Conversion Rate</p>
      </div>
    </div>

    <div class="summary-box">
      <h3>Traffic & Commission Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${report.overallPerformance.totalClicks.toLocaleString()}</div>
          <div class="label">Total Clicks</div>
        </div>
        <div class="summary-item">
          <div class="value">${report.overallPerformance.totalConversions}</div>
          <div class="label">Conversions</div>
        </div>
        <div class="summary-item">
          <div class="value">${this.formatCurrency(report.overallPerformance.totalCommissionPaid)}</div>
          <div class="label">Commission Paid</div>
        </div>
        <div class="summary-item">
          <div class="value">${this.formatCurrency(report.overallPerformance.totalCommissionPending)}</div>
          <div class="label">Commission Pending</div>
        </div>
      </div>
    </div>

    <!-- Top Affiliates by Revenue -->
    <h2>Top Affiliates by Revenue</h2>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Affiliate</th>
          <th>Code</th>
          <th>Conversions</th>
          <th>Conv. Rate</th>
          <th class="amount">Revenue</th>
          <th class="amount">Commission</th>
        </tr>
      </thead>
      <tbody>
        ${report.topAffiliates.slice(0, 15).map((affiliate, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${affiliate.affiliateName}</td>
            <td>${affiliate.referralCode}</td>
            <td>${affiliate.totalConversions}</td>
            <td>${affiliate.conversionRate}%</td>
            <td class="amount positive">${this.formatCurrency(affiliate.totalRevenue)}</td>
            <td class="amount">${this.formatCurrency(affiliate.totalCommission)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="page page-break">
    <div class="header">
      <div class="logo">BookProof</div>
      <div class="report-info">
        <h1>Affiliate Report - Details</h1>
        <p>${this.formatDate(report.period.startDate)} - ${this.formatDate(report.period.endDate)}</p>
      </div>
    </div>

    <!-- Top Conversion Rates -->
    <h2>Top Conversion Rates</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Affiliate</th>
          <th>Clicks</th>
          <th>Conversions</th>
          <th class="amount">Conversion Rate</th>
        </tr>
      </thead>
      <tbody>
        ${report.conversionRates.slice(0, 15).map(affiliate => `
          <tr>
            <td>${affiliate.affiliateName}</td>
            <td>${affiliate.clicks.toLocaleString()}</td>
            <td>${affiliate.conversions}</td>
            <td class="amount positive">${affiliate.conversionRate}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Commission Costs Summary -->
    <h2>Commission Costs Summary</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${this.formatCurrency(report.commissionCosts.totalCommissionEarned)}</h3>
        <p>Total Earned</p>
      </div>
      <div class="metric positive">
        <h3>${this.formatCurrency(report.commissionCosts.totalCommissionPaid)}</h3>
        <p>Paid</p>
      </div>
      <div class="metric warning">
        <h3>${this.formatCurrency(report.commissionCosts.totalCommissionPending)}</h3>
        <p>Pending</p>
      </div>
      <div class="metric">
        <h3>${report.commissionCosts.averageCommissionRate}%</h3>
        <p>Avg Commission Rate</p>
      </div>
    </div>

    <!-- Commission by Affiliate -->
    <h2>Commission by Affiliate</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Affiliate</th>
          <th class="amount">Total</th>
          <th class="amount">Paid</th>
          <th class="amount">Pending</th>
        </tr>
      </thead>
      <tbody>
        ${report.commissionCosts.commissionByAffiliate.slice(0, 15).map(affiliate => `
          <tr>
            <td>${affiliate.affiliateName}</td>
            <td class="amount">${this.formatCurrency(affiliate.totalCommission)}</td>
            <td class="amount positive">${this.formatCurrency(affiliate.paidCommission)}</td>
            <td class="amount warning">${this.formatCurrency(affiliate.pendingCommission)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p><strong>BookProof</strong> - Affiliate Performance Report</p>
      <p>This report is confidential and intended for internal use only.</p>
      <p>Generated: ${generatedDate}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private async convertHtmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
