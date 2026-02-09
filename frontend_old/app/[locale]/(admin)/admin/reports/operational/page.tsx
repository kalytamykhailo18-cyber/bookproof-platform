'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOperationalReport, useExportOperationalCsv, useExportOperationalPdf } from '@/hooks/useAdminReports';
import {
  Download,
  FileText,
  FileDown,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, endOfMonth, format } from '@/node_modules/date-fns';
import { Progress } from '@/components/ui/progress';

export default function AdminOperationalReportsPage() {
  // Default to current month
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const { data: report, isLoading } = useOperationalReport(
    dateRange.startDate,
    dateRange.endDate,
  );

  const exportCsvMutation = useExportOperationalCsv();
  const exportPdfMutation = useExportOperationalPdf();

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
          <h1 className="text-3xl font-bold">Operational Reports</h1>
          <p className="text-muted-foreground">
            Campaign health, reader metrics, and validation statistics
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
          {/* Campaign Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Campaign Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">
                    {report.campaignHealth.totalCampaigns}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.campaignHealth.activeCampaigns}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On Schedule</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.campaignHealth.onScheduleCampaigns}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delayed</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.campaignHealth.delayedCampaigns}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {report.campaignHealth.completionRate}%
                  </p>
                  <Progress
                    value={report.campaignHealth.completionRate}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {report.campaignHealth.averageCampaignDuration.toFixed(0)} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reader Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Reader Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Readers</p>
                  <p className="text-2xl font-bold">
                    {report.readerMetrics.totalActiveReaders}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.readerMetrics.reviewCompletionRate}%
                  </p>
                  <Progress
                    value={report.readerMetrics.reviewCompletionRate}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Reviews/Reader</p>
                  <p className="text-2xl font-bold">
                    {report.readerMetrics.averageReviewsPerReader.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline Miss Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.readerMetrics.deadlineMissRate}%
                  </p>
                  <Progress
                    value={report.readerMetrics.deadlineMissRate}
                    className="mt-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                  <p className="text-2xl font-bold">
                    {report.readerMetrics.averageCompletionTime.toFixed(1)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Validation Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-bold">
                      {report.validationMetrics.totalReviewsSubmitted}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Validated</p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.validationMetrics.totalReviewsValidated}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {report.validationMetrics.totalReviewsRejected}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.validationMetrics.approvalRate}%
                    </p>
                    <Progress
                      value={report.validationMetrics.approvalRate}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Validation Time</p>
                    <p className="text-2xl font-bold">
                      {report.validationMetrics.averageValidationTime.toFixed(1)}h
                    </p>
                  </div>
                </div>

                {/* Common Rejection Reasons */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Common Rejection Reasons</h3>
                  <div className="space-y-2">
                    {report.validationMetrics.commonRejectionReasons.map(
                      (reason, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="font-medium">{reason.reason}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {reason.count} occurrences
                            </span>
                            <span className="font-bold">{reason.percentage}%</span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amazon Removal Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Amazon Removal Metrics (14-Day Replacement Guarantee)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Removals</p>
                    <p className="text-2xl font-bold text-red-600">
                      {report.amazonRemovalMetrics.totalRemovals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Removal Rate</p>
                    <p className="text-2xl font-bold">
                      {report.amazonRemovalMetrics.removalRate}%
                    </p>
                    <Progress
                      value={report.amazonRemovalMetrics.removalRate}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Replacements Provided
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.amazonRemovalMetrics.replacementsProvided}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Replacement Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.amazonRemovalMetrics.replacementRate}%
                    </p>
                    <Progress
                      value={report.amazonRemovalMetrics.replacementRate}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Days to Removal
                    </p>
                    <p className="text-2xl font-bold">
                      {report.amazonRemovalMetrics.averageDaysToRemoval.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Within Guarantee Period
                    </p>
                    <p className="text-2xl font-bold">
                      {report.amazonRemovalMetrics.withinGuaranteePeriod}
                    </p>
                  </div>
                </div>

                {/* Per-Campaign Breakdown */}
                {report.amazonRemovalMetrics.perCampaignBreakdown &&
                  report.amazonRemovalMetrics.perCampaignBreakdown.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Per-Campaign Breakdown</h3>
                      <div className="space-y-2">
                        {report.amazonRemovalMetrics.perCampaignBreakdown.map(
                          (campaign) => (
                            <div
                              key={campaign.campaignId}
                              className="flex justify-between items-center p-3 border rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate max-w-xs">
                                  {campaign.campaignTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="text-muted-foreground">
                                  Removals: <strong className="text-red-600">{campaign.totalRemovals}</strong>
                                </span>
                                <span className="text-muted-foreground">
                                  Replaced: <strong className="text-green-600">{campaign.replacementsProvided}</strong>
                                </span>
                                <span className="text-muted-foreground">
                                  Avg Days: <strong>{campaign.averageDaysToRemoval.toFixed(1)}</strong>
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
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
