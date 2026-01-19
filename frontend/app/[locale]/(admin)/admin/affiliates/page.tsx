'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAffiliatesForAdmin } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  MousePointer,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminAffiliatesPage() {
  const t = useTranslations('adminAffiliates');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: affiliates, isLoading } = useAffiliatesForAdmin();

  const filteredAffiliates = useMemo(() => {
    if (!affiliates) return [];

    return affiliates.filter((affiliate) => {
      // Approval filter
      if (approvalFilter === 'approved' && !affiliate.isApproved) return false;
      if (approvalFilter === 'pending' && affiliate.isApproved) return false;

      // Active filter
      if (activeFilter === 'active' && !affiliate.isActive) return false;
      if (activeFilter === 'inactive' && affiliate.isActive) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          affiliate.userEmail.toLowerCase().includes(query) ||
          affiliate.userName.toLowerCase().includes(query) ||
          affiliate.referralCode.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [affiliates, approvalFilter, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    if (!affiliates) return { total: 0, approved: 0, pending: 0, totalEarnings: 0, totalClicks: 0 };

    return {
      total: affiliates.length,
      approved: affiliates.filter((a) => a.isApproved).length,
      pending: affiliates.filter((a) => !a.isApproved).length,
      totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
      totalClicks: affiliates.reduce((sum, a) => sum + a.totalClicks, 0),
    };
  }, [affiliates]);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-24 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAffiliates')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('stats.registered')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.approved')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">{t('stats.activePartners')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">{t('stats.awaitingApproval')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalEarnings')}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.commissionsPaid')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-extra-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalClicks')}</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.referralClicks')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1 animate-fade-left-fast">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-48 animate-fade-left-light-slow">
            <Select value={approvalFilter} onValueChange={setApprovalFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.approval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allApproval')}</SelectItem>
                <SelectItem value="approved">{t('filters.approved')}</SelectItem>
                <SelectItem value="pending">{t('filters.pending')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="animate-fade-left-medium-slow w-48">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                <SelectItem value="active">{t('filters.active')}</SelectItem>
                <SelectItem value="inactive">{t('filters.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('table.title')} ({filteredAffiliates.length})
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAffiliates.length === 0 ? (
            <div className="animate-fade-up py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.affiliate')}</TableHead>
                  <TableHead>{t('table.referralCode')}</TableHead>
                  <TableHead>{t('table.commission')}</TableHead>
                  <TableHead>{t('table.earnings')}</TableHead>
                  <TableHead>{t('table.clicks')}</TableHead>
                  <TableHead>{t('table.conversions')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.joined')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate, index) => (
                  <TableRow
                    key={affiliate.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{affiliate.userName}</p>
                        <p className="text-sm text-muted-foreground">{affiliate.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {affiliate.referralCode}
                      </Badge>
                    </TableCell>
                    <TableCell>{affiliate.commissionRate}%</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">${affiliate.totalEarnings.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('table.approved')}: ${affiliate.approvedEarnings.toFixed(2)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{affiliate.totalClicks.toLocaleString()}</TableCell>
                    <TableCell>{affiliate.totalConversions}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {affiliate.isApproved ? (
                          <Badge className="w-fit bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t('status.approved')}
                          </Badge>
                        ) : (
                          <Badge className="w-fit bg-yellow-100 text-yellow-800">
                            <Clock className="mr-1 h-3 w-3" />
                            {t('status.pending')}
                          </Badge>
                        )}
                        {affiliate.isActive ? (
                          <Badge variant="outline" className="w-fit bg-green-50 text-green-700">
                            {t('status.active')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-fit bg-gray-50 text-gray-700">
                            {t('status.inactive')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="sm" asChild>
                        <Link href={`/admin/affiliates/${affiliate.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
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
