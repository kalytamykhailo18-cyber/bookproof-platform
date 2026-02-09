import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicCampaignsApi, PublicCampaign, BookFormat, CampaignStatus } from '@/lib/api/campaigns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Headphones, Clock, FileText, ExternalLink, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';


/**
 * Public Campaign Landing Page - Milestone 2.2
 *
 * Per requirements: "Landing pages are publicly accessible (no login required to view)"
 *
 * Features:
 * - Public viewing without authentication
 * - Multi-language support (EN, PT, ES)
 * - Book cover prominent display
 * - Book details and synopsis
 * - Reader benefits explanation
 * - "Get Free Book" CTA with login-gated registration
 * - Campaign status indicator
 * - View tracking
 */
export function PublicCampaignPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('campaigns.public');
  const { user, isAuthenticated } = useAuth();

  const slug = params.slug as string;
  const lang = params.lang as string;

  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGetBookLoading, setIsGetBookLoading] = useState(false);
  const [isHomeLoading, setIsHomeLoading] = useState(false);
  const [loadingLang, setLoadingLang] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch campaign data
        const data = await publicCampaignsApi.getPublicCampaign(slug, lang);
        setCampaign(data);

        // Track view (fire and forget)
        publicCampaignsApi.trackView(slug, data.viewingLanguage).catch(err => {
          console.warn('Failed to track view:', err);
        });
      } catch (err: any) {
        console.error('Failed to load campaign:', err);
        setError(err.response?.data?.message || 'Campaign not found');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [slug, lang]);

  const handleGetFreeBook = () => {
    setIsGetBookLoading(true);
    if (isAuthenticated) {
      // Redirect to reader application page
      navigate(`/${lang}/reader/campaigns`);
    } else {
      // Redirect to login with return URL
      const returnUrl = `/${lang}/campaigns/${slug}/${lang}`;
      navigate(`/${lang}/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  };

  const handleLanguageSwitch = (newLang: string) => {
    setLoadingLang(newLang);
    navigate(`/${newLang}/campaigns/${slug}/${newLang.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                {t('notFound.title')}
              </h2>
              <p className="text-muted-foreground mb-4">
                {error || t('notFound.message')}
              </p>
              <Button type="button" onClick={() => {
                setIsHomeLoading(true);
                navigate(`/${lang}`);
              }} disabled={isHomeLoading}>
                {isHomeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('notFound.goHome')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatBadge = (format: BookFormat) => {
    if (format === BookFormat.EBOOK) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {t('formats.ebook')}
        </Badge>
      );
    } else if (format === BookFormat.AUDIOBOOK) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Headphones className="h-3 w-3" />
          {t('formats.audiobook')}
        </Badge>
      );
    } else {
      return (
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {t('formats.ebook')}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Headphones className="h-3 w-3" />
            {t('formats.audiobook')}
          </Badge>
        </div>
      );
    }
  };

  const statusBadge = (status: CampaignStatus, acceptingRegistrations: boolean) => {
    if (status === CampaignStatus.ACTIVE && acceptingRegistrations) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Active - Accepting Registrations
        </Badge>
      );
    } else if (status === CampaignStatus.ACTIVE && !acceptingRegistrations) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Active - Spots Filled
        </Badge>
      );
    } else if (status === CampaignStatus.PAUSED) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Paused
        </Badge>
      );
    } else if (status === CampaignStatus.COMPLETED) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header with language switcher */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => {
              if (isHomeLoading) return;
              setIsHomeLoading(true);
              navigate(`/${lang}`);
            }} className="text-xl font-bold flex items-center gap-2" disabled={isHomeLoading}>
              {isHomeLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              BookProof
            </button>

            {campaign.availableLanguages.length > 1 && (
              <div className="flex gap-2">
                {campaign.availableLanguages.map((l) => (
                  <Button
                    type="button"
                    key={l}
                    variant={l === campaign.viewingLanguage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLanguageSwitch(l)}
                    disabled={loadingLang === l}
                  >
                    {loadingLang === l && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    {l}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            {/* Left column: Book cover */}
            <div className="flex flex-col items-center space-y-4">
              {campaign.coverImageUrl ? (
                <div className="relative aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-lg shadow-2xl">
                  <Image
                    src={campaign.coverImageUrl}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex aspect-[2/3] w-full max-w-[300px] items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Format badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {formatBadge(campaign.availableFormats)}
              </div>

              {/* CTA Button */}
              <Button
                type="button"
                size="lg"
                className="w-full max-w-[300px]"
                onClick={handleGetFreeBook}
                disabled={!campaign.acceptingRegistrations || isGetBookLoading}
              >
                {isGetBookLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {campaign.acceptingRegistrations
                  ? (isAuthenticated ? t('cta.apply') : t('cta.getFreeBook'))
                  : 'Campaign Full'}
              </Button>

              {!isAuthenticated && campaign.acceptingRegistrations && (
                <p className="text-center text-sm text-muted-foreground">
                  {t('cta.loginRequired')}
                </p>
              )}

              {!campaign.acceptingRegistrations && (
                <p className="text-center text-sm text-amber-600 font-medium">
                  This campaign is not accepting new registrations
                </p>
              )}
            </div>

            {/* Right column: Book details */}
            <div className="space-y-6">
              {/* Title and author */}
              <div>
                <h1 className="mb-2 text-4xl font-bold tracking-tight">
                  {campaign.title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {t('byAuthor', { author: campaign.authorName })}
                </p>
              </div>

              {/* Campaign Status & Availability - Milestone 2.2 */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      {statusBadge(campaign.status, campaign.acceptingRegistrations)}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {campaign.spotsRemaining} of {campaign.totalSpots} spots remaining
                        </span>
                      </div>
                    </div>
                    {!campaign.acceptingRegistrations && campaign.spotsRemaining === 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-600">Campaign Full</p>
                        <p className="text-xs text-muted-foreground">All spots taken</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Series info */}
              {campaign.seriesName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>
                    {campaign.seriesName}
                    {campaign.seriesNumber && ` - Book ${campaign.seriesNumber}`}
                  </span>
                </div>
              )}

              {/* Genre and category */}
              <div className="flex flex-wrap gap-2">
                <Badge>{campaign.genre}</Badge>
                <Badge variant="outline">{campaign.category}</Badge>
              </div>

              {/* Book details */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {campaign.pageCount && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{campaign.pageCount} pages</span>
                  </div>
                )}
                {campaign.audiobookDurationMinutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(campaign.audiobookDurationMinutes / 60)}h{' '}
                      {campaign.audiobookDurationMinutes % 60}m
                    </span>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="mb-3 text-xl font-semibold">{t('synopsis')}</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {campaign.synopsis}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* How it works */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <h2 className="mb-3 text-xl font-semibold">{t('howItWorks.title')}</h2>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        1
                      </span>
                      <span>{t('howItWorks.step1')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        2
                      </span>
                      <span>{t('howItWorks.step2')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        3
                      </span>
                      <span>{t('howItWorks.step3')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        4
                      </span>
                      <span>{t('howItWorks.step4')}</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Reading instructions (if provided) */}
              {campaign.readingInstructions && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="mb-3 text-xl font-semibold">
                      {t('readingInstructions')}
                    </h2>
                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                      {campaign.readingInstructions}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Amazon link */}
              <div className="flex items-center justify-center">
                <span
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline"
                  onClick={() => window.open(campaign.amazonLink, '_blank', 'noopener,noreferrer')}
                >
                  {t('viewOnAmazon')}
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-semibold">{t('footer.title')}</h2>
          <p className="mb-6 text-muted-foreground">{t('footer.subtitle')}</p>
          <Button
            type="button"
            size="lg"
            onClick={handleGetFreeBook}
            disabled={!campaign.acceptingRegistrations || isGetBookLoading}
          >
            {isGetBookLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {campaign.acceptingRegistrations
              ? (isAuthenticated ? t('cta.apply') : t('cta.getFreeBook'))
              : 'Campaign Full'}
          </Button>
        </div>
      </div>
    </div>
  );
}
