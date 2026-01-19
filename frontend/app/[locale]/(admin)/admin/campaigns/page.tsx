'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAdminControls } from '@/hooks/useAdminControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Eye,
  Settings,
} from 'lucide-react';

export default function AdminCampaignsPage() {
  const t = useTranslations('adminCampaigns');
  const router = useRouter();
  const { useAllCampaigns } = useAdminControls();
  const { data: campaigns, isLoading } = useAllCampaigns();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.campaign.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || campaign.campaign.status === statusFilter;

      // Calculate health status for filtering
      let healthStatus = 'on-track';
      if (campaign.progress.completionPercentage < 50 && campaign.distribution.currentWeek > campaign.distribution.totalWeeks / 2) {
        healthStatus = 'delayed';
      } else if (campaign.progress.completionPercentage >= 90) {
        healthStatus = 'ahead-of-schedule';
      }

      const matchesHealth = healthFilter === 'all' || healthStatus === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [campaigns, searchQuery, statusFilter, healthFilter]);

  const stats = useMemo(() => {
    if (!campaigns) return { total: 0, active: 0, paused: 0, completed: 0 };

    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.campaign.status === 'ACTIVE').length,
      paused: campaigns.filter((c) => c.campaign.status === 'PAUSED').length,
      completed: campaigns.filter((c) => c.campaign.status === 'COMPLETED').length,
    };
  }, [campaigns]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{t('status.active')}</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{t('status.paused')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{t('status.completed')}</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{t('status.draft')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthBadge = (campaign: (typeof campaigns)[0]) => {
    const percentage = campaign.progress.completionPercentage;
    const currentWeek = campaign.distribution.currentWeek;
    const totalWeeks = campaign.distribution.totalWeeks;
    const expectedProgress = (currentWeek / totalWeeks) * 100;

    if (percentage >= expectedProgress + 10) {
      return <Badge className="bg-blue-100 text-blue-800">{t('health.aheadOfSchedule')}</Badge>;
    } else if (percentage >= expectedProgress - 10) {
      return <Badge className="bg-green-100 text-green-800">{t('health.onTrack')}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{t('health.delayed')}</Badge>;
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
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t('stats.allCampaigns')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.active')}</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t('stats.currentlyRunning')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.paused')}</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
            <p className="text-xs text-muted-foreground">{t('stats.onHold')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.completed')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">{t('stats.fullyDelivered')}</p>
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
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 animate-fade-left-fast">
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
            <div className="w-full md:w-48 animate-fade-left-light-slow">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('status.active')}</SelectItem>
                  <SelectItem value="PAUSED">{t('status.paused')}</SelectItem>
                  <SelectItem value="COMPLETED">{t('status.completed')}</SelectItem>
                  <SelectItem value="DRAFT">{t('status.draft')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48 animate-fade-left-medium-slow">
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.health')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allHealth')}</SelectItem>
                  <SelectItem value="on-track">{t('health.onTrack')}</SelectItem>
                  <SelectItem value="delayed">{t('health.delayed')}</SelectItem>
                  <SelectItem value="ahead-of-schedule">{t('health.aheadOfSchedule')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card className="animate-zoom-in-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('table.title')} ({filteredCampaigns.length})
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="py-16 text-center animate-fade-up">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.bookTitle')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.health')}</TableHead>
                  <TableHead>{t('table.progress')}</TableHead>
                  <TableHead>{t('table.reviewsPerWeek')}</TableHead>
                  <TableHead>{t('table.weekProgress')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign, index) => (
                  <TableRow
                    key={campaign.campaign.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate">{campaign.campaign.title}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.campaign.status)}</TableCell>
                    <TableCell>{getHealthBadge(campaign)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={campaign.progress.completionPercentage}
                          className="h-2 w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {campaign.progress.completionPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.progress.reviewsDelivered}/{campaign.campaign.targetReviews}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {campaign.distribution.reviewsPerWeek}
                        {campaign.distribution.manualOverride && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {t('table.manual')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {t('table.week')} {campaign.distribution.currentWeek}/{campaign.distribution.totalWeeks}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/campaigns/${campaign.campaign.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/campaigns/${campaign.campaign.id}/controls`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
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
