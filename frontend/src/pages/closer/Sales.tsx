import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useCloserSalesHistory, useCloserDashboardStats } from '@/hooks/useCloser';
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
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight } from 'lucide-react';

export function SalesHistoryPage() {
  const { t } = useTranslation('closer');
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: stats, isLoading: statsLoading } = useCloserDashboardStats();
  const { data: sales, isLoading } = useCloserSalesHistory(limit, page * limit);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency }).format(amount);
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-5 w-80 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
          <Skeleton className="h-32 animate-pulse" />
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('sales.title')}</h1>
        <p className="text-muted-foreground">{t('sales.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.totalThisMonth')}</CardTitle>
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
              <span className="ml-1">{t('sales.vsLastMonth')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.lastMonth')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats?.salesLastMonth || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('sales.previousPeriod')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.avgDealSize')}</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats?.averageDealSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('sales.perPackage')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.packagesPaid')}</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.packagesPaidThisMonth || 0}
            </div>
            <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('sales.completedSales')}</CardTitle>
          <CardDescription>{t('sales.completedSalesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
            </div>
          ) : sales && sales.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.client')}</TableHead>
                    <TableHead>{t('packageDetail.company')}</TableHead>
                    <TableHead>{t('common.amount')}</TableHead>
                    <TableHead>{t('common.credits')}</TableHead>
                    <TableHead>{t('status.accountCreated')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale, index) => (
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
                      <TableCell>{sale.clientCompany || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.amount, sale.currency)}
                      </TableCell>
                      <TableCell>{sale.credits || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={sale.accountCreated ? 'default' : 'secondary'}>
                          {sale.accountCreated ? t('status.accountCreated') : t('status.pending')}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('sales.showing')} {page * limit + 1} - {page * limit + sales.length}{' '}
                  {t('sales.results')}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('sales.previous')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={sales.length < limit}
                  >
                    {t('sales.next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">{t('sales.noSalesYet')}</p>
              <p className="text-sm text-muted-foreground">{t('sales.salesWillAppear')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
