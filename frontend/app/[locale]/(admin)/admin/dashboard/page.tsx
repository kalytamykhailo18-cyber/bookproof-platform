'use client';

import { useTranslations } from 'next-intl';
import { useDashboards } from '@/hooks/useDashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { CampaignSectionItemDto } from '@/lib/api/dashboards';

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const { useAdminDashboard, useAdminRevenueAnalytics } = useDashboards();

  const { data: dashboard, isLoading: dashboardLoading } = useAdminDashboard();
  const { data: revenue } = useAdminRevenueAnalytics();

  if (dashboardLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Skeleton className="h-12 w-64 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalCampaigns')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.summary.totalCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('stats.active', { count: dashboard?.summary.activeCampaigns || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAuthors')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.summary.totalAuthors || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.platformWide')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalReaders')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.summary.totalReaders || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.platformWide')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pendingReviews')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.summary.totalReviewsPendingValidation || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.awaitingValidation')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="animate-zoom-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('revenue.thisMonth')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboard?.revenue.thisMonth.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {(dashboard?.revenue?.percentageChange ?? 0) >= 0 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />+{dashboard?.revenue?.percentageChange ?? 0}%
                  {t('revenue.fromLastMonth')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  {dashboard?.revenue?.percentageChange ?? 0}% {t('revenue.fromLastMonth')}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-zoom-in-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('revenue.totalAllTime')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                (revenue?.revenueBySource?.oneTimePurchases || 0) +
                (revenue?.revenueBySource?.subscriptions || 0) +
                (revenue?.revenueBySource?.keywordResearch || 0)
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('revenue.lifetimeEarnings')}</p>
          </CardContent>
        </Card>

        <Card className="animate-zoom-in-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('revenue.activeSubscriptions')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenue?.subscriptionMetrics?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ${revenue?.subscriptionMetrics?.monthlyRecurringRevenue?.toLocaleString() || '0'}
              /month MRR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('revenueBreakdown.title')}</CardTitle>
          <CardDescription>{t('revenueBreakdown.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex animate-fade-up-fast items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('revenueBreakdown.creditPurchases')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('revenueBreakdown.oneTimePayments')}
                </p>
              </div>
              <p className="text-lg font-bold">
                ${revenue?.revenueBySource?.oneTimePurchases?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="flex animate-fade-up-light-slow items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{t('revenueBreakdown.subscriptions')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('revenueBreakdown.recurringRevenue')}
                </p>
              </div>
              <p className="text-lg font-bold">
                ${revenue?.revenueBySource?.subscriptions?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Sections - Healthy, Delayed, Issues */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Healthy Campaigns Section */}
        <Card className="animate-fade-up border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {t('campaigns.healthy.title')}
            </CardTitle>
            <CardDescription>
              {t('campaigns.healthy.description', {
                count: dashboard?.healthyCampaigns?.length || 0,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {dashboard?.healthyCampaigns && dashboard.healthyCampaigns.length > 0 ? (
                dashboard.healthyCampaigns.map(
                  (campaign: CampaignSectionItemDto, index: number) => (
                    <div
                      key={campaign.id}
                      className={`rounded-lg border bg-background p-3 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{campaign.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">{campaign.authorName}</p>
                        </div>
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          {t('campaigns.healthy.onTrack')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {campaign.reviewsDelivered}/{campaign.targetReviews}{' '}
                            {t('campaigns.reviews')}
                          </span>
                          <span>{campaign.completionPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={campaign.completionPercentage} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {t('campaigns.weekOf', {
                            current: campaign.currentWeek,
                            total: campaign.totalWeeks,
                          })}
                        </p>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {t('campaigns.healthy.empty')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delayed Campaigns Section */}
        <Card className="animate-fade-up-slow border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              {t('campaigns.delayed.title')}
            </CardTitle>
            <CardDescription>
              {t('campaigns.delayed.description', {
                count: dashboard?.delayedCampaigns?.length || 0,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {dashboard?.delayedCampaigns && dashboard.delayedCampaigns.length > 0 ? (
                dashboard.delayedCampaigns.map(
                  (campaign: CampaignSectionItemDto, index: number) => (
                    <div
                      key={campaign.id}
                      className={`rounded-lg border bg-background p-3 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{campaign.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">{campaign.authorName}</p>
                        </div>
                        <Badge
                          variant={campaign.severity === 'HIGH' ? 'destructive' : 'default'}
                          className="bg-yellow-100 text-yellow-800"
                        >
                          {campaign.severity}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>
                            {campaign.reviewsDelivered}/{campaign.targetReviews}{' '}
                            {t('campaigns.reviews')}
                          </span>
                          <span className="text-yellow-600">
                            {campaign.variance} {t('campaigns.behind')}
                          </span>
                        </div>
                        <Progress value={campaign.completionPercentage} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">{campaign.issue}</p>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <p className="text-center text-sm text-muted-foreground">
                    {t('campaigns.delayed.empty')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issues Section */}
        <Card className="animate-fade-up-extra-slow border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              {t('campaigns.issues.title')}
            </CardTitle>
            <CardDescription>
              {t('campaigns.issues.description', {
                count: dashboard?.issuesCampaigns?.length || 0,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {dashboard?.issuesCampaigns && dashboard.issuesCampaigns.length > 0 ? (
                dashboard.issuesCampaigns.map((campaign: CampaignSectionItemDto, index: number) => (
                  <div
                    key={campaign.id}
                    className={`rounded-lg border bg-background p-3 animate-fade-up-${['fast', 'light-slow', 'medium-slow'][index % 3]}`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{campaign.bookTitle}</p>
                        <p className="text-xs text-muted-foreground">{campaign.authorName}</p>
                      </div>
                      <Badge variant={campaign.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                        {campaign.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {campaign.reviewsDelivered}/{campaign.targetReviews}{' '}
                          {t('campaigns.reviews')}
                        </span>
                        <span>{campaign.completionPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={campaign.completionPercentage} className="h-1.5" />
                      <p className="text-xs font-medium text-red-600">{campaign.issue}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <p className="text-center text-sm text-muted-foreground">
                    {t('campaigns.issues.empty')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Requiring Attention */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {t('attention.title')}
          </CardTitle>
          <CardDescription>{t('attention.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('attention.columns.bookTitle')}</TableHead>
                <TableHead>{t('attention.columns.author')}</TableHead>
                <TableHead>{t('attention.columns.issue')}</TableHead>
                <TableHead>{t('attention.columns.severity')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard?.campaignsRequiringAttention &&
              dashboard.campaignsRequiringAttention.length > 0 ? (
                dashboard.campaignsRequiringAttention.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.bookTitle}</TableCell>
                    <TableCell>{campaign.authorName}</TableCell>
                    <TableCell>{campaign.issue}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          campaign.severity === 'HIGH' || campaign.severity === 'CRITICAL'
                            ? 'destructive'
                            : campaign.severity === 'MEDIUM'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {campaign.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 py-8">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <p>{t('attention.empty')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('activity.title')}</CardTitle>
          <CardDescription>{t('activity.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard?.recentAdminActions && dashboard.recentAdminActions.length > 0 ? (
              dashboard.recentAdminActions.map((action, index) => (
                <div
                  key={action.id}
                  className={`flex items-start gap-4 animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                >
                  <div className="mt-1">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{action.description}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{action.entity}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>{action.performedBy}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <Clock className="h-3 w-3" />
                      {action.performedAt}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-muted-foreground">{t('activity.empty')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Health */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="animate-fade-left">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('health.completionRate')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.platformHealth?.averageReviewCompletionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t('health.averageCompletion')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-left-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('health.readerReliability')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.platformHealth?.averageReaderReliabilityScore || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">{t('health.averageReliability')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-left-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('health.validationTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.platformHealth?.averageReviewValidationTime || 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">{t('health.avgTimeToValidate')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-left-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('health.amazonRemovalRate')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboard?.platformHealth?.amazonRemovalRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t('health.reviewsRemoved')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
