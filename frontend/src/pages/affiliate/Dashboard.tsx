import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { affiliatesApi } from '@/lib/api/affiliates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  DollarSign,
  Users,
  MousePointerClick,
  TrendingUp,
  Link as LinkIcon,
  Wallet,
  Percent,
  Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from 'recharts';
import { useNavigate,  useParams } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { CommissionStatus, PayoutRequestStatus } from '@/lib/api/affiliates';

export function AffiliateDashboardPage() {
  const { t, i18n } = useTranslation('affiliates.dashboard');
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [payoutsLoading, setPayoutsLoading] = useState(true);

  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isReferralLinksLoading, setIsReferralLinksLoading] = useState(false);
  const [isReferredAuthorsLoading, setIsReferredAuthorsLoading] = useState(false);
  const [isPayoutsNavLoading, setIsPayoutsNavLoading] = useState(false);
  const [isCommissionsLoading, setIsCommissionsLoading] = useState(false);
  const [isPayoutsViewLoading, setIsPayoutsViewLoading] = useState(false);

  // Only wait for profile - it's the critical data to determine UI state
  // Stats, charts, commissions, payouts load progressively with skeletons
  const isLoading = profileLoading;

  // Fetch all data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const data = await affiliatesApi.getMe();
        setProfile(data);
      } catch (error: any) {
        console.error('Profile error:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to load affiliate profile');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await affiliatesApi.getStats();
        setStats(data);
      } catch (error: any) {
        console.error('Stats error:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        const data = await affiliatesApi.getChartData();
        setChartData(data);
      } catch (error: any) {
        console.error('Chart data error:', error);
      } finally {
        setChartLoading(false);
      }
    };

    const fetchCommissions = async () => {
      try {
        setCommissionsLoading(true);
        const data = await affiliatesApi.getCommissions();
        setCommissions(data);
      } catch (error: any) {
        console.error('Commissions error:', error);
      } finally {
        setCommissionsLoading(false);
      }
    };

    const fetchPayouts = async () => {
      try {
        setPayoutsLoading(true);
        const data = await affiliatesApi.getPayouts();
        setPayouts(data);
      } catch (error: any) {
        console.error('Payouts error:', error);
      } finally {
        setPayoutsLoading(false);
      }
    };

    fetchProfile();
    fetchStats();
    fetchChartData();
    fetchCommissions();
    fetchPayouts();
  }, []);

  // Prepare chart data for recharts
  const preparedChartData =
    chartData?.clicks?.map((click, index) => ({
      date: new Date(click.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: click.value,
      conversions: chartData.conversions?.[index]?.value || 0 })) || [];

  const getCommissionStatusBadge = (status: CommissionStatus) => {
    const variants: Record<
      CommissionStatus,
      { variant: 'default' | 'secondary' | 'outline'; text: string }
    > = {
      PENDING: { variant: 'secondary', text: t('commissionStatus.pending') },
      APPROVED: { variant: 'default', text: t('commissionStatus.approved') },
      PAID: { variant: 'outline', text: t('commissionStatus.paid') },
      CANCELLED: { variant: 'outline', text: t('commissionStatus.cancelled') } };
    return <Badge variant={variants[status].variant}>{variants[status].text}</Badge>;
  };

  const getPayoutStatusBadge = (status: PayoutRequestStatus) => {
    const variants: Record<
      PayoutRequestStatus,
      'warning' | 'info' | 'success' | 'error' | 'neutral'
    > = {
      REQUESTED: 'warning',
      PENDING_REVIEW: 'info',
      APPROVED: 'success',
      PROCESSING: 'info',
      COMPLETED: 'success',
      REJECTED: 'error',
      CANCELLED: 'neutral' };
    return <Badge variant={variants[status]}>{t(`payoutStatus.${status.toLowerCase()}`)}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36 animate-pulse" />
            <Skeleton className="h-10 w-36 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
          <Skeleton className="h-28 animate-pulse" />
        </div>
        <Skeleton className="h-64 animate-pulse" />
        <Skeleton className="h-64 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-7xl animate-fade-up px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('noProfile')}
            <Button
              type="button"
              variant="link"
              className="ml-2 h-auto p-0"
              onClick={() => {
                setIsRegisterLoading(true);
                navigate(`/affiliate/register`);
              }}
              disabled={isRegisterLoading}
            >
              {isRegisterLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {t('register')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile.isApproved) {
    return (
      <div className="container mx-auto max-w-7xl animate-fade-up px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {profile.rejectedAt
              ? `${t('applicationRejected')}: ${profile.rejectionReason}`
              : t('applicationPending')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('subtitle')}: <span className="font-mono font-semibold">{profile.referralCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              setIsReferralLinksLoading(true);
              navigate(`/affiliate/referral-links`);
            }}
            disabled={isReferralLinksLoading}
          >
            {isReferralLinksLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            {t('getReferralLink')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsReferredAuthorsLoading(true);
              navigate(`/affiliate/referred-authors`);
            }}
            disabled={isReferredAuthorsLoading}
          >
            {isReferredAuthorsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            {t('referredAuthors') || 'Referred Authors'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsPayoutsNavLoading(true);
              navigate(`/affiliate/payouts`);
            }}
            disabled={isPayoutsNavLoading}
          >
            {isPayoutsNavLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            {t('requestPayout')}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-28 animate-pulse" />
            <Skeleton className="h-28 animate-pulse" />
            <Skeleton className="h-28 animate-pulse" />
            <Skeleton className="h-28 animate-pulse" />
          </>
        ) : (
          <>
            <Card className="animate-fade-up-fast">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.totalEarnings')}</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${stats?.totalEarnings.toFixed(2) || '0.00'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.approvedEarnings')}: ${stats?.approvedEarnings.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-light-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.pendingEarnings')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ${stats?.pendingEarnings.toFixed(2) || '0.00'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t('stats.pendingDescription')}</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.totalClicks')}</CardTitle>
                <MousePointerClick className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.totalClicks || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.conversionRate')}: {stats?.conversionRate.toFixed(2) || 0}%
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-very-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.totalReferrals')}</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats?.totalReferrals || 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.activeReferrals')}: {stats?.activeReferrals || 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Stats Cards - Row 2: Commission Rate (Section 6.1 requirement) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statsLoading ? (
          <>
            <Skeleton className="h-28 animate-pulse" />
            <Skeleton className="h-28 animate-pulse" />
            <Skeleton className="h-28 animate-pulse" />
          </>
        ) : (
          <>
            <Card className="animate-fade-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.commissionRate') || 'Your Commission Rate'}</CardTitle>
                <Percent className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {profile?.commissionRate || 20}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.commissionRateDescription') || 'You earn this percentage on every sale'}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-fast">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.availableForPayout') || 'Available for Payout'}</CardTitle>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  ${stats?.approvedEarnings.toFixed(2) || '0.00'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.availableDescription') || 'Ready to withdraw'}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-up-light-slow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('stats.totalPaid') || 'Total Paid Out'}</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  ${stats?.paidEarnings.toFixed(2) || '0.00'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('stats.totalPaidDescription') || 'Already withdrawn'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section - Section 6.1 requirement */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-zoom-in">
          <CardHeader>
            <CardTitle>{t('charts.clicksTitle') || 'Clicks Over Last 30 Days'}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-64 animate-pulse" />
            ) : preparedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={preparedChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name={t('charts.clicks') || 'Clicks'}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                {t('charts.noData') || 'No data available yet'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-zoom-in-light-slow">
          <CardHeader>
            <CardTitle>{t('charts.conversionsTitle') || 'Conversions Over Last 30 Days'}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-64 animate-pulse" />
            ) : preparedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={preparedChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name={t('charts.conversions') || 'Conversions'}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                {t('charts.noData') || 'No data available yet'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Commissions */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('recentCommissions.title')}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCommissionsLoading(true);
                navigate(`/affiliate/commissions`);
              }}
              disabled={isCommissionsLoading}
            >
              {isCommissionsLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {t('viewAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {commissionsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 animate-pulse" />
              <Skeleton className="h-10 animate-pulse" />
              <Skeleton className="h-10 animate-pulse" />
            </div>
          ) : !commissions || commissions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t('recentCommissions.empty')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('recentCommissions.table.amount')}</TableHead>
                  <TableHead>{t('recentCommissions.table.commission')}</TableHead>
                  <TableHead>{t('recentCommissions.table.status')}</TableHead>
                  <TableHead>{t('recentCommissions.table.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.slice(0, 5).map((commission, index) => (
                  <TableRow
                    key={commission.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell>${commission.purchaseAmount.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${commission.commissionAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                    <TableCell>{formatDate(commission.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card className="animate-zoom-in-very-slow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('recentPayouts.title')}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsPayoutsViewLoading(true);
                navigate(`/affiliate/payouts`);
              }}
              disabled={isPayoutsViewLoading}
            >
              {isPayoutsViewLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {t('viewAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 animate-pulse" />
              <Skeleton className="h-10 animate-pulse" />
              <Skeleton className="h-10 animate-pulse" />
            </div>
          ) : !payouts || payouts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">{t('recentPayouts.empty')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('recentPayouts.table.amount')}</TableHead>
                  <TableHead>{t('recentPayouts.table.method')}</TableHead>
                  <TableHead>{t('recentPayouts.table.status')}</TableHead>
                  <TableHead>{t('recentPayouts.table.requestedAt')}</TableHead>
                  <TableHead>{t('recentPayouts.table.processedAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.slice(0, 5).map((payout, index) => (
                  <TableRow
                    key={payout.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell className="font-semibold">${payout.amount.toFixed(2)}</TableCell>
                    <TableCell>{payout.paymentMethod}</TableCell>
                    <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                    <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                    <TableCell>
                      {payout.processedAt ? formatDate(payout.processedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
