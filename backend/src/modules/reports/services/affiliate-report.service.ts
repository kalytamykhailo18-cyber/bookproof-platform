import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AffiliateReportDto } from '../dto/admin-reports.dto';

@Injectable()
export class AffiliateReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateAffiliateReport(
    startDate: Date,
    endDate: Date,
  ): Promise<AffiliateReportDto> {
    // Get all affiliates
    const affiliates = await this.prisma.affiliateProfile.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        clicks: {
          where: {
            clickedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        referrals: {
          where: {
            registeredAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        commissions: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    // Calculate metrics for each affiliate
    const affiliateMetrics = affiliates.map((affiliate) => {
      const totalClicks = affiliate.clicks.length;
      const totalConversions = affiliate.referrals.length;
      const conversionRate =
        totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      const totalCommission = affiliate.commissions.reduce(
        (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
        0,
      );

      const pendingCommission = affiliate.commissions
        .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
        .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

      const totalRevenue = affiliate.commissions.reduce(
        (sum, c) => sum + parseFloat(c.purchaseAmount.toString()),
        0,
      );

      return {
        affiliateId: affiliate.id,
        affiliateName: affiliate.user.name,
        referralCode: affiliate.referralCode,
        totalRevenue,
        totalConversions,
        totalClicks,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        totalCommission,
        pendingCommission,
      };
    });

    // Sort by revenue and get top performers
    const topAffiliates = [...affiliateMetrics]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20); // Top 20

    // Overall performance
    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter((a) => a.isActive).length;

    const totalClicks = affiliateMetrics.reduce(
      (sum, a) => sum + a.totalClicks,
      0,
    );
    const totalConversions = affiliateMetrics.reduce(
      (sum, a) => sum + a.totalConversions,
      0,
    );
    const totalRevenue = affiliateMetrics.reduce(
      (sum, a) => sum + a.totalRevenue,
      0,
    );
    const averageConversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Commission totals
    const allCommissions = await this.prisma.affiliateCommission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalCommissionPaid = allCommissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

    const totalCommissionPending = allCommissions
      .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

    // Conversion rates by affiliate
    const conversionRates = affiliateMetrics
      .map((a) => ({
        affiliateId: a.affiliateId,
        affiliateName: a.affiliateName,
        clicks: a.totalClicks,
        conversions: a.totalConversions,
        conversionRate: a.conversionRate,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 20); // Top 20 by conversion rate

    // Commission costs breakdown
    const commissionByAffiliate = affiliateMetrics.map((a) => {
      const paidCommissions = affiliates
        .find((af) => af.id === a.affiliateId)
        ?.commissions.filter((c) => c.status === 'PAID') || [];

      const paidCommission = paidCommissions.reduce(
        (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
        0,
      );

      return {
        affiliateId: a.affiliateId,
        affiliateName: a.affiliateName,
        totalCommission: a.totalCommission,
        paidCommission,
        pendingCommission: a.pendingCommission,
      };
    });

    // Calculate average commission rate
    const totalCommissionEarned = affiliateMetrics.reduce(
      (sum, a) => sum + a.totalCommission,
      0,
    );
    const averageCommissionRate =
      totalRevenue > 0 ? (totalCommissionEarned / totalRevenue) * 100 : 0;

    return {
      topAffiliates,
      overallPerformance: {
        totalAffiliates,
        activeAffiliates,
        totalClicks,
        totalConversions,
        totalRevenue,
        averageConversionRate: parseFloat(averageConversionRate.toFixed(2)),
        totalCommissionPaid,
        totalCommissionPending,
      },
      conversionRates,
      commissionCosts: {
        totalCommissionEarned,
        totalCommissionPaid,
        totalCommissionPending,
        averageCommissionRate: parseFloat(averageCommissionRate.toFixed(2)),
        commissionByAffiliate,
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }
}
