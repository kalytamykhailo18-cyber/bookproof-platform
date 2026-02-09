import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Users, Hash, BarChart3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCoupon, useCouponUsageStats } from '@/hooks/useCoupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

export function CouponUsagePage() {
  const { t } = useTranslation('adminCoupons');
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id as string;
  const locale = (params.locale as string) || 'en';

  const { data: coupon, isLoading: couponLoading } = useCoupon(id);
  const { data: stats, isLoading: statsLoading } = useCouponUsageStats(id);

  const [isBackLoading, setIsBackLoading] = useState(false);

  const isLoading = couponLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 py-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!coupon || !stats) {
    return (
      <div className="container mx-auto max-w-6xl py-6">
        <p className="text-center text-muted-foreground">Coupon not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsBackLoading(true);
            navigate(`/${locale}/admin/coupons/${id}`);
          }}
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {t('usage.title')}: <span className="font-mono">{coupon.code}</span>
          </h1>
          <p className="text-muted-foreground">
            {coupon.isActive ? (
              <Badge variant="default">{t('status.active')}</Badge>
            ) : (
              <Badge variant="secondary">{t('status.inactive')}</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('usage.overview.totalUses')}</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUses}</div>
            {coupon.maxUses && (
              <p className="text-xs text-muted-foreground">of {coupon.maxUses} max uses</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('usage.overview.uniqueUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUses > 0
                ? `${((stats.uniqueUsers / stats.totalUses) * 100).toFixed(0)}% unique`
                : 'No uses yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('usage.overview.totalDiscount')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDiscountGiven.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">total savings for users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('usage.overview.avgDiscount')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {stats.totalUses > 0
                ? (stats.totalDiscountGiven / stats.totalUses).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">per use</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Date (if available) */}
      {stats.usageByDate && Object.keys(stats.usageByDate).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('usage.chart.title')}</CardTitle>
            <CardDescription>Daily usage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.usageByDate).map(([date, count]) => (
                <div key={date} className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm">{formatDate(date)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{count} uses</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Uses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('usage.recent.title')}</CardTitle>
          <CardDescription>Last 10 coupon uses</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentUsages && stats.recentUsages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('usage.recent.user')}</TableHead>
                  <TableHead>{t('usage.recent.email')}</TableHead>
                  <TableHead>{t('usage.recent.discount')}</TableHead>
                  <TableHead>{t('usage.recent.order')}</TableHead>
                  <TableHead>{t('usage.recent.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentUsages.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell className="font-medium">{usage.userId}</TableCell>
                    <TableCell>{usage.userEmail}</TableCell>
                    <TableCell>${usage.discountApplied.toFixed(2)}</TableCell>
                    <TableCell>
                      {usage.creditPurchaseId && <Badge variant="outline">Credit Purchase</Badge>}
                      {usage.keywordResearchId && <Badge variant="outline">Keyword Research</Badge>}
                    </TableCell>
                    <TableCell>{formatDate(usage.usedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No usage data yet. This coupon has not been used.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
