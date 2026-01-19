import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { FilesService } from '@modules/files/files.service';
import { CampaignPdfService } from './services/campaign-pdf.service';
import { CampaignReportResponseDto } from './dto/campaign-report.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private campaignPdfService: CampaignPdfService,
    private filesService: FilesService,
  ) {}

  async generateCampaignReport(bookId: string): Promise<CampaignReportResponseDto> {
    this.logger.log(`Generating campaign report for book: ${bookId}`);

    try {
      // 1. Calculate all metrics from Reviews
      const metrics = await this.calculateCampaignMetrics(bookId);

      // 2. Generate PDF with CampaignPdfService
      const pdfBuffer = await this.campaignPdfService.generateCampaignReport(bookId);

      // 3. Upload PDF to R2 storage
      const pdfKey = `reports/campaign-${bookId}-${Date.now()}.pdf`;
      const { url: pdfUrl } = await this.filesService.uploadFile(
        pdfBuffer,
        pdfKey,
        'application/pdf',
      );

      // 4. Create or update CampaignReport record
      const existingReport = await this.prisma.campaignReport.findUnique({
        where: { bookId },
      });

      const report = existingReport
        ? await this.prisma.campaignReport.update({
            where: { bookId },
            data: {
              ...metrics,
              pdfUrl,
              pdfFileName: pdfKey.split('/').pop(),
              generatedAt: new Date(),
            },
          })
        : await this.prisma.campaignReport.create({
            data: {
              bookId,
              ...metrics,
              pdfUrl,
              pdfFileName: pdfKey.split('/').pop(),
              generatedAt: new Date(),
            },
          });

      this.logger.log(`Campaign report generated successfully for book: ${bookId}`);

      return this.mapToResponse(report);
    } catch (error) {
      this.logger.error(`Failed to generate campaign report for book: ${bookId}`, error);
      throw error;
    }
  }

  async getCampaignReport(bookId: string): Promise<CampaignReportResponseDto | null> {
    const report = await this.prisma.campaignReport.findUnique({
      where: { bookId },
    });

    if (!report) {
      return null;
    }

    return this.mapToResponse(report);
  }

  async getReports(): Promise<CampaignReportResponseDto[]> {
    const reports = await this.prisma.campaignReport.findMany({
      orderBy: { generatedAt: 'desc' },
    });

    return reports.map((report) => this.mapToResponse(report));
  }

  async getReportsByAuthor(authorProfileId: string): Promise<CampaignReportResponseDto[]> {
    const reports = await this.prisma.campaignReport.findMany({
      where: {
        book: {
          authorProfileId,
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return reports.map((report) => this.mapToResponse(report));
  }

  async isReportOwner(bookId: string, authorProfileId: string): Promise<boolean> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: bookId,
        authorProfileId,
      },
    });

    return !!book;
  }

  async getDownloadUrl(bookId: string): Promise<string> {
    const report = await this.prisma.campaignReport.findUnique({
      where: { bookId },
    });

    if (!report || !report.pdfFileName) {
      throw new NotFoundException('Report not found');
    }

    // Generate signed URL for 1 hour
    const signedUrl = await this.filesService.getSignedUrl(
      `reports/${report.pdfFileName}`,
      3600,
    );

    return signedUrl;
  }

  private async calculateCampaignMetrics(bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book not found: ${bookId}`);
    }

    // Get all validated reviews with validation date
    const reviews = await this.prisma.review.findMany({
      where: {
        readerAssignment: {
          bookId,
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
      where: { bookId },
    });

    const delaysEncountered = assignments.filter(
      (a) => a.status === 'EXPIRED',
    ).length;

    const replacementsProvided = assignments.filter(
      (a) => a.status === 'REASSIGNED',
    ).length;

    const successRate =
      assignments.length > 0 ? (reviews.length / assignments.length) * 100 : 0;

    // Calculate campaign duration
    const startDate = book.campaignStartDate || book.createdAt;
    const endDate = book.campaignEndDate || new Date();
    const totalWeeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
    );

    // Calculate rating trends over time (weekly averages)
    const ratingTrends = this.calculateRatingTrends(reviews, startDate, totalWeeks);

    return {
      totalReviewsDelivered: reviews.length,
      totalReviewsValidated: reviews.length,
      averageRating: new Decimal(averageRating.toFixed(2)),
      fiveStarCount: ratingCounts[5],
      fourStarCount: ratingCounts[4],
      threeStarCount: ratingCounts[3],
      twoStarCount: ratingCounts[2],
      oneStarCount: ratingCounts[1],
      campaignStartDate: startDate,
      campaignEndDate: endDate,
      totalWeeks,
      anonymousFeedback: JSON.stringify(anonymousFeedback.slice(0, 10)),
      ratingTrends: JSON.stringify(ratingTrends),
      delaysEncountered,
      replacementsProvided,
      successRate: new Decimal(successRate.toFixed(2)),
    };
  }

  /**
   * Calculate rating trends over time (weekly averages)
   * Returns array of { week, avgRating, count } objects
   */
  private calculateRatingTrends(
    reviews: any[],
    campaignStartDate: Date,
    totalWeeks: number,
  ): { week: number; avgRating: number; count: number }[] {
    const trends: { week: number; avgRating: number; count: number }[] = [];
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
      } else {
        // Include week even if no reviews (shows gaps)
        trends.push({
          week,
          avgRating: 0,
          count: 0,
        });
      }
    }

    // Remove trailing weeks with no reviews
    while (trends.length > 0 && trends[trends.length - 1].count === 0) {
      trends.pop();
    }

    return trends;
  }

  private mapToResponse(report: any): CampaignReportResponseDto {
    // Parse anonymous feedback from JSON string
    let anonymousFeedback: string[] = [];
    if (report.anonymousFeedback) {
      try {
        anonymousFeedback = JSON.parse(report.anonymousFeedback);
      } catch {
        anonymousFeedback = [];
      }
    }

    // Parse rating trends from JSON string
    let ratingTrends: { week: number; avgRating: number; count: number }[] = [];
    if (report.ratingTrends) {
      try {
        ratingTrends = JSON.parse(report.ratingTrends);
      } catch {
        ratingTrends = [];
      }
    }

    return {
      id: report.id,
      bookId: report.bookId,
      totalReviewsDelivered: report.totalReviewsDelivered,
      totalReviewsValidated: report.totalReviewsValidated,
      averageRating: report.averageRating.toNumber(),
      ratingDistribution: {
        fiveStar: report.fiveStarCount,
        fourStar: report.fourStarCount,
        threeStar: report.threeStarCount,
        twoStar: report.twoStarCount,
        oneStar: report.oneStarCount,
      },
      ratingTrends: ratingTrends.length > 0 ? ratingTrends : undefined,
      campaignDuration: {
        startDate: report.campaignStartDate,
        endDate: report.campaignEndDate,
        totalWeeks: report.totalWeeks,
      },
      performanceMetrics: {
        successRate: report.successRate.toNumber(),
        delaysEncountered: report.delaysEncountered,
        replacementsProvided: report.replacementsProvided,
      },
      anonymousFeedback: anonymousFeedback.length > 0 ? anonymousFeedback : undefined,
      pdfUrl: report.pdfUrl,
      generatedAt: report.generatedAt,
      emailedAt: report.emailedAt,
    };
  }
}
