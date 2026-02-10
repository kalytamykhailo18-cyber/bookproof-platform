import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { affiliatesApi } from '@/lib/api/affiliates';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Eye,
  DollarSign,
  MousePointerClick,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function AdminAffiliatesListPage() {
  const { t } = useTranslation('adminAffiliates');
  const navigate = useNavigate();

  // Data state
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Safety mechanism: prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  // Fetch all affiliates
  const fetchAffiliates = async () => {
    try {
      setIsLoading(true);
      const data = await affiliatesApi.getAllForAdmin();
      setAffiliates(data);
    } catch (error: any) {
      console.error('[AffiliatesList] Fetch error:', error);
      toast.error('Failed to load affiliates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAffiliates();
    }
  }, []);

  // Memoize filtered affiliates
  const filteredAffiliates = useMemo(() => {
    if (!affiliates) return [];

    return affiliates.filter((affiliate) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        affiliate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affiliate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        affiliate.code?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || affiliate.status?.toLowerCase() === statusFilter;

      // Active filter
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && affiliate.isActive) ||
        (activeFilter === 'inactive' && !affiliate.isActive);

      return matchesSearch && matchesStatus && matchesActive;
    });
  }, [affiliates, searchQuery, statusFilter, activeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!affiliates || affiliates.length === 0) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        active: 0,
        totalEarnings: 0,
        totalClicks: 0,
      };
    }

    const pending = affiliates.filter((a) => a.status === 'PENDING').length;
    const approved = affiliates.filter((a) => a.status === 'APPROVED').length;
    const active = affiliates.filter((a) => a.isActive).length;
    const totalEarnings = affiliates.reduce((sum, a) => sum + (a.totalEarnings || 0), 0);
    const totalClicks = affiliates.reduce((sum, a) => sum + (a.totalClicks || 0), 0);

    return {
      total: affiliates.length,
      pending,
      approved,
      active,
      totalEarnings,
      totalClicks,
    };
  }, [affiliates]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    };

    const statusConfig = config[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        {statusConfig.icon}
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-4">
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
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('list.title')}</h1>
          <p className="text-muted-foreground">{t('list.description')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} pending approval
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.active')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved total
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalEarnings')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalClicks')}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="animate-zoom-in">
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
          <CardDescription>{t('filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.search')}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.status')}</label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                  <SelectItem value="pending">{t('filters.pending')}</SelectItem>
                  <SelectItem value="approved">{t('filters.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('filters.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.activeStatus')}</label>
              <Select value={activeFilter} onValueChange={(v: any) => setActiveFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allActive')}</SelectItem>
                  <SelectItem value="active">{t('filters.active')}</SelectItem>
                  <SelectItem value="inactive">{t('filters.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>
            {t('table.showing')} {filteredAffiliates.length} {t('table.of')} {affiliates.length}{' '}
            {t('table.affiliates')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAffiliates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t('table.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('table.noResultsDescription')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.affiliate')}</TableHead>
                  <TableHead>{t('table.code')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.active')}</TableHead>
                  <TableHead>{t('table.stats')}</TableHead>
                  <TableHead>{t('table.earnings')}</TableHead>
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
                        <div className="font-medium">{affiliate.name}</div>
                        <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{affiliate.code}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                    <TableCell>
                      {affiliate.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{affiliate.totalClicks} clicks</div>
                        <div className="text-muted-foreground">
                          {affiliate.totalConversions} conversions
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${(affiliate.totalEarnings || 0).toFixed(2)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/affiliates/${affiliate.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {t('table.view')}
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
