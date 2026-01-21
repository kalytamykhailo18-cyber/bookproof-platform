import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { FinancialReportDto } from '../dto/admin-reports.dto';

@Injectable()
export class FinancialReportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateFinancialReport(
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialReportDto> {
    // Fetch all completed credit purchases within date range
    const creditPurchases = await this.prisma.creditPurchase.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        purchaseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        packageTier: true,
      },
    });

    // Fetch keyword research orders within date range
    const keywordOrders = await this.prisma.keywordResearch.findMany({
      where: {
        paid: true,
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch reader payout requests within date range
    const readerPayouts = await this.prisma.payoutRequest.findMany({
      where: {
        requestedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch affiliate payouts within date range
    const affiliatePayouts = await this.prisma.affiliatePayout.findMany({
      where: {
        requestedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate revenue breakdown
    let oneTimePurchases = 0;
    let subscriptionRevenue = 0;
    const revenueByPackage: Map<
      string,
      { credits: number; revenue: number; count: number }
    > = new Map();
    const revenueByPaymentMethod: Map<string, { revenue: number; count: number }> =
      new Map();

    creditPurchases.forEach((purchase) => {
      const amount = parseFloat(purchase.amountPaid.toString());

      // One-time vs subscription (assuming packageTier exists for one-time)
      if (purchase.packageTierId) {
        oneTimePurchases += amount;

        // Revenue by package type
        const pkgName = purchase.packageTier?.name || 'Custom';
        const pkgCredits = purchase.packageTier?.credits || purchase.credits;
        const existing = revenueByPackage.get(pkgName) || {
          credits: pkgCredits,
          revenue: 0,
          count: 0,
        };
        revenueByPackage.set(pkgName, {
          credits: pkgCredits,
          revenue: existing.revenue + amount,
          count: existing.count + 1,
        });
      } else {
        // Treat as subscription or custom
        subscriptionRevenue += amount;
      }

      // Revenue by payment method
      const method = purchase.paymentMethod || 'unknown';
      const methodData = revenueByPaymentMethod.get(method) || {
        revenue: 0,
        count: 0,
      };
      revenueByPaymentMethod.set(method, {
        revenue: methodData.revenue + amount,
        count: methodData.count + 1,
      });
    });

    // Keyword research revenue
    const keywordResearchRevenue = keywordOrders.reduce(
      (sum, order) => sum + parseFloat(order.price.toString()),
      0,
    );

    const totalRevenue = oneTimePurchases + subscriptionRevenue + keywordResearchRevenue;

    // Calculate payout breakdown
    const readerPayoutStats = this.calculatePayoutStats(readerPayouts);
    const affiliatePayoutStats = this.calculatePayoutStats(affiliatePayouts);

    const totalPayouts =
      readerPayoutStats.total + affiliatePayoutStats.total;

    // Net revenue calculation
    const netRevenue = totalRevenue - totalPayouts;
    const profitMargin =
      totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100) : 0;

    // Revenue trend (group by day or month depending on range)
    const revenueTrend = await this.calculateRevenueTrend(startDate, endDate);

    return {
      revenue: {
        totalRevenue,
        oneTimePurchases,
        subscriptionRevenue,
        keywordResearchRevenue,
        revenueByPackageType: Array.from(revenueByPackage.entries()).map(
          ([packageName, data]) => ({
            packageName,
            credits: data.credits,
            totalRevenue: data.revenue,
            purchaseCount: data.count,
          }),
        ),
        revenueByPaymentMethod: Array.from(revenueByPaymentMethod.entries()).map(
          ([paymentMethod, data]) => ({
            paymentMethod,
            totalRevenue: data.revenue,
            transactionCount: data.count,
          }),
        ),
      },
      payouts: {
        readerPayouts: readerPayoutStats,
        affiliatePayouts: affiliatePayoutStats,
      },
      netRevenue: {
        grossRevenue: totalRevenue,
        totalPayouts,
        netRevenue,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
      },
      revenueTrend,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };
  }

  private calculatePayoutStats(payouts: any[]) {
    const total = payouts.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0,
    );
    const pending = payouts
      .filter((p) => ['REQUESTED', 'PENDING_REVIEW', 'APPROVED', 'PROCESSING'].includes(p.status))
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const completed = payouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    // Group by payment method
    const byMethodMap: Map<string, { total: number; count: number }> = new Map();
    payouts.forEach((payout) => {
      const method = payout.paymentMethod || 'unknown';
      const amount = parseFloat(payout.amount.toString());
      const existing = byMethodMap.get(method) || { total: 0, count: 0 };
      byMethodMap.set(method, {
        total: existing.total + amount,
        count: existing.count + 1,
      });
    });

    return {
      total,
      pending,
      completed,
      byMethod: Array.from(byMethodMap.entries()).map(([method, data]) => ({
        method,
        total: data.total,
        count: data.count,
      })),
    };
  }

  private async calculateRevenueTrend(
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{ date: string; revenue: number; payouts: number; net: number }>
  > {
    // Determine if we should group by day or month
    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const groupByMonth = daysDiff > 90;

    // Fetch all purchases and payouts
    const purchases = await this.prisma.creditPurchase.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        purchaseDate: { gte: startDate, lte: endDate },
      },
    });

    const payouts = await this.prisma.payoutRequest.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: { gte: startDate, lte: endDate },
      },
    });

    const affiliatePayouts = await this.prisma.affiliatePayout.findMany({
      where: {
        status: 'COMPLETED',
        paidAt: { gte: startDate, lte: endDate },
      },
    });

    // Group data by period
    const trendMap: Map<
      string,
      { revenue: number; payouts: number }
    > = new Map();

    purchases.forEach((p) => {
      const periodKey = groupByMonth
        ? p.purchaseDate.toISOString().substring(0, 7) // YYYY-MM
        : p.purchaseDate.toISOString().substring(0, 10); // YYYY-MM-DD

      const existing = trendMap.get(periodKey) || { revenue: 0, payouts: 0 };
      trendMap.set(periodKey, {
        revenue: existing.revenue + parseFloat(p.amountPaid.toString()),
        payouts: existing.payouts,
      });
    });

    [...payouts, ...affiliatePayouts].forEach((p) => {
      const date = p.paidAt || p.requestedAt;
      const periodKey = groupByMonth
        ? date.toISOString().substring(0, 7)
        : date.toISOString().substring(0, 10);

      const existing = trendMap.get(periodKey) || { revenue: 0, payouts: 0 };
      trendMap.set(periodKey, {
        revenue: existing.revenue,
        payouts: existing.payouts + parseFloat(p.amount.toString()),
      });
    });

    // Convert to array and calculate net
    return Array.from(trendMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        payouts: data.payouts,
        net: data.revenue - data.payouts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
