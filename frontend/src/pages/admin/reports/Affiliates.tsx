import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminReportsApi, AffiliateReportDto } from '@/lib/api/admin-reports';
import { toast } from 'sonner';
import {
  Download,
  FileText,
  FileDown,
  Users,
  DollarSign,
  TrendingUp,
  MousePointerClick } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

export function AdminAffiliateReportsPage() {
  // Default to current month
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd') });

  // Data state
  const [report, setReport] = useState<AffiliateReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Export loading states
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Fetch report when date range changes
  useEffect(() => {
    const fetchReport = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      try {
        setIsLoading(true);
        const data = await adminReportsApi.getAffiliateReport(
          dateRange.startDate,
          dateRange.endDate
        );
        setReport(data);
      } catch (err) {
        console.error('Affiliate report error:', err);
        toast.error('Failed to load affiliate report');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      const blob = await adminReportsApi.downloadAffiliateReportCsv(
        dateRange.startDate,
        dateRange.endDate
      );
      const filename = `affiliate-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      adminReportsApi.triggerFileDownload(blob, filename);
      toast.success('Affiliate report exported successfully');
    } catch (error: any) {
      console.error('Export CSV error:', error);
      toast.error(error.response?.data?.message || 'Failed to export CSV');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const blob = await adminReportsApi.downloadAffiliateReportPdf(
        dateRange.startDate,
        dateRange.endDate
      );
      const filename = `affiliate-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
      adminReportsApi.triggerFileDownload(blob, filename);
      toast.success('Affiliate report exported successfully');
    } catch (error: any) {
      console.error('Export PDF error:', error);
      toast.error(error.response?.data?.message || 'Failed to export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Reports</h1>
          <p className="text-muted-foreground">
            Performance tracking, conversion rates, and commission costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExportingCsv ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
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
          {/* Overall Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="animate-fade-up-fast">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Affiliates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.overallPerformance.totalAffiliates}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.overallPerformance.activeAffiliates} active
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.overallPerformance.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {report.overallPerformance.totalConversions} conversions
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.overallPerformance.averageConversionRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {report.overallPerformance.totalClicks} total clicks
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast animation-delay-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Commission Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(report.overallPerformance.totalCommissionPending)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(report.overallPerformance.totalCommissionPaid)} paid
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Affiliates by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Affiliates by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.topAffiliates.map((affiliate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{affiliate.affiliateName}</p>
                        <p className="text-sm text-muted-foreground">
                          Code: {affiliate.referralCode}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-bold text-green-600">
                          {formatCurrency(affiliate.totalRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                        <p className="font-bold">{affiliate.totalConversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conv. Rate</p>
                        <p className="font-bold">{affiliate.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Commission</p>
                        <p className="font-bold text-orange-600">
                          {formatCurrency(affiliate.totalCommission)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5" />
                Top Conversion Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.conversionRates.map((affiliate, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{affiliate.affiliateName}</p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.clicks} clicks → {affiliate.conversions}{' '}
                          conversions
                        </p>
                      </div>
                      <p className="font-bold text-lg">{affiliate.conversionRate}%</p>
                    </div>
                    <Progress value={affiliate.conversionRate} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commission Costs Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Costs Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(report.commissionCosts.totalCommissionEarned)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(report.commissionCosts.totalCommissionPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(report.commissionCosts.totalCommissionPending)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rate</p>
                    <p className="text-2xl font-bold">
                      {report.commissionCosts.averageCommissionRate}%
                    </p>
                  </div>
                </div>

                {/* Commission by Affiliate */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Commission by Affiliate</h3>
                  <div className="space-y-2">
                    {report.commissionCosts.commissionByAffiliate.map(
                      (affiliate, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <p className="font-medium">{affiliate.affiliateName}</p>
                          <div className="flex gap-6">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Total</p>
                              <p className="font-bold">
                                {formatCurrency(affiliate.totalCommission)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Paid</p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(affiliate.paidCommission)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Pending</p>
                              <p className="font-bold text-orange-600">
                                {formatCurrency(affiliate.pendingCommission)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
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
