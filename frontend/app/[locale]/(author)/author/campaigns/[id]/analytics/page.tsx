'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useDashboards } from '@/hooks/useDashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Star,
  AlertTriangle,
  Download,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const t = useTranslations('campaignAnalytics');

  const { useCampaignTracking } = useDashboards();
  const { data: tracking, isLoading } = useCampaignTracking(bookId);

  const isCompleted = tracking?.campaign.status === 'completed';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 animate-fade-up flex-col items-center justify-center text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('notFound') || 'Campaign not found'}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back') || 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate cumulative variance from weekly progress
  const cumulativeVariance = tracking.weeklyProgress.reduce((sum, week) => sum + week.variance, 0);

  // Calculate average reviews per week
  const completedWeeks = tracking.weeklyProgress.filter((w) => w.actualReviews > 0).length;
  const totalActualReviews = tracking.weeklyProgress.reduce((sum, w) => sum + w.actualReviews, 0);
  const avgReviewsPerWeek = completedWeeks > 0 ? totalActualReviews / completedWeeks : 0;

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'ahead-of-schedule':
        return <TrendingUp className="h-8 w-8 text-blue-500" />;
      case 'delayed':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'issues':
        return <AlertCircle className="h-8 w-8 text-orange-500" />;
      default:
        return <Clock className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'default' as const;
      case 'ahead-of-schedule':
        return 'secondary' as const;
      default:
        return 'destructive' as const;
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <Button type="button" variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back') || 'Back to Campaign'}
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{tracking.campaign.bookTitle}</h1>
            <p className="text-muted-foreground">
              {isCompleted
                ? t('finalReportSubtitle') || 'Campaign Final Report'
                : t('analyticsSubtitle') || 'Campaign Analytics & Tracking'}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            {t('downloadReport') || 'Download Report'}
          </Button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card className="animate-fade-up-fast">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('overallProgress') || 'Overall Progress'}</span>
              <span className="font-semibold">{tracking.campaign.completionPercentage}%</span>
            </div>
            <Progress value={tracking.campaign.completionPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {tracking.campaign.reviewsDelivered} {t('delivered') || 'delivered'}
              </span>
              <span>
                {tracking.campaign.targetReviews} {t('target') || 'target'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Status Overview */}
      <div className="grid animate-fade-up-light-slow grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Status</CardTitle>
            <Badge
              variant={
                tracking.campaign.status === 'active'
                  ? 'default'
                  : tracking.campaign.status === 'completed'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {tracking.campaign.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{tracking.campaign.status}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Week {tracking.campaign.currentWeek} of {tracking.campaign.totalWeeks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracking.campaign.targetReviews}</div>
            <p className="text-xs text-muted-foreground">
              {tracking.campaign.reviewsDelivered} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracking.campaign.completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {tracking.campaign.reviewsValidated} validated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracking.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Based on all reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('timeline.title') || 'Campaign Timeline'}
          </CardTitle>
          <CardDescription>
            {t('timeline.description') || 'Key dates and milestones'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Campaign Started</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tracking.campaign.campaignStartDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Expected End Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(tracking.campaign.expectedEndDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Current Progress</p>
                <p className="text-sm text-muted-foreground">
                  Week {tracking.campaign.currentWeek} of {tracking.campaign.totalWeeks}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="animate-fade-up-very-slow">
        <CardHeader>
          <CardTitle>{t('weeklyProgress.title') || 'Weekly Progress'}</CardTitle>
          <CardDescription>
            {t('weeklyProgress.description') || 'Reviews completed per week'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Planned</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Validated</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracking.weeklyProgress && tracking.weeklyProgress.length > 0 ? (
                tracking.weeklyProgress.map((week) => (
                  <TableRow key={week.weekNumber}>
                    <TableCell className="font-medium">Week {week.weekNumber}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(week.weekStartDate)} - {formatDate(week.weekEndDate)}
                    </TableCell>
                    <TableCell>{week.plannedReviews}</TableCell>
                    <TableCell>{week.actualReviews}</TableCell>
                    <TableCell>{week.validated}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {week.variance >= 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">+{week.variance}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">{week.variance}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          week.variance >= 0
                            ? 'default'
                            : week.variance >= -2
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {week.variance >= 0 ? 'On Track' : 'Behind'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No weekly progress data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('ratingDistribution.title') || 'Rating Distribution'}
          </CardTitle>
          <CardDescription>
            {t('ratingDistribution.description') || 'Breakdown of review ratings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stars: 5, count: tracking.ratingDistribution.fiveStar },
              { stars: 4, count: tracking.ratingDistribution.fourStar },
              { stars: 3, count: tracking.ratingDistribution.threeStar },
              { stars: 2, count: tracking.ratingDistribution.twoStar },
              { stars: 1, count: tracking.ratingDistribution.oneStar },
            ].map(({ stars, count }) => {
              const total =
                tracking.ratingDistribution.fiveStar +
                tracking.ratingDistribution.fourStar +
                tracking.ratingDistribution.threeStar +
                tracking.ratingDistribution.twoStar +
                tracking.ratingDistribution.oneStar;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-16 text-sm">{stars} stars</span>
                  <div className="h-2 flex-1 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Health */}
      <Card className="animate-zoom-in-fast">
        <CardHeader>
          <CardTitle>{t('distributionHealth.title') || 'Distribution Health'}</CardTitle>
          <CardDescription>
            {t('distributionHealth.description') || 'How your campaign is progressing'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-3">
              {getHealthIcon(tracking.health.status)}
              <div>
                <p className="font-medium">Overall Health</p>
                <p className="text-sm text-muted-foreground">{tracking.health.message}</p>
              </div>
            </div>
            <Badge variant={getHealthBadgeVariant(tracking.health.status)} className="px-4 py-2">
              {tracking.campaign.completionPercentage}% Complete
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Cumulative Variance</p>
              <div className="flex items-center gap-2">
                {cumulativeVariance >= 0 ? (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-xl font-bold text-green-600">+{cumulativeVariance}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-xl font-bold text-red-600">{cumulativeVariance}</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">reviews</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {cumulativeVariance >= 0 ? 'Ahead of schedule' : 'Behind schedule'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Average Reviews Per Week</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{avgReviewsPerWeek.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">reviews/week</span>
              </div>
              <p className="text-xs text-muted-foreground">Based on completed weeks</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amazon Removals */}
      {tracking.amazonRemovals.total > 0 && (
        <Card className="animate-fade-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('amazonRemovals.title') || 'Amazon Removals'}
            </CardTitle>
            <CardDescription>
              {t('amazonRemovals.description') || 'Reviews removed by Amazon'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Removed</p>
                <p className="text-2xl font-bold">{tracking.amazonRemovals.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Within Guarantee</p>
                <p className="text-2xl font-bold">{tracking.amazonRemovals.withinGuarantee}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">After Guarantee</p>
                <p className="text-2xl font-bold">{tracking.amazonRemovals.afterGuarantee}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Replacements Provided</p>
                <p className="text-2xl font-bold">{tracking.amazonRemovals.replacementsProvided}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delays */}
      {tracking.delays && tracking.delays.length > 0 && (
        <Card className="animate-fade-left-fast">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('delays.title') || 'Campaign Delays'}
            </CardTitle>
            <CardDescription>
              {t('delays.description') || 'Issues that have caused delays'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracking.delays.map((delay, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{formatDate(delay.date)}</TableCell>
                    <TableCell>{delay.reason}</TableCell>
                    <TableCell className="text-muted-foreground">{delay.impact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
