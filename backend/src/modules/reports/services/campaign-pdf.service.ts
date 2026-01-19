import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import puppeteer from 'puppeteer';

interface RatingTrendData {
  week: number;
  avgRating: number;
  count: number;
}

interface CampaignReportData {
  bookTitle: string;
  authorName: string;
  totalReviewsDelivered: number;
  totalReviewsValidated: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
  campaignStartDate: Date;
  campaignEndDate: Date;
  totalWeeks: number;
  ratingTrends: RatingTrendData[];
  anonymousFeedback: string[];
  delaysEncountered: number;
  replacementsProvided: number;
  successRate: number;
  generatedDate: string;
}

@Injectable()
export class CampaignPdfService {
  private readonly logger = new Logger(CampaignPdfService.name);

  constructor(private prisma: PrismaService) {}

  async generateCampaignReport(bookId: string): Promise<Buffer> {
    this.logger.log(`Generating campaign report PDF for book: ${bookId}`);

    // 1. Fetch campaign data with all metrics
    const data = await this.fetchCampaignData(bookId);

    // 2. Generate HTML template
    const html = this.generateHtmlTemplate(data);

    // 3. Convert to PDF with Puppeteer
    const pdfBuffer = await this.convertHtmlToPdf(html);

    this.logger.log(`Campaign report PDF generated successfully for book: ${bookId}`);
    return pdfBuffer;
  }

