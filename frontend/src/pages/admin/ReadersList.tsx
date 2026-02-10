import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminReadersApi } from '@/lib/api/admin-readers';
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
  TrendingUp,
  Wallet,
  BookOpen,
  Shield,
  AlertCircle,
} from 'lucide-react';
import type { AdminReaderListItemDto } from '@/lib/api/admin-readers';
import { ContentPreference } from '@/lib/api/readers';

export function AdminReadersListPage() {
  const { t } = useTranslation('adminReaders');
  const navigate = useNavigate();

  // Data state
  const [readers, setReaders] = useState<AdminReaderListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'flagged'>('all');
  const [contentFilter, setContentFilter] = useState<ContentPreference | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Safety mechanism: prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  // Fetch all readers
  const fetchReaders = async () => {
    try {
      setIsLoading(true);
      const data = await adminReadersApi.getAllReaders();
      setReaders(data);
    } catch (error: any) {
      console.error('[ReadersList] Fetch error:', error);
      toast.error('Failed to load readers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchReaders();
    }
  }, []);

  // Memoize filtered readers
  const filteredReaders = useMemo(() => {
    if (!readers) return [];

    return readers.filter((reader) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        reader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.country.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && reader.isActive && !reader.isFlagged) ||
        (statusFilter === 'suspended' && !reader.isActive) ||
        (statusFilter === 'flagged' && reader.isFlagged);

      // Content preference filter
      const matchesContent =
        contentFilter === 'all' || reader.contentPreference === contentFilter;

      // Verified Amazon filter
      const matchesVerified =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && reader.verifiedAmazonProfiles > 0) ||
        (verifiedFilter === 'unverified' && reader.verifiedAmazonProfiles === 0);

      return matchesSearch && matchesStatus && matchesContent && matchesVerified;
    });
  }, [readers, searchQuery, statusFilter, contentFilter, verifiedFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!readers || readers.length === 0) {
      return {
        total: 0,
        active: 0,
        suspended: 0,
        flagged: 0,
        totalWalletBalance: 0,
        avgReliability: 0,
      };
    }

    const active = readers.filter((r) => r.isActive && !r.isFlagged).length;
    const suspended = readers.filter((r) => !r.isActive).length;
    const flagged = readers.filter((r) => r.isFlagged).length;
    const totalWalletBalance = readers.reduce((sum, r) => sum + r.walletBalance, 0);
    const avgReliability =
      readers.reduce((sum, r) => sum + r.reliabilityScore, 0) / readers.length;

    return {
      total: readers.length,
      active,
      suspended,
      flagged,
      totalWalletBalance,
      avgReliability,
    };
  }, [readers]);

  const getStatusBadge = (reader: AdminReaderListItemDto) => {
    if (!reader.isActive) {
      return <Badge variant="destructive">{t('status.suspended')}</Badge>;
    }
    if (reader.isFlagged) {
      return <Badge className="bg-yellow-100 text-yellow-800">{t('status.flagged')}</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">{t('status.active')}</Badge>;
  };

  const getContentBadge = (preference: ContentPreference) => {
    const config = {
      [ContentPreference.EBOOK]: { label: 'eBook', color: 'bg-blue-100 text-blue-800' },
      [ContentPreference.AUDIOBOOK]: { label: 'Audiobook', color: 'bg-purple-100 text-purple-800' },
      [ContentPreference.BOTH]: { label: 'Both', color: 'bg-green-100 text-green-800' },
    };
    const { label, color } = config[preference];
    return <Badge className={color}>{label}</Badge>;
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
            <CardTitle className="text-sm font-medium">{t('stats.totalReaders')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.activeReaders')}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.suspended} suspended, {stats.flagged} flagged
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalWalletBalance')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalWalletBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgReliability')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReliability.toFixed(1)}%</div>
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
          <div className="grid gap-4 md:grid-cols-4">
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
                  <SelectItem value="active">{t('filters.active')}</SelectItem>
                  <SelectItem value="suspended">{t('filters.suspended')}</SelectItem>
                  <SelectItem value="flagged">{t('filters.flagged')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Preference Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.contentPreference')}</label>
              <Select value={contentFilter} onValueChange={(v: any) => setContentFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allContent')}</SelectItem>
                  <SelectItem value={ContentPreference.EBOOK}>eBook</SelectItem>
                  <SelectItem value={ContentPreference.AUDIOBOOK}>Audiobook</SelectItem>
                  <SelectItem value={ContentPreference.BOTH}>Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verified Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.verified')}</label>
              <Select value={verifiedFilter} onValueChange={(v: any) => setVerifiedFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allVerified')}</SelectItem>
                  <SelectItem value="verified">{t('filters.verifiedOnly')}</SelectItem>
                  <SelectItem value="unverified">{t('filters.unverifiedOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readers Table */}
      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>
            {t('table.showing')} {filteredReaders.length} {t('table.of')} {readers.length}{' '}
            {t('table.readers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t('table.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('table.noResultsDescription')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.reader')}</TableHead>
                  <TableHead>{t('table.location')}</TableHead>
                  <TableHead>{t('table.content')}</TableHead>
                  <TableHead>{t('table.stats')}</TableHead>
                  <TableHead>{t('table.wallet')}</TableHead>
                  <TableHead>{t('table.reliability')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReaders.map((reader, index) => (
                  <TableRow
                    key={reader.id}
                    className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow'][index % 4]}`}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{reader.name}</div>
                        <div className="text-sm text-muted-foreground">{reader.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reader.country}</div>
                        <div className="text-muted-foreground">{reader.language}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getContentBadge(reader.contentPreference)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">
                            {reader.reviewsCompleted}
                          </span>
                          <span className="text-muted-foreground">completed</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reader.reviewsExpired} expired · {reader.reviewsRejected} rejected
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium">${reader.walletBalance.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          ${reader.totalEarned.toFixed(2)} earned
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{reader.reliabilityScore.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                          {reader.completionRate.toFixed(1)}% completion
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(reader)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/readers/${reader.id}`)}
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
