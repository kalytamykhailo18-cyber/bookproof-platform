import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/utils';
import { dashboardsApi, ReaderStatsDto } from '@/lib/api/dashboards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  BookOpen,
  Target,
  Wallet,
  Calendar,
  AlertCircle } from 'lucide-react';

export function ReaderStatsPage() {
  const { t, i18n } = useTranslation('readerStats');

  // Stats state
  const [stats, setStats] = useState<ReaderStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reader stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardsApi.getReaderStats();
        setStats(data);
      } catch (err) {
        console.error('Reader stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t('error')}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.totalReviews')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.reviewsCompleted}</div>
            <p className="text-xs text-muted-foreground">{t('overview.lifetimeCompleted')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.onTimeRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{t('overview.completedOnTime')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('performance.qualityScore')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-bold">
              {stats.performance.reliabilityScore.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('performance.score')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.avgRating')}</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-2xl font-bold">
              {stats.performance.averageInternalRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">{t('overview.fromAuthors')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details & Wallet */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('performanceDetails.title')}
            </CardTitle>
            <CardDescription>{t('performanceDetails.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('performanceDetails.reviewsCompleted')}</p>
                <p className="text-xs text-muted-foreground">{t('performanceDetails.totalAcceptedReviews')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {stats.performance.reviewsCompleted}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('performanceDetails.reviewsExpired')}</p>
                <p className="text-xs text-muted-foreground">{t('performanceDetails.missedDeadlines')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">
                  {stats.performance.reviewsExpired}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('performanceDetails.reviewsRejected')}</p>
                <p className="text-xs text-muted-foreground">{t('performanceDetails.notPassedValidation')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">
                  {stats.performance.reviewsRejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('wallet.title')}
            </CardTitle>
            <CardDescription>{t('wallet.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('wallet.currentBalance')}</p>
                <p className="text-xs text-muted-foreground">{t('wallet.availableForWithdrawal')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(stats.wallet.currentBalance)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('wallet.totalEarned')}</p>
                <p className="text-xs text-muted-foreground">{t('wallet.lifetimeEarnings')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats.wallet.totalEarned)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{t('wallet.totalWithdrawn')}</p>
                <p className="text-xs text-muted-foreground">{t('wallet.successfullyPaidOut')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{formatCurrency(stats.wallet.totalWithdrawn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('recentAssignments.title')}
          </CardTitle>
          <CardDescription>{t('recentAssignments.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('recentAssignments.table.bookTitle')}</TableHead>
                <TableHead>{t('recentAssignments.table.assigned')}</TableHead>
                <TableHead>{t('recentAssignments.table.completed')}</TableHead>
                <TableHead>{t('recentAssignments.table.rating')}</TableHead>
                <TableHead>{t('recentAssignments.table.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                stats.recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.bookTitle}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(assignment.assignedDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.completedDate ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {formatDate(assignment.completedDate)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {assignment.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {assignment.rating}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === 'COMPLETED'
                            ? 'default'
                            : assignment.status === 'IN_PROGRESS'
                              ? 'secondary'
                              : assignment.status === 'EXPIRED'
                                ? 'destructive'
                                : 'outline'
                        }
                      >
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('recentAssignments.table.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('performanceOverTime.title')}
          </CardTitle>
          <CardDescription>{t('performanceOverTime.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.performanceOverTime && stats.performanceOverTime.length > 0 ? (
              stats.performanceOverTime.map((month) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {month.completedReviews} {t('performanceOverTime.reviewsCompleted')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t('performanceOverTime.earnings')}</p>
                      <p className="font-medium">{formatCurrency(month.earnings, 'USD', i18n.language)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t('performanceOverTime.expired')}</p>
                      <p className="font-medium text-orange-600">{month.expiredReviews}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                {t('performanceOverTime.noData')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
