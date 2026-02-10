import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  RefreshCw,
  Star,
  TrendingUp,
  Clock,
  AlertCircle,
  MessageSquare,
  Loader2 } from 'lucide-react';
import { getReports, regenerateCampaignReport, downloadCampaignReport, CampaignReport } from '@/lib/api/reports';
import { campaignsApi } from '@/lib/api/campaigns';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

export function ReportsPage() {
  const { t, i18n } = useTranslation('reports');

  // Campaigns state
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Reports state
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const data = await campaignsApi.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Campaigns error:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error('Reports error:', err);
      toast.error('Failed to load reports');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchReports();
  }, []);

  const isLoading = reportsLoading || isLoadingCampaigns;

  // Match reports with campaigns
  const reportsWithCampaigns = useMemo(() => {
    if (!reports || !Array.isArray(reports) || !campaigns || !Array.isArray(campaigns)) return [];

    return reports.map((report) => {
      const campaign = campaigns.find((c) => c.id === report.bookId);
      return {
        ...report,
        campaign };
    });
  }, [reports, campaigns]);

  const handleDownload = async (bookId: string) => {
    try {
      setIsDownloading(true);
      const data = await downloadCampaignReport(bookId);
      // Open download URL in new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Download report error:', error);
      toast.error(error.response?.data?.message || 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = async (bookId: string) => {
    try {
      setIsRegenerating(true);
      await regenerateCampaignReport(bookId);
      toast.success('Report regenerated successfully');
      // Refetch reports
      await fetchReports();
    } catch (error: any) {
      console.error('Regenerate report error:', error);
      toast.error(error.response?.data?.message || 'Failed to regenerate report');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-up-fast">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('description')}</p>
        </div>

        <Card className="animate-fade-up-normal">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">{t('noReports')}</h3>
            <p className="max-w-md text-center text-muted-foreground">
              {t('noReportsDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-up-fast">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-6">
        {reportsWithCampaigns.map((report, index) => (
          <Card
            key={report.id}
            className="overflow-hidden"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'backwards' }}
            data-animate="fade-up-normal"
          >
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-1 text-2xl">
                    {report.campaign?.title || 'Unknown Book'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {report.campaign?.authorName || 'Unknown Author'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report.bookId)}
                    disabled={isDownloading || !report.pdfUrl}
                  >
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isDownloading ? t('downloading') : t('downloadPdf')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate(report.bookId)}
                    disabled={isRegenerating}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? t('regenerating') : t('regenerate')}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {t('generatedAt')}: {format(new Date(report.generatedAt), 'PPP')}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Key Metrics */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('metrics.totalReviews')}
                        </p>
                        <p className="mt-1 text-3xl font-bold">{report.totalReviewsDelivered}</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('metrics.validatedReviews')}
                        </p>
                        <p className="mt-1 text-3xl font-bold">{report.totalReviewsValidated}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t('metrics.averageRating')}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-3xl font-bold">
                          {report.averageRating.toFixed(1)}
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rating Distribution */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">{t('ratingDistribution.title')}</h3>
                <div className="space-y-3">
                  {[
                    {
                      stars: 5,
                      count: report.ratingDistribution.fiveStar,
                      label: t('ratingDistribution.fiveStar') },
                    {
                      stars: 4,
                      count: report.ratingDistribution.fourStar,
                      label: t('ratingDistribution.fourStar') },
                    {
                      stars: 3,
                      count: report.ratingDistribution.threeStar,
                      label: t('ratingDistribution.threeStar') },
                    {
                      stars: 2,
                      count: report.ratingDistribution.twoStar,
                      label: t('ratingDistribution.twoStar') },
                    {
                      stars: 1,
                      count: report.ratingDistribution.oneStar,
                      label: t('ratingDistribution.oneStar') },
                  ].map(({ stars, count, label }) => {
                    const percentage =
                      report.totalReviewsDelivered > 0
                        ? (count / report.totalReviewsDelivered) * 100
                        : 0;

                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex w-24 items-center gap-1">
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="w-16 text-right text-sm font-medium">
                          {count} {t('ratingDistribution.reviews')}
                        </span>
                        <span className="w-12 text-right text-sm text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rating Trends Over Time */}
              {report.ratingTrends && report.ratingTrends.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold">{t('ratingTrends.title')}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t('ratingTrends.description')}
                  </p>
                  <div
                    className="flex items-end gap-2 rounded-lg bg-muted/30 p-4"
                    style={{ height: '200px' }}
                  >
                    {report.ratingTrends.map((trend) => {
                      const barHeight = (trend.avgRating / 5) * 100;
                      return (
                        <div key={trend.week} className="flex flex-1 flex-col items-center">
                          <div
                            className="flex w-full max-w-12 flex-col items-center justify-end rounded-t bg-primary"
                            style={{
                              height: `${barHeight}%`,
                              minHeight: trend.count > 0 ? '20px' : '0' }}
                          >
                            {trend.count > 0 && (
                              <span className="text-xs font-semibold text-primary-foreground">
                                {trend.avgRating}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <div className="text-xs font-medium">W{trend.week}</div>
                            <div className="text-xs text-muted-foreground">{trend.count}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-semibold">{t('performance.title')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('performance.successRate')}
                      </p>
                      <p className="text-2xl font-bold">
                        {report.performanceMetrics.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('performance.delays')}
                      </p>
                      <p className="text-2xl font-bold">
                        {report.performanceMetrics.delaysEncountered}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <RefreshCw className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('performance.replacements')}
                      </p>
                      <p className="text-2xl font-bold">
                        {report.performanceMetrics.replacementsProvided}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Duration */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">{t('duration.title')}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {t('duration.startDate')}
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(report.campaignDuration.startDate), 'PP')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {t('duration.endDate')}
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(report.campaignDuration.endDate), 'PP')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {t('duration.totalWeeks')}
                    </p>
                    <p className="text-lg font-semibold">
                      {report.campaignDuration.totalWeeks} {t('metrics.weeks')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Anonymous Reader Feedback */}
              {report.anonymousFeedback && report.anonymousFeedback.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <MessageSquare className="h-5 w-5" />
                    {t('feedback.title')}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">{t('feedback.description')}</p>
                  <div className="space-y-3">
                    {report.anonymousFeedback.map((feedback, index) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-card p-4 text-sm italic text-muted-foreground"
                      >
                        "{feedback}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
