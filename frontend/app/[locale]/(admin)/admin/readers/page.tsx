'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAdminReaders } from '@/hooks/useAdminReaders';
import { ContentPreference } from '@/lib/api/readers';
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
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  AlertTriangle,
  Wallet,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export default function AdminReadersPage() {
  const t = useTranslations('adminReaders');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { useAllReaders, useReaderStats } = useAdminReaders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contentFilter, setContentFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');

  const { data: readers, isLoading: isLoadingReaders } = useAllReaders({
    search: searchQuery || undefined,
    status:
      statusFilter !== 'all' ? (statusFilter as 'active' | 'suspended' | 'flagged') : undefined,
    contentPreference: contentFilter !== 'all' ? (contentFilter as ContentPreference) : undefined,
    hasVerifiedAmazon:
      verifiedFilter === 'verified' ? true : verifiedFilter === 'unverified' ? false : undefined,
  });

  const { data: stats, isLoading: isLoadingStats } = useReaderStats();

  // Get unique countries and languages for filter dropdowns
  const { countries, languages } = useMemo(() => {
    if (!readers) return { countries: [], languages: [] };
    const countrySet = new Set<string>();
    const languageSet = new Set<string>();
    readers.forEach((r) => {
      if (r.country) countrySet.add(r.country);
      if (r.language) languageSet.add(r.language);
    });
    return {
      countries: Array.from(countrySet).sort(),
      languages: Array.from(languageSet).sort(),
    };
  }, [readers]);

  const filteredReaders = useMemo(() => {
    if (!readers) return [];
    return readers.filter((reader) => {
      // Apply country filter (client-side until backend supports it)
      if (countryFilter !== 'all' && reader.country !== countryFilter) return false;
      // Apply language filter (client-side until backend supports it)
      if (languageFilter !== 'all' && reader.language !== languageFilter) return false;
      return true;
    });
  }, [readers, countryFilter, languageFilter]);

  const getStatusBadge = (reader: NonNullable<typeof readers>[number]) => {
    if (!reader.isActive) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{t('status.suspended')}</Badge>
      );
    }
    if (reader.isFlagged) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          {t('status.flagged')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{t('status.active')}</Badge>
    );
  };

  const getContentPreferenceBadge = (preference: ContentPreference) => {
    switch (preference) {
      case ContentPreference.EBOOK:
        return <Badge variant="outline">{t('contentPreference.ebook')}</Badge>;
      case ContentPreference.AUDIOBOOK:
        return <Badge variant="outline">{t('contentPreference.audiobook')}</Badge>;
      case ContentPreference.BOTH:
        return <Badge variant="outline">{t('contentPreference.both')}</Badge>;
      default:
        return <Badge variant="outline">{preference}</Badge>;
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoadingReaders || isLoadingStats) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-64 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="animate-fade-up-fast">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalReaders')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReaders || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.allReaders')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-light-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.activeReaders')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activeReaders || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.currentlyActive')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.suspendedReaders')}</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.suspendedReaders || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.accountsSuspended')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-heavy-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.flaggedReaders')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.flaggedReaders || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.needsAttention')}</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-up-extra-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalBalance')}</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${(stats?.totalWalletBalance || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.inReaderWallets')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-zoom-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.newThisMonth')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newReadersThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">{t('stats.newRegistrations')}</p>
          </CardContent>
        </Card>

        <Card className="animate-zoom-in-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgReliability')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.averageReliabilityScore || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.platformAverage')}</p>
          </CardContent>
        </Card>

        <Card className="animate-zoom-in-medium-slow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.avgCompletion')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.averageCompletionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.completionRate')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="animate-zoom-in-slow">
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
            <div className="w-full animate-fade-left-light-slow md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('status.active')}</SelectItem>
                  <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
                  <SelectItem value="flagged">{t('status.flagged')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="animate-fade-left-medium-slow w-full md:w-40">
              <Select value={contentFilter} onValueChange={setContentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.contentPreference')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allPreferences')}</SelectItem>
                  <SelectItem value={ContentPreference.EBOOK}>
                    {t('contentPreference.ebook')}
                  </SelectItem>
                  <SelectItem value={ContentPreference.AUDIOBOOK}>
                    {t('contentPreference.audiobook')}
                  </SelectItem>
                  <SelectItem value={ContentPreference.BOTH}>
                    {t('contentPreference.both')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="animate-fade-left-heavy-slow w-full md:w-48">
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.amazonVerification')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allVerification')}</SelectItem>
                  <SelectItem value="verified">{t('filters.verified')}</SelectItem>
                  <SelectItem value="unverified">{t('filters.unverified')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Second row of filters: Country and Language per Section 4.4 */}
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <div className="animate-fade-left-fast w-full md:w-48">
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.country')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allCountries')}</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="animate-fade-left-light-slow w-full md:w-48">
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allLanguages')}</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Readers Table */}
      <Card className="animate-zoom-in-heavy-slow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('table.title')} ({filteredReaders.length})
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReaders.length === 0 ? (
            <div className="animate-fade-up py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-muted-foreground">{t('empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.reader')}</TableHead>
                  <TableHead>{t('table.country')}</TableHead>
                  <TableHead>{t('table.language')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.preference')}</TableHead>
                  <TableHead>{t('table.amazon')}</TableHead>
                  <TableHead>{t('table.reviews')}</TableHead>
                  <TableHead>{t('table.reliability')}</TableHead>
                  <TableHead>{t('table.wallet')}</TableHead>
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
                      <span className="text-sm">{reader.country || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{reader.language || '-'}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(reader)}</TableCell>
                    <TableCell>{getContentPreferenceBadge(reader.contentPreference)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {reader.verifiedAmazonProfiles > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {reader.verifiedAmazonProfiles}/{reader.amazonProfilesCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">
                          {reader.reviewsCompleted}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-red-600">{reader.reviewsExpired}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('table.completedExpired')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={reader.reliabilityScore} className="h-2 w-16" />
                        <span
                          className={`text-sm font-medium ${getReliabilityColor(reader.reliabilityScore)}`}
                        >
                          {reader.reliabilityScore.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${reader.walletBalance.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('table.earned')}: ${reader.totalEarned.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/admin/readers/${reader.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/${locale}/admin/readers/${reader.id}?tab=actions`)}
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
