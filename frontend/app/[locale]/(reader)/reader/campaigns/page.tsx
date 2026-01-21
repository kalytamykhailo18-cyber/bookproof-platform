'use client';

import { useState } from 'react';
import { useAvailableCampaigns, useMyAssignments } from '@/hooks/useQueue';
import { useReaderProfile } from '@/hooks/useReaders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Search, Filter, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { BookFormat } from '@/lib/api/campaigns';
import { AvailableCampaign } from '@/lib/api/queue';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';

function CampaignCard({
  campaign,
  className,
}: {
  campaign: AvailableCampaign;
  className?: string;
}) {
  const t = useTranslations('reader.campaigns');
  const { applyToCampaign, isApplying } = useMyAssignments();
  const { profile } = useReaderProfile();
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(BookFormat.EBOOK);

  const canApply = !campaign.hasApplied;

  const handleApply = () => {
    if (!canApply) return;

    applyToCampaign({
      bookId: campaign.id,
      formatPreference: selectedFormat,
    });
  };

  // Determine available formats based on reader preference and campaign availability
  const getAvailableFormats = () => {
    if (!profile) return [];

    const campaignFormats = campaign.availableFormats;
    const readerPref = profile.contentPreference;

    if (campaignFormats === BookFormat.BOTH && readerPref === 'BOTH') {
      return [BookFormat.EBOOK, BookFormat.AUDIOBOOK];
    }
    if (campaignFormats === BookFormat.BOTH && readerPref === 'EBOOK') {
      return [BookFormat.EBOOK];
    }
    if (campaignFormats === BookFormat.BOTH && readerPref === 'AUDIOBOOK') {
      return [BookFormat.AUDIOBOOK];
    }
    if (campaignFormats === BookFormat.EBOOK && readerPref !== 'AUDIOBOOK') {
      return [BookFormat.EBOOK];
    }
    if (campaignFormats === BookFormat.AUDIOBOOK && readerPref !== 'EBOOK') {
      return [BookFormat.AUDIOBOOK];
    }

    return [];
  };

  const availableFormats = getAvailableFormats();
  const canApplyBasedOnFormat = availableFormats.length > 0;

  return (
    <Card className={`transition-all hover:scale-[1.02] hover:shadow-md ${className || ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="mb-1 text-lg">{campaign.title}</CardTitle>
            <CardDescription>
              {t('campaign.byAuthor', { author: campaign.authorName })}
            </CardDescription>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{campaign.genre}</Badge>
              <Badge variant="outline">{campaign.language}</Badge>
            </div>
          </div>
          {campaign.coverImageUrl && (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="h-28 w-20 rounded object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Synopsis Preview */}
        <p className="line-clamp-3 text-sm text-muted-foreground">{campaign.synopsis}</p>

        {/* NOTE: Campaign Stats (targetReviews, totalReviewsDelivered, reviewsPerWeek) removed
            Per requirement: "Readers cannot see total campaign scope or author information" */}

        {/* Queue Information */}
        {canApply && campaign.estimatedQueuePosition !== undefined && (
          <div className="rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              <Clock className="h-4 w-4" />
              {t('campaign.queuePosition')}: #{campaign.estimatedQueuePosition}
            </div>
            {campaign.estimatedWeek !== undefined && (
              <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                {t('campaign.estimatedWait')}: ~{campaign.estimatedWeek}{' '}
                {campaign.estimatedWeek === 1 ? t('campaign.week') : t('campaign.weeks')}
              </div>
            )}
          </div>
        )}

        {/* Format Selection */}
        {canApply && canApplyBasedOnFormat && availableFormats.length > 1 && (
          <div className="space-y-2">
            <Label>{t('campaign.selectFormat')}</Label>
            <Select
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as BookFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format} ({format === BookFormat.EBOOK ? '1 credit' : '2 credits'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Apply Button */}
        <div className="pt-2">
          {campaign.hasApplied ? (
            <Button variant="secondary" className="w-full" disabled>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('campaign.alreadyApplied')}
            </Button>
          ) : !canApplyBasedOnFormat ? (
            <Button variant="secondary" className="w-full" disabled>
              {t('campaign.formatNotAvailable')}
            </Button>
          ) : (
            <Button onClick={handleApply} disabled={isApplying} className="w-full">
              {isApplying ? t('campaign.applying') : t('campaign.applyToReview')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignsPage() {
  const t = useTranslations('reader.campaigns');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { campaigns, isLoadingCampaigns } = useAvailableCampaigns();
  const { profile, isLoadingProfile } = useReaderProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Redirect to profile creation if no profile
  if (!isLoadingProfile && !profile) {
    if (typeof window !== 'undefined') {
      window.location.href = `/${locale}/reader/profile`;
    }
    return null;
  }

  if (isLoadingCampaigns || isLoadingProfile) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64 animate-pulse" />
        <Skeleton className="h-40 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Extract unique genres and languages
  const genres = Array.from(new Set(campaigns?.map((c) => c.genre) || []));
  const languages = Array.from(new Set(campaigns?.map((c) => c.language) || []));

  // Filter campaigns
  const filteredCampaigns = campaigns?.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.synopsis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === 'all' || campaign.genre === selectedGenre;
    const matchesLanguage = selectedLanguage === 'all' || campaign.language === selectedLanguage;
    const matchesFormat =
      selectedFormat === 'all' ||
      campaign.availableFormats === selectedFormat ||
      campaign.availableFormats === BookFormat.BOTH;

    return matchesSearch && matchesGenre && matchesLanguage && matchesFormat;
  });

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex animate-fade-up items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="animate-fade-right"
              onClick={() => router.push(`/${locale}/reader`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToDashboard')}
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
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
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="animate-fade-up-fast space-y-2">
              <Label htmlFor="search">{t('filters.search')}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="animate-fade-up-light-slow space-y-2">
              <Label htmlFor="genre">{t('filters.genre')}</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger id="genre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allGenres')}</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language Filter */}
            <div className="animate-fade-up-medium-slow space-y-2">
              <Label htmlFor="language">{t('filters.language')}</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allLanguages')}</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Filter */}
            <div className="animate-fade-up-heavy-slow space-y-2">
              <Label htmlFor="format">{t('filters.format')}</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allFormats')}</SelectItem>
                  <SelectItem value={BookFormat.EBOOK}>Ebook</SelectItem>
                  <SelectItem value={BookFormat.AUDIOBOOK}>Audiobook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="animate-fade-up-slow text-sm text-muted-foreground">
        {t('resultsCount', { count: filteredCampaigns?.length || 0 })}
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns && filteredCampaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign, index) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              className={`animate-fade-up-${['fast', 'light-slow', 'medium-slow', 'heavy-slow', 'slow', 'extra-slow'][index % 6]}`}
            />
          ))}
        </div>
      ) : (
        <Card className="animate-fade-up-slow">
          <CardContent className="py-16 text-center">
            <BookOpen className="animate-bounce-slow mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">{t('emptyState.title')}</h3>
            <p className="text-muted-foreground">{t('emptyState.description')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
