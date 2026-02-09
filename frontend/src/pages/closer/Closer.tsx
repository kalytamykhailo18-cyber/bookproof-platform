import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import {
  useCloserDashboardStats,
  useCloserPackageStats,
  useCloserSalesHistory } from '@/hooks/useCloser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from '@/components/ui/table';
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2 } from 'lucide-react';
import { useNavigate,  useParams } from 'react-router-dom';

export function CloserDashboardPage() {
  const { t } = useTranslation('closer');
  const navigate = useNavigate();
  const params = useParams();
  const locale = params.locale as string;
  const { data: stats, isLoading: statsLoading } = useCloserDashboardStats();
  const { data: packageStats, isLoading: packageStatsLoading } = useCloserPackageStats();
  const { data: salesHistory, isLoading: salesLoading } = useCloserSalesHistory(5);

  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isViewAllLoading, setIsViewAllLoading] = useState(false);

  if (statsLoading || packageStatsLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 animate-pulse" />
            <Skeleton className="h-5 w-72 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-36 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 animate-pulse" />
          <Skeleton className="h-64 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency }).format(amount);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setIsCreateLoading(true);
            navigate(`/${locale}/closer/packages/new`);
          }}
          disabled={isCreateLoading}
        >
          {isCreateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {t('dashboard.createPackage')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.salesThisMonth')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.salesThisMonth || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats?.salesGrowth !== undefined && stats.salesGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{stats.salesGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">{stats?.salesGrowth?.toFixed(1)}%</span>
                </>
              )}
              <span className="ml-1">{t('dashboard.fromLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.packagesInPipeline')}
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.packagesInPipeline || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.pipelineValue || 0)} {t('dashboard.potentialValue')}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.conversionRate')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(stats?.conversionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.avgDealSize')}: {formatCurrency(stats?.averageDealSize || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.pendingCommission')}
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats?.pendingCommission || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.thisMonth')}: {formatCurrency(stats?.commissionThisMonth || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package Stats and Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Package Stats */}
        <Card className="animate-fade-left-slow">
          <CardHeader>
            <CardTitle>{t('dashboard.packageOverview')}</CardTitle>
            <CardDescription>{t('dashboard.statusBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.draft')}</span>
                <Badge variant="secondary">{packageStats?.draft || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.sent')}</span>
                <Badge variant="default">{packageStats?.sent || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.viewed')}</span>
                <Badge variant="outline">{packageStats?.viewed || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.paid')}</span>
                <Badge className="bg-green-500">{packageStats?.paid || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.expired')}</span>
                <Badge variant="destructive">{packageStats?.expired || 0}</Badge>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>{t('dashboard.totalRevenue')}</span>
                  <span>{formatCurrency(packageStats?.totalRevenue || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{t('dashboard.creditsSold')}</span>
                  <span>{packageStats?.totalCreditsSold || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month Activity */}
        <Card className="animate-fade-right-slow">
          <CardHeader>
            <CardTitle>{t('dashboard.thisMonthActivity')}</CardTitle>
            <CardDescription>{t('dashboard.yourPerformance')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.packagesCreated')}</span>
                <span className="font-semibold">{stats?.packagesCreatedThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.packagesSent')}</span>
                <span className="font-semibold">{stats?.packagesSentThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('dashboard.packagesPaid')}</span>
                <span className="font-semibold">{stats?.packagesPaidThisMonth || 0}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.lastMonthSales')}</span>
                  <span className="font-semibold">
                    {formatCurrency(stats?.salesLastMonth || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="animate-zoom-in-slow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('dashboard.recentSales')}</CardTitle>
            <CardDescription>{t('dashboard.latestCompletedSales')}</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsViewAllLoading(true);
              navigate(`/${locale}/closer/sales`);
            }}
            disabled={isViewAllLoading}
          >
            {isViewAllLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {t('dashboard.viewAll')}
          </Button>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
            </div>
          ) : salesHistory && salesHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.client')}</TableHead>
                  <TableHead>{t('common.amount')}</TableHead>
                  <TableHead>{t('common.credits')}</TableHead>
                  <TableHead>{t('status.paid')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesHistory.map((sale, index) => (
                  <TableRow
                    key={sale.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.clientName}</p>
                        <p className="text-sm text-muted-foreground">{sale.clientEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(sale.amount, sale.currency)}</TableCell>
                    <TableCell>{sale.credits || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={sale.accountCreated ? 'default' : 'secondary'}>
                        {sale.accountCreated ? t('status.accountCreated') : t('status.paid')}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t('dashboard.noSalesYet')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.createFirstPackage')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
