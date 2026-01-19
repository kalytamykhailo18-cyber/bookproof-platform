'use client';

import { useTranslations } from 'next-intl';
import {
  useAffiliateProfile,
  useAffiliateStats,
  useCommissions,
  usePayouts,
} from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { CommissionStatus, PayoutRequestStatus } from '@/lib/api/affiliates';

export default function AffiliateDashboardPage() {
  const t = useTranslations('affiliates.dashboard');
  const { data: profile, isLoading: profileLoading } = useAffiliateProfile();
  const { data: stats, isLoading: statsLoading } = useAffiliateStats();
  const { data: commissions, isLoading: commissionsLoading } = useCommissions();
  const { data: payouts, isLoading: payoutsLoading } = usePayouts();

  const isLoading = profileLoading || statsLoading;

  const getCommissionStatusBadge = (status: CommissionStatus) => {
    const variants: Record<
      CommissionStatus,
      { variant: 'default' | 'secondary' | 'outline'; text: string }
    > = {
      PENDING: { variant: 'secondary', text: t('commissionStatus.pending') },
      APPROVED: { variant: 'default', text: t('commissionStatus.approved') },
      PAID: { variant: 'outline', text: t('commissionStatus.paid') },
      CANCELLED: { variant: 'outline', text: t('commissionStatus.cancelled') },
    };
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
      CANCELLED: 'neutral',
    };
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
            <Link href="/affiliate/register">
              <Button type="button" variant="link" className="ml-2 h-auto p-0">
                {t('register')}
              </Button>
            </Link>
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
        <div className="flex gap-2">
          <Link href="/affiliate/referral-links">
            <Button type="button">
              <LinkIcon className="mr-2 h-4 w-4" />
              {t('getReferralLink')}
            </Button>
          </Link>
          <Link href="/affiliate/payouts">
            <Button type="button" variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              {t('requestPayout')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {/* Recent Commissions */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('recentCommissions.title')}</CardTitle>
            <Link href="/affiliate/commissions">
              <Button type="button" variant="outline" size="sm">
                {t('viewAll')}
              </Button>
            </Link>
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
            <Link href="/affiliate/payouts">
              <Button type="button" variant="outline" size="sm">
                {t('viewAll')}
              </Button>
            </Link>
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
