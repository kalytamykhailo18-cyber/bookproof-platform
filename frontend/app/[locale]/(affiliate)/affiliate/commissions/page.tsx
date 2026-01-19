'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCommissions } from '@/hooks/useAffiliates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CommissionStatus } from '@/lib/api/affiliates';

export default function AffiliateCommissionsPage() {
  const t = useTranslations('affiliates.commissions');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | undefined>(undefined);

  const { data: commissions, isLoading } = useCommissions(statusFilter);

  const getCommissionStatusBadge = (status: CommissionStatus) => {
    const variants: Record<
      CommissionStatus,
      { variant: 'default' | 'secondary' | 'outline' | 'destructive'; className?: string }
    > = {
      PENDING: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { variant: 'default', className: 'bg-green-100 text-green-800' },
      PAID: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { variant: 'destructive' },
    };
    return (
      <Badge variant={variants[status].variant} className={variants[status].className}>
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const calculateTotals = () => {
    if (!commissions) return { total: 0, pending: 0, approved: 0, paid: 0 };

    return {
      total: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      pending: commissions
        .filter((c) => c.status === CommissionStatus.PENDING)
        .reduce((sum, c) => sum + c.commissionAmount, 0),
      approved: commissions
        .filter((c) => c.status === CommissionStatus.APPROVED)
        .reduce((sum, c) => sum + c.commissionAmount, 0),
      paid: commissions
        .filter((c) => c.status === CommissionStatus.PAID)
        .reduce((sum, c) => sum + c.commissionAmount, 0),
    };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 animate-pulse" />
          <Skeleton className="h-5 w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
          <Skeleton className="h-24 animate-pulse" />
        </div>
        <Skeleton className="h-24 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.total.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totals.pending.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totals.approved.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-very-slow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('summary.paid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totals.paid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) =>
                  setStatusFilter(value === 'all' ? undefined : (value as CommissionStatus))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  <SelectItem value={CommissionStatus.PENDING}>{t('status.pending')}</SelectItem>
                  <SelectItem value={CommissionStatus.APPROVED}>{t('status.approved')}</SelectItem>
                  <SelectItem value={CommissionStatus.PAID}>{t('status.paid')}</SelectItem>
                  <SelectItem value={CommissionStatus.CANCELLED}>
                    {t('status.cancelled')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!commissions || commissions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p>{t('table.empty')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.purchaseAmount')}</TableHead>
                  <TableHead>{t('table.commissionAmount')}</TableHead>
                  <TableHead>{t('table.rate')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.createdAt')}</TableHead>
                  <TableHead>{t('table.approvedAt')}</TableHead>
                  <TableHead>{t('table.paidAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission, index) => (
                  <TableRow
                    key={commission.id}
                    className={`animate-fade-up-${index % 2 === 0 ? 'fast' : 'light-slow'}`}
                  >
                    <TableCell>${commission.purchaseAmount.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      ${commission.commissionAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{commission.commissionRate}%</TableCell>
                    <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                    <TableCell>{formatDate(commission.createdAt)}</TableCell>
                    <TableCell>
                      {commission.approvedAt ? formatDate(commission.approvedAt) : '-'}
                    </TableCell>
                    <TableCell>{commission.paidAt ? formatDate(commission.paidAt) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="animate-fade-up-very-slow">
        <CardHeader>
          <CardTitle>{t('info.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t('info.pending')}</p>
          <p>{t('info.approved')}</p>
          <p>{t('info.paid')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
