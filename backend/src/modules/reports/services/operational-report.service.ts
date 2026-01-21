import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { OperationalReportDto } from '../dto/admin-reports.dto';

@Injectable()
export class OperationalReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOperationalReport(
    startDate: Date,
    endDate: Date,
  ): Promise<OperationalReportDto> {
    // Campaign Health Metrics
    const campaignHealth = await this.calculateCampaignHealth(startDate, endDate);

    // Reader Performance Metrics
    const readerMetrics = await this.calculateReaderMetrics(startDate, endDate);

    // Validation Metrics
    const validationMetrics = await this.calculateValidationMetrics(
      startDate,
      endDate,
    );

    // Amazon Removal Metrics
    const amazonRemovalMetrics = await this.calculateAmazonRemovalMetrics(
      startDate,
      endDate,
    );

    return {
      campaignHealth,
      readerMetrics,
      validationMetrics,
      amazonRemovalMetrics,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }

  private async calculateCampaignHealth(startDate: Date, endDate: Date) {
    // Total campaigns (all statuses)
    const totalCampaigns = await this.prisma.book.count({
      where: {
        createdAt: { lte: endDate },
      },
    });

    // Active campaigns
    const activeCampaigns = await this.prisma.book.count({
      where: {
        status: 'ACTIVE',
        campaignStartDate: { lte: endDate },
      },
    });

    // Fetch all active campaigns to categorize
    const campaigns = await this.prisma.book.findMany({
      where: {
        status: 'ACTIVE',
        campaignStartDate: { lte: endDate },
      },
      select: {
        id: true,
        targetReviews: true,
        totalReviewsDelivered: true,
        reviewsPerWeek: true,
        currentWeek: true,
        campaignStartDate: true,
        campaignEndDate: true,
      },
    });

    let onScheduleCampaigns = 0;
    let delayedCampaigns = 0;
    let totalCampaignDurationDays = 0;

    campaigns.forEach((campaign) => {
      const expectedReviewsByNow =
        (campaign.reviewsPerWeek || 5) * (campaign.currentWeek || 1);
      const variance = campaign.totalReviewsDelivered - expectedReviewsByNow;

      if (variance >= -(campaign.reviewsPerWeek || 5)) {
        onScheduleCampaigns++;
      } else {
        delayedCampaigns++;
      }

      // Calculate campaign duration
      if (campaign.campaignStartDate && campaign.campaignEndDate) {
        const durationMs =
          campaign.campaignEndDate.getTime() -
          campaign.campaignStartDate.getTime();
        totalCampaignDurationDays += durationMs / (1000 * 60 * 60 * 24);
      }
    });

    // Completed campaigns within period
    const completedCampaigns = await this.prisma.book.count({
      where: {
        status: 'COMPLETED',
        campaignEndDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Completion rate
    const totalTrackedCampaigns = activeCampaigns + completedCampaigns;
    const completionRate =
      totalTrackedCampaigns > 0
        ? (completedCampaigns / totalTrackedCampaigns) * 100
        : 0;

    // Average campaign duration
    const averageCampaignDuration =
      campaigns.length > 0 ? totalCampaignDurationDays / campaigns.length : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      onScheduleCampaigns,
      delayedCampaigns,
      completionRate: parseFloat(completionRate.toFixed(2)),
      averageCampaignDuration: parseFloat(averageCampaignDuration.toFixed(2)),
    };
  }

  private async calculateReaderMetrics(startDate: Date, endDate: Date) {
    // Total active readers
    const totalActiveReaders = await this.prisma.readerProfile.count({
      where: {
        isActive: true,
      },
    });

    // Get all assignments within the period
    const assignments = await this.prisma.readerAssignment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        readerProfileId: true,
        materialsReleasedAt: true,
        deadlineAt: true,
        review: {
          select: {
            submittedAt: true,
            status: true,
          },
        },
      },
    });

    // Calculate completion metrics
    const completedAssignments = assignments.filter(
      (a) => a.status === 'COMPLETED' || a.status === 'VALIDATED',
    ).length;
    const expiredAssignments = assignments.filter(
      (a) => a.status === 'EXPIRED',
    ).length;

    const totalAssignments = assignments.length;
    const reviewCompletionRate =
      totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    // Average reviews per reader
    const readerAssignmentCounts: Map<string, number> = new Map();
    assignments.forEach((a) => {
      const count = readerAssignmentCounts.get(a.readerProfileId) || 0;
      readerAssignmentCounts.set(a.readerProfileId, count + 1);
    });

    const averageReviewsPerReader =
      readerAssignmentCounts.size > 0
        ? totalAssignments / readerAssignmentCounts.size
        : 0;

    // Deadline miss rate
    const deadlineMissRate =
      totalAssignments > 0 ? (expiredAssignments / totalAssignments) * 100 : 0;

    // Average completion time (from material release to submission)
    const completionTimes: number[] = [];
    assignments.forEach((a) => {
      if (
        a.materialsReleasedAt &&
        a.review?.submittedAt &&
        (a.status === 'COMPLETED' || a.status === 'VALIDATED')
      ) {
        const timeMs =
          a.review.submittedAt.getTime() - a.materialsReleasedAt.getTime();
        const hours = timeMs / (1000 * 60 * 60);
        completionTimes.push(hours);
      }
    });

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length
        : 0;

    return {
      totalActiveReaders,
      reviewCompletionRate: parseFloat(reviewCompletionRate.toFixed(2)),
      averageReviewsPerReader: parseFloat(averageReviewsPerReader.toFixed(2)),
      deadlineMissRate: parseFloat(deadlineMissRate.toFixed(2)),
      averageCompletionTime: parseFloat(averageCompletionTime.toFixed(2)),
    };
  }

  private async calculateValidationMetrics(startDate: Date, endDate: Date) {
    // Get all reviews submitted within period
    const reviews = await this.prisma.review.findMany({
      where: {
        submittedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        validatedAt: true,
        issues: {
          select: {
            issueType: true,
            description: true,
          },
        },
      },
    });

    const totalReviewsSubmitted = reviews.length;
    const totalReviewsValidated = reviews.filter(
      (r) => r.status === 'VALIDATED',
    ).length;
    const totalReviewsRejected = reviews.filter(
      (r) => r.status === 'REJECTED',
    ).length;

    // Approval rate
    const totalProcessed = totalReviewsValidated + totalReviewsRejected;
    const approvalRate =
      totalProcessed > 0 ? (totalReviewsValidated / totalProcessed) * 100 : 0;

    // Average validation time (from submission to validation)
    const validationTimes: number[] = [];
    reviews.forEach((r) => {
      if (r.submittedAt && r.validatedAt) {
        const timeMs = r.validatedAt.getTime() - r.submittedAt.getTime();
        const hours = timeMs / (1000 * 60 * 60);
        validationTimes.push(hours);
      }
    });

    const averageValidationTime =
      validationTimes.length > 0
        ? validationTimes.reduce((sum, t) => sum + t, 0) / validationTimes.length
        : 0;

    // Common rejection reasons
    const rejectionReasonCounts: Map<string, number> = new Map();
    reviews.forEach((r) => {
      if (r.status === 'REJECTED' && r.issues.length > 0) {
        r.issues.forEach((issue) => {
          const reason = issue.issueType || 'OTHER';
          rejectionReasonCounts.set(
            reason,
            (rejectionReasonCounts.get(reason) || 0) + 1,
          );
        });
      }
    });

    const commonRejectionReasons = Array.from(rejectionReasonCounts.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: parseFloat(
          ((count / totalReviewsRejected) * 100).toFixed(2),
        ),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 reasons

    return {
      totalReviewsSubmitted,
      totalReviewsValidated,
      totalReviewsRejected,
      approvalRate: parseFloat(approvalRate.toFixed(2)),
      averageValidationTime: parseFloat(averageValidationTime.toFixed(2)),
      commonRejectionReasons,
    };
  }

  private async calculateAmazonRemovalMetrics(startDate: Date, endDate: Date) {
    // Get all reviews that were removed by Amazon within period
    const removedReviews = await this.prisma.review.findMany({
      where: {
        removedByAmazon: true,
        removalDetectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        replacementEligible: true,
        replacementProvided: true,
        validatedAt: true,
        removalDetectedAt: true,
      },
    });

    const totalRemovals = removedReviews.length;

    // Calculate removal rate (removals / total validated reviews in period)
    const totalValidatedReviews = await this.prisma.review.count({
      where: {
        status: 'VALIDATED',
        validatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const removalRate =
      totalValidatedReviews > 0
        ? (totalRemovals / totalValidatedReviews) * 100
        : 0;

    // Replacements provided
    const replacementsProvided = removedReviews.filter(
      (r) => r.replacementProvided,
    ).length;

    // Within guarantee period (14 days from validation)
    const withinGuaranteePeriod = removedReviews.filter((r) => {
      if (!r.validatedAt || !r.removalDetectedAt) return false;
      const daysDiff =
        (r.removalDetectedAt.getTime() - r.validatedAt.getTime()) /
        (1000 * 60 * 60 * 24);
      return daysDiff <= 14;
    }).length;

    return {
      totalRemovals,
      removalRate: parseFloat(removalRate.toFixed(2)),
      replacementsProvided,
      withinGuaranteePeriod,
    };
  }
}
