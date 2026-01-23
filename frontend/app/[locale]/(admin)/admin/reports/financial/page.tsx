'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancialReport, useExportFinancialCsv, useExportFinancialPdf } from '@/hooks/useAdminReports';
import { Download, FileText, DollarSign, TrendingUp, TrendingDown, FileDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function AdminFinancialReportsPage() {
  // Default to current month
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const { data: report, isLoading } = useFinancialReport(
    dateRange.startDate,
    dateRange.endDate,
  );

  const exportCsvMutation = useExportFinancialCsv();
  const exportPdfMutation = useExportFinancialPdf();

  const handleExportCsv = () => {
    exportCsvMutation.mutate({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  const handleExportPdf = () => {
    exportPdfMutation.mutate({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Revenue, payouts, and net revenue analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            disabled={exportCsvMutation.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {exportCsvMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportPdf}
            disabled={exportPdfMutation.isPending}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {exportPdfMutation.isPending ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, dateRange.endDate)
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleDateRangeChange(dateRange.startDate, e.target.value)
                }
                className="w-full mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const now = new Date();
                handleDateRangeChange(
                  format(startOfMonth(now), 'yyyy-MM-dd'),
                  format(endOfMonth(now), 'yyyy-MM-dd'),
                );
              }}
            >
              This Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      ) : report ? (
        <>
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="animate-fade-up-fast">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.revenue.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gross revenue for period
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.netRevenue.netRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  After payouts: {report.netRevenue.profitMargin.toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(report.netRevenue.totalPayouts)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Reader + Affiliate payouts
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  One-Time Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(report.revenue.oneTimePurchases)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Package purchases
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue by Package Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue by Package Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.revenue.revenueByPackageType.map((pkg, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{pkg.packageName}</p>
                        <p className="text-sm text-muted-foreground">
                          {pkg.credits} credits • {pkg.purchaseCount} purchases
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(pkg.totalRevenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Revenue by Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.revenue.revenueByPaymentMethod.map((method, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium capitalize">{method.paymentMethod}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.transactionCount} transactions
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(method.totalRevenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payouts Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Reader Payouts */}
            <Card>
              <CardHeader>
                <CardTitle>Reader Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(report.payouts.readerPayouts.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(report.payouts.readerPayouts.completed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(report.payouts.readerPayouts.pending)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">By Method:</p>
                    {report.payouts.readerPayouts.byMethod.map((method, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="capitalize">{method.method}</span>
                        <span className="font-medium">
                          {formatCurrency(method.total)} ({method.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliate Payouts */}
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(report.payouts.affiliatePayouts.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(report.payouts.affiliatePayouts.completed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatCurrency(report.payouts.affiliatePayouts.pending)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">By Method:</p>
                    {report.payouts.affiliatePayouts.byMethod.map((method, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="capitalize">{method.method}</span>
                        <span className="font-medium">
                          {formatCurrency(method.total)} ({method.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.revenueTrend.map((trend, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 p-3 border rounded-md"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{trend.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(trend.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payouts</p>
                      <p className="font-medium text-orange-600">
                        {formatCurrency(trend.payouts)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net</p>
                      <p
                        className={`font-medium ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {trend.net >= 0 ? (
                          <TrendingUp className="inline h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 mr-1" />
                        )}
                        {formatCurrency(Math.abs(trend.net))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No data available for the selected period</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
