'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useClosersList, useAdminsList } from '@/hooks/useAdminTeam';
import { CreateCloserDialog } from './CreateCloserDialog';
import { CreateAdminDialog } from './CreateAdminDialog';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Shield,
  Search,
  Filter,
  DollarSign,
  Package,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminTeamPage() {
  const t = useTranslations('adminTeam');
  const [activeTab, setActiveTab] = useState('closers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: closers, isLoading: closersLoading } = useClosersList();
  const { data: admins, isLoading: adminsLoading } = useAdminsList();

  // Filter closers
  const filteredClosers = useMemo(() => {
    if (!closers) return [];

    return closers.filter((closer) => {
      // Status filter
      if (statusFilter === 'active' && !closer.isActive) return false;
      if (statusFilter === 'inactive' && closer.isActive) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          closer.email.toLowerCase().includes(query) || closer.name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [closers, statusFilter, searchQuery]);

  // Filter admins
  const filteredAdmins = useMemo(() => {
    if (!admins) return [];

    return admins.filter((admin) => {
      // Status filter
      if (statusFilter === 'active' && !admin.isActive) return false;
      if (statusFilter === 'inactive' && admin.isActive) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          admin.email.toLowerCase().includes(query) || admin.name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [admins, statusFilter, searchQuery]);

  // Stats
  const closerStats = useMemo(() => {
    if (!closers) return { total: 0, active: 0, totalSales: 0, totalCommission: 0 };
    return {
      total: closers.length,
      active: closers.filter((c) => c.isActive).length,
      totalSales: closers.reduce((sum, c) => sum + c.totalSales, 0),
      totalCommission: closers.reduce((sum, c) => sum + c.commissionEarned, 0),
    };
  }, [closers]);

  const adminStats = useMemo(() => {
    if (!admins) return { total: 0, superAdmins: 0 };
    return {
      total: admins.length,
      superAdmins: admins.filter((a) => a.role === 'SUPER_ADMIN').length,
    };
  }, [admins]);

  const isLoading = closersLoading || adminsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <CreateAdminDialog />
          <CreateCloserDialog />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalClosers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {closerStats.active} {t('status.active').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalSales')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${closerStats.totalSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t('closers.table.sales')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalAdmins')}</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats.superAdmins} {t('stats.superAdmins').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalCommission')}</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${closerStats.totalCommission.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t('closers.table.commission')}</p>
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
          <div className="min-w-[200px] flex-1">
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

          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {/* Tabs for Closers and Admins */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-zoom-in-slow">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="closers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('tabs.closers')} ({filteredClosers.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('tabs.admins')} ({filteredAdmins.length})
          </TabsTrigger>
        </TabsList>

        {/* Closers Tab */}
        <TabsContent value="closers">
          <Card>
            <CardHeader>
              <CardTitle>{t('closers.title')}</CardTitle>
              <CardDescription>{t('closers.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredClosers.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{t('closers.empty.title')}</h3>
                  <p className="text-muted-foreground">{t('closers.empty.description')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('closers.table.name')}</TableHead>
                      <TableHead>{t('closers.table.email')}</TableHead>
                      <TableHead>{t('closers.table.commission')}</TableHead>
                      <TableHead>{t('closers.table.sales')}</TableHead>
                      <TableHead>{t('closers.table.packages')}</TableHead>
                      <TableHead>{t('closers.table.status')}</TableHead>
                      <TableHead>{t('closers.table.joined')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClosers.map((closer) => (
                      <TableRow key={closer.id}>
                        <TableCell className="font-medium">{closer.name}</TableCell>
                        <TableCell>{closer.email}</TableCell>
                        <TableCell>{closer.commissionRate}%</TableCell>
                        <TableCell>${closer.totalSales.toFixed(2)}</TableCell>
                        <TableCell>{closer.totalPackagesSold}</TableCell>
                        <TableCell>
                          {closer.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="mr-1 h-3 w-3" />
                              {t('status.active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t('status.inactive')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(closer.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>{t('admins.title')}</CardTitle>
              <CardDescription>{t('admins.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAdmins.length === 0 ? (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{t('admins.empty.title')}</h3>
                  <p className="text-muted-foreground">{t('admins.empty.description')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admins.table.name')}</TableHead>
                      <TableHead>{t('admins.table.email')}</TableHead>
                      <TableHead>{t('admins.table.role')}</TableHead>
                      <TableHead>{t('admins.table.permissions')}</TableHead>
                      <TableHead>{t('admins.table.status')}</TableHead>
                      <TableHead>{t('admins.table.joined')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={admin.role === 'SUPER_ADMIN' ? 'default' : 'outline'}
                            className={admin.role === 'SUPER_ADMIN' ? 'bg-purple-600' : ''}
                          >
                            {t(`admins.roles.${admin.role}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {admin.permissions.length} {t('admins.table.permissions').toLowerCase()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {admin.isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="mr-1 h-3 w-3" />
                              {t('status.active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t('status.inactive')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(admin.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