  private async fetchCampaignData(bookId: string): Promise<CampaignReportData> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        authorProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!book) {
      throw new Error(`Book not found: ${bookId}`);
    }

    // Get all reviews for this campaign
    const reviews = await this.prisma.review.findMany({
      where: {
        readerAssignment: {
          book: {
            id: bookId,
          },
        },
        status: 'VALIDATED',
      },
      include: {
        readerAssignment: true,
      },
    });

    // Calculate rating distribution
    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalRating = 0;
    const anonymousFeedback: string[] = [];

    reviews.forEach((review) => {
      if (review.internalRating) {
        const rating = review.internalRating;
        ratingCounts[rating as keyof typeof ratingCounts]++;
        totalRating += rating;
      }

      if (review.internalFeedback) {
        anonymousFeedback.push(review.internalFeedback);
      }
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Calculate delays and replacements
    const assignments = await this.prisma.readerAssignment.findMany({
      where: {
        bookId,
      },
    });

    const delaysEncountered = assignments.filter(
      (a) => a.status === 'EXPIRED',
    ).length;

    const replacementsProvided = assignments.filter(
      (a) => a.status === 'REASSIGNED',
    ).length;

    const successRate =
      assignments.length > 0
        ? ((reviews.length / assignments.length) * 100).toFixed(2)
        : 0;

    // Calculate campaign duration
    const startDate = book.campaignStartDate || book.createdAt;
    const endDate = book.campaignEndDate || new Date();
    const totalWeeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );

    // Calculate rating trends over time
    const ratingTrends = this.calculateRatingTrends(reviews, startDate, totalWeeks);

    return {
      bookTitle: book.title,
      authorName: book.authorName,
      totalReviewsDelivered: reviews.length,
      totalReviewsValidated: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1],
      campaignStartDate: startDate,
      campaignEndDate: endDate,
      totalWeeks,
      ratingTrends,
      anonymousFeedback: anonymousFeedback.slice(0, 10), // Limit to 10 feedback items
      delaysEncountered,
      replacementsProvided,
      successRate: parseFloat(successRate.toString()),
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }

  /**
   * Calculate rating trends over time (weekly averages)
   */
  private calculateRatingTrends(
    reviews: any[],
    campaignStartDate: Date,
    totalWeeks: number,
  ): RatingTrendData[] {
    const trends: RatingTrendData[] = [];
    const weekMillis = 7 * 24 * 60 * 60 * 1000;

    for (let week = 1; week <= totalWeeks; week++) {
      const weekStart = new Date(campaignStartDate.getTime() + (week - 1) * weekMillis);
      const weekEnd = new Date(campaignStartDate.getTime() + week * weekMillis);

      // Filter reviews validated during this week
      const weekReviews = reviews.filter((review) => {
        const validatedAt = review.validatedAt || review.updatedAt;
        return validatedAt >= weekStart && validatedAt < weekEnd;
      });

      if (weekReviews.length > 0) {
        const weekTotalRating = weekReviews.reduce(
          (sum, r) => sum + (r.internalRating || 0),
          0,
        );
        const weekAvgRating = weekTotalRating / weekReviews.length;

        trends.push({
          week,
          avgRating: parseFloat(weekAvgRating.toFixed(2)),
          count: weekReviews.length,
        });
      }
    }

    return trends;
  }

  private generateHtmlTemplate(data: CampaignReportData): string {
    const maxRating = Math.max(
      data.fiveStarCount,
      data.fourStarCount,
      data.threeStarCount,
      data.twoStarCount,
      data.oneStarCount,
    );

    const getBarWidth = (count: number) =>
      maxRating > 0 ? ((count / maxRating) * 100).toFixed(2) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Report - ${data.bookTitle}</title>
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
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
    }

    .cover-page {
      text-align: center;
      padding-top: 80px;
      page-break-after: always;
    }

    .cover-page h1 {
      font-size: 36px;
      color: #2c3e50;
      margin-bottom: 20px;
      font-weight: 700;
    }

    .cover-page h2 {
      font-size: 28px;
      color: #3498db;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .cover-page p {
      font-size: 18px;
      color: #7f8c8d;
      margin-bottom: 10px;
    }

    .cover-page .date {
      font-size: 16px;
      color: #95a5a6;
      margin-top: 60px;
    }

    .logo {
      margin-bottom: 40px;
      font-size: 48px;
      font-weight: 900;
      color: #3498db;
    }

    .content-page {
      page-break-before: always;
    }

    h2 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 20px;
      margin-top: 30px;
      padding-bottom: 10px;
      border-bottom: 3px solid #3498db;
      font-weight: 600;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .metric {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid #e9ecef;
    }

    .metric h3 {
      font-size: 36px;
      color: #3498db;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .metric p {
      font-size: 14px;
      color: #6c757d;
      font-weight: 500;
    }

    .rating-bar {
      display: flex;
      align-items: center;
      margin: 15px 0;
      gap: 10px;
    }

    .rating-label {
      width: 80px;
      font-weight: 600;
      color: #495057;
      font-size: 14px;
    }

    .bar-container {
      flex: 1;
      height: 30px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2980b9);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-weight: 600;
      font-size: 13px;
      transition: width 0.3s ease;
    }

    .feedback-section {
      margin: 30px 0;
    }

    .feedback-item {
      background: #f8f9fa;
      padding: 20px;
      margin: 15px 0;
      border-left: 4px solid #3498db;
      border-radius: 4px;
      font-style: italic;
      color: #495057;
      line-height: 1.7;
    }

    .performance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .performance-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 6px;
      text-align: center;
    }

    .performance-item h4 {
      font-size: 14px;
      margin-bottom: 10px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .performance-item p {
      font-size: 32px;
      font-weight: 700;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #6c757d;
      font-size: 12px;
    }

    .footer p {
      margin: 5px 0;
    }

    .timeline {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .timeline-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #dee2e6;
    }

    .timeline-item:last-child {
      border-bottom: none;
    }

    .timeline-label {
      font-weight: 600;
      color: #495057;
    }

    .timeline-value {
      color: #6c757d;
    }

    @media print {
      .page {
        margin: 0;
        border: none;
        width: auto;
        height: auto;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="page cover-page">
    <div class="logo">BookProof</div>
    <h1>Campaign Report</h1>
    <h2>${data.bookTitle}</h2>
    <p>by ${data.authorName}</p>
    <p class="date">Campaign Duration: ${data.campaignStartDate.toLocaleDateString()} - ${data.campaignEndDate.toLocaleDateString()}</p>
    <div class="footer">
      <p>Generated on ${data.generatedDate}</p>
      <p>© ${new Date().getFullYear()} BookProof. All rights reserved.</p>
    </div>
  </div>

  <!-- Summary Page -->
  <div class="page content-page">
    <h2>Campaign Summary</h2>
    <div class="metrics-grid">
      <div class="metric">
        <h3>${data.totalReviewsDelivered}</h3>
        <p>Reviews Delivered</p>
      </div>
      <div class="metric">
        <h3>${data.averageRating.toFixed(1)}</h3>
        <p>Average Rating</p>
      </div>
      <div class="metric">
        <h3>${data.successRate}%</h3>
        <p>Success Rate</p>
      </div>
    </div>

    <h2>Rating Distribution</h2>
    <div class="rating-bar">
      <div class="rating-label">5 Stars</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${getBarWidth(data.fiveStarCount)}%">${data.fiveStarCount}</div>
      </div>
    </div>
    <div class="rating-bar">
      <div class="rating-label">4 Stars</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${getBarWidth(data.fourStarCount)}%">${data.fourStarCount}</div>
      </div>
    </div>
    <div class="rating-bar">
      <div class="rating-label">3 Stars</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${getBarWidth(data.threeStarCount)}%">${data.threeStarCount}</div>
      </div>
    </div>
    <div class="rating-bar">
      <div class="rating-label">2 Stars</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${getBarWidth(data.twoStarCount)}%">${data.twoStarCount}</div>
      </div>
    </div>
    <div class="rating-bar">
      <div class="rating-label">1 Star</div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${getBarWidth(data.oneStarCount)}%">${data.oneStarCount}</div>
      </div>
    </div>

    <h2>Campaign Timeline</h2>
    <div class="timeline">
      <div class="timeline-item">
        <span class="timeline-label">Start Date:</span>
        <span class="timeline-value">${data.campaignStartDate.toLocaleDateString()}</span>
      </div>
      <div class="timeline-item">
        <span class="timeline-label">End Date:</span>
        <span class="timeline-value">${data.campaignEndDate.toLocaleDateString()}</span>
      </div>
      <div class="timeline-item">
        <span class="timeline-label">Total Duration:</span>
        <span class="timeline-value">${data.totalWeeks} weeks</span>
      </div>
    </div>

    ${
      data.ratingTrends.length > 0
        ? `
    <h2>Rating Trends Over Time</h2>
    <p style="color: #6c757d; margin-bottom: 20px;">Weekly average ratings throughout the campaign</p>
    <div class="trends-container" style="margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 6px;">
      <div style="display: flex; align-items: flex-end; height: 150px; gap: 10px; justify-content: space-around;">
        ${data.ratingTrends
          .map(
            (trend) => `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="background: linear-gradient(180deg, #3498db, #2980b9); width: 40px; height: ${(trend.avgRating / 5) * 100}px; border-radius: 4px 4px 0 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 5px;">
              <span style="color: white; font-size: 11px; font-weight: 600;">${trend.avgRating}</span>
            </div>
            <div style="margin-top: 8px; text-align: center;">
              <div style="font-size: 12px; font-weight: 600; color: #495057;">Week ${trend.week}</div>
              <div style="font-size: 10px; color: #6c757d;">${trend.count} reviews</div>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
    `
        : ''
    }
  </div>

  ${
    data.anonymousFeedback.length > 0
      ? `
  <!-- Feedback Page -->
  <div class="page content-page">
    <h2>Reader Feedback</h2>
    <p style="color: #6c757d; margin-bottom: 20px;">All feedback is anonymized to protect reader privacy.</p>
    <div class="feedback-section">
      ${data.anonymousFeedback
        .map(
          (feedback) => `
        <div class="feedback-item">
          "${feedback}"
        </div>
      `,
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  <!-- Performance Page -->
  <div class="page content-page">
    <h2>Performance Metrics</h2>
    <div class="performance-grid">
      <div class="performance-item">
        <h4>Success Rate</h4>
        <p>${data.successRate}%</p>
      </div>
      <div class="performance-item">
        <h4>Delays</h4>
        <p>${data.delaysEncountered}</p>
      </div>
      <div class="performance-item">
        <h4>Replacements</h4>
        <p>${data.replacementsProvided}</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>BookProof</strong> - Professional Amazon Review Campaigns</p>
      <p>Generated by BookProof Campaign Management System</p>
      <p>Report Date: ${data.generatedDate}</p>
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
