import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { adminControlsApi, CampaignAnalyticsDto } from '@/lib/api/admin-controls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function AdminCampaignsListPage() {
  const { t } = useTranslation('adminCampaigns');
  const navigate = useNavigate();

  // State management following correct patterns
  const [campaigns, setCampaigns] = useState<CampaignAnalyticsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await adminControlsApi.getAllCampaigns();
      setCampaigns(data);
    } catch (error: any) {
      console.error('Campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // ✅ PATTERN: useMemo for filtered arrays (prevents infinite render loops)
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    return campaigns.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.campaign.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return item.campaign.title.toLowerCase().includes(query);
      }

      return true;
    });
  }, [campaigns, statusFilter, searchQuery]);

  // ✅ PATTERN: useMemo for computed stats
  const stats = useMemo(() => {
    if (!campaigns) {
      return { total: 0, active: 0, paused: 0, completed: 0, totalProgress: 0 };
    }

    const active = campaigns.filter((c) => c.campaign.status === 'ACTIVE').length;
    const paused = campaigns.filter((c) => c.campaign.status === 'PAUSED').length;
    const completed = campaigns.filter((c) => c.campaign.status === 'COMPLETED').length;
    const totalProgress =
      campaigns.reduce((sum, c) => sum + c.progress.completionPercentage, 0) /
      (campaigns.length || 1);

    return {
      total: campaigns.length,
      active,
      paused,
      completed,
      totalProgress,
    };
  }, [campaigns]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">{t('list.status.active')}</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('list.status.paused')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">{t('list.status.completed')}</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">{t('list.status.draft')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">{t('list.status.cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 animate-pulse" />
          ))}
        </div>
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold">{t('list.title')}</h1>
          <p className="text-muted-foreground">{t('list.description')}</p>
        </div>
        <Button onClick={fetchCampaigns} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('list.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('list.stats.total')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('list.stats.totalDesc')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('list.stats.active')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t('list.stats.activeDesc')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('list.stats.paused')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
            <p className="text-xs text-muted-foreground">{t('list.stats.pausedDesc')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('list.stats.completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t('list.stats.completedDesc')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('list.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('list.filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('list.filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('list.filters.allStatus')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('list.filters.active')}</SelectItem>
                  <SelectItem value="PAUSED">{t('list.filters.paused')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('list.filters.completed')}</SelectItem>
                  <SelectItem value="DRAFT">{t('list.filters.draft')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('list.filters.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card className="animate-fade-up-light-slow">
        <CardHeader>
          <CardTitle>{t('list.table.title', { count: filteredCampaigns.length })}</CardTitle>
          <CardDescription>
            {t('list.table.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('list.table.empty.title')}</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? t('list.table.empty.tryFilters')
                  : t('list.table.empty.noCampaigns')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('list.table.campaign')}</TableHead>
                    <TableHead>{t('list.table.status')}</TableHead>
                    <TableHead className="text-center">{t('list.table.progress')}</TableHead>
                    <TableHead className="text-center">{t('list.table.reviews')}</TableHead>
                    <TableHead className="text-center">{t('list.table.week')}</TableHead>
                    <TableHead className="text-center">{t('list.table.rating')}</TableHead>
                    <TableHead>{t('list.table.timeline')}</TableHead>
                    <TableHead className="text-right">{t('list.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((item) => (
                    <TableRow key={item.campaign.id}>
                      <TableCell>
                        <div className="font-medium">{item.campaign.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {item.campaign.id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-medium">
                            {item.progress.completionPercentage.toFixed(1)}%
                          </span>
                          <Progress
                            value={item.progress.completionPercentage}
                            className="h-2 w-20"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <span className="font-medium">
                            {item.progress.reviewsDelivered}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            / {item.campaign.targetReviews}
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          {item.progress.reviewsValidated} {t('list.table.validated')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">
                          {item.distribution.currentWeek} / {item.distribution.totalWeeks}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {item.distribution.reviewsPerWeek}/week
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm font-medium text-yellow-600">
                            {item.performance.averageRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">/5</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="text-muted-foreground">
                            {t('list.table.start')}: {formatDate(item.timeline.startDate)}
                          </div>
                          <div className="text-muted-foreground">
                            {t('list.table.end')}: {formatDate(item.timeline.expectedEndDate)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/campaigns/${item.campaign.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t('list.table.viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
