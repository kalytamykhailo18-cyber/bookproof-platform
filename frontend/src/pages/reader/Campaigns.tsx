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
  SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Search, Filter, CheckCircle, ArrowLeft, Clock, Headphones, BookText, X, ArrowRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookFormat } from '@/lib/api/campaigns';
import { AvailableCampaign } from '@/lib/api/queue';
import { useTranslation } from 'react-i18next';
import { useNavigate,  useParams } from 'react-router-dom';

// Truncate synopsis to 200 characters
function truncateSynopsis(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Format icons component
function FormatIcons({ formats }: { formats: BookFormat }) {
  return (
    <div className="flex items-center gap-1">
      {(formats === BookFormat.EBOOK || formats === BookFormat.BOTH) && (
        <div className="flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200" title="Ebook">
          <BookText className="h-3 w-3" />
          <span>E</span>
        </div>
      )}
      {(formats === BookFormat.AUDIOBOOK || formats === BookFormat.BOTH) && (
        <div className="flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-200" title="Audiobook">
          <Headphones className="h-3 w-3" />
          <span>A</span>
        </div>
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  className,
  onOpenDetail }: {
  campaign: AvailableCampaign;
  className?: string;
  onOpenDetail: (campaign: AvailableCampaign) => void;
}) {
  const { t, i18n } = useTranslation('reader.campaigns');
  const { applyToCampaign, isApplying } = useMyAssignments();
  const { profile } = useReaderProfile();
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(BookFormat.EBOOK);

  const canApply = !campaign.hasApplied;

  const handleApply = () => {
    if (!canApply) return;

    applyToCampaign({
      bookId: campaign.id,
      formatPreference: selectedFormat });
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
    <Card
      className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${className || ''}`}
      onClick={() => onOpenDetail(campaign)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="mb-1 text-lg">{campaign.title}</CardTitle>
            <CardDescription>
              {t('campaign.byAuthor', { author: campaign.authorName })}
            </CardDescription>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{campaign.genre}</Badge>
              <Badge variant="outline">{campaign.language}</Badge>
              <FormatIcons formats={campaign.availableFormats} />
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
      <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Synopsis Preview (first 200 characters) */}
        <p className="text-sm text-muted-foreground">{truncateSynopsis(campaign.synopsis)}</p>

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
            <Button type="button" variant="secondary" className="w-full" disabled>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('campaign.alreadyApplied')}
            </Button>
          ) : !canApplyBasedOnFormat ? (
            <Button type="button" variant="secondary" className="w-full" disabled>
              {t('campaign.formatNotAvailable')}
            </Button>
          ) : (
            <Button type="button" onClick={handleApply} disabled={isApplying} className="w-full">
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : t('campaign.applyToReview')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Application Step Type
type ApplicationStep = 'details' | 'format' | 'confirm' | 'success';

// Book Detail Modal Component with 3-step application flow
function BookDetailModal({
  campaign,
  isOpen,
  onClose }: {
  campaign: AvailableCampaign | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation('reader.campaigns');
  const { applyToCampaign, isApplying, lastAppliedAssignment } = useMyAssignments();
  const { profile } = useReaderProfile();

  // Multi-step state
  const [step, setStep] = useState<ApplicationStep>('details');
  const [selectedFormat, setSelectedFormat] = useState<BookFormat>(BookFormat.EBOOK);

  // Confirmation checkboxes state (Step 2)
  const [confirmScheduledAccess, setConfirmScheduledAccess] = useState(false);
  const [confirm72Hours, setConfirm72Hours] = useState(false);
  const [confirmGenuineReview, setConfirmGenuineReview] = useState(false);

  // Reset state when modal opens/closes or campaign changes
  const resetState = () => {
    setStep('details');
    setConfirmScheduledAccess(false);
    setConfirm72Hours(false);
    setConfirmGenuineReview(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!campaign) return null;

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
  const canApply = !campaign.hasApplied;
  const canApplyBasedOnFormat = availableFormats.length > 0;
  const allConfirmationsChecked = confirmScheduledAccess && confirm72Hours && confirmGenuineReview;

  const handleStartApplication = () => {
    if (!canApply || !canApplyBasedOnFormat) return;
    // If only one format, auto-select and go to confirm step
    if (availableFormats.length === 1) {
      setSelectedFormat(availableFormats[0]);
      setStep('confirm');
    } else {
      setStep('format');
    }
  };

  const handleFormatSelected = () => {
    setStep('confirm');
  };

  const handleSubmitApplication = () => {
    if (!allConfirmationsChecked) return;

    applyToCampaign(
      {
        bookId: campaign.id,
        formatPreference: selectedFormat },
      {
        onSuccess: () => {
          setStep('success');
        } }
    );
  };

  // Step: Book Details View
  const renderDetailsStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{campaign.title}</DialogTitle>
        <DialogDescription>
          {t('campaign.byAuthor', { author: campaign.authorName })}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Cover Image */}
        <div className="flex justify-center">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="h-64 w-44 rounded-md object-cover shadow-md"
            />
          ) : (
            <div className="flex h-64 w-44 items-center justify-center rounded-md bg-muted">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="space-y-4">
          {/* Genre, Format, Language */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{campaign.genre}</Badge>
            <Badge variant="outline">{campaign.language}</Badge>
            <FormatIcons formats={campaign.availableFormats} />
          </div>

          {/* Synopsis (first 200 characters) */}
          <div>
            <h4 className="mb-1 text-sm font-medium">{t('modal.synopsis')}</h4>
            <p className="text-sm text-muted-foreground">
              {truncateSynopsis(campaign.synopsis)}
            </p>
          </div>

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

          {/* Apply Button */}
          <div className="pt-2">
            {campaign.hasApplied ? (
              <Button type="button" variant="secondary" className="w-full" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('campaign.alreadyApplied')}
              </Button>
            ) : !canApplyBasedOnFormat ? (
              <Button type="button" variant="secondary" className="w-full" disabled>
                {t('campaign.formatNotAvailable')}
              </Button>
            ) : (
              <Button type="button" onClick={handleStartApplication} className="w-full">
                {t('modal.applyToReviewThisBook')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Step 1: Format Selection (only if multiple formats available)
  const renderFormatStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>{t('apply.step1.title') || 'Step 1: Select Format'}</DialogTitle>
        <DialogDescription>
          {t('apply.step1.description') || 'Choose your preferred format for this book'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <RadioGroup value={selectedFormat} onValueChange={(val) => setSelectedFormat(val as BookFormat)}>
          {availableFormats.map((format) => (
            <div key={format} className="flex items-center space-x-3 rounded-md border p-4 hover:bg-muted/50">
              <RadioGroupItem value={format} id={format} />
              <Label htmlFor={format} className="flex flex-1 cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  {format === BookFormat.EBOOK ? (
                    <BookText className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Headphones className="h-5 w-5 text-purple-600" />
                  )}
                  <span className="font-medium">{format === BookFormat.EBOOK ? 'Ebook' : 'Audiobook'}</span>
                </div>
                <Badge variant="outline">
                  {format === BookFormat.EBOOK ? '1 credit' : '2 credits'}
                </Badge>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => setStep('details')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('apply.back') || 'Back'}
          </Button>
          <Button type="button" onClick={handleFormatSelected}>
            {t('apply.next') || 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  // Step 2: Confirmation Checkboxes
  const renderConfirmStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>{t('apply.step2.title') || 'Step 2: Confirm Understanding'}</DialogTitle>
        <DialogDescription>
          {t('apply.step2.description') || 'Please acknowledge the following before applying'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Selected format info */}
        <div className="flex items-center gap-2 rounded-md bg-muted p-3">
          <span className="text-sm text-muted-foreground">{t('apply.selectedFormat') || 'Selected format'}:</span>
          <Badge>
            {selectedFormat === BookFormat.EBOOK ? 'Ebook' : 'Audiobook'}
          </Badge>
        </div>

        {/* Confirmation checkboxes */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="confirm-scheduled"
              checked={confirmScheduledAccess}
              onCheckedChange={(checked) => setConfirmScheduledAccess(checked as boolean)}
            />
            <Label htmlFor="confirm-scheduled" className="cursor-pointer text-sm leading-relaxed">
              {t('apply.confirm1') || 'I understand I will receive book access on my scheduled date, not immediately'}
            </Label>
          </div>

          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="confirm-72hours"
              checked={confirm72Hours}
              onCheckedChange={(checked) => setConfirm72Hours(checked as boolean)}
            />
            <Label htmlFor="confirm-72hours" className="cursor-pointer text-sm leading-relaxed">
              {t('apply.confirm2') || 'I understand I will have 72 hours to complete my review after receiving access'}
            </Label>
          </div>

          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Checkbox
              id="confirm-genuine"
              checked={confirmGenuineReview}
              onCheckedChange={(checked) => setConfirmGenuineReview(checked as boolean)}
            />
            <Label htmlFor="confirm-genuine" className="cursor-pointer text-sm leading-relaxed">
              {t('apply.confirm3') || 'I understand I must post a genuine review on Amazon'}
            </Label>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(availableFormats.length > 1 ? 'format' : 'details')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('apply.back') || 'Back'}
          </Button>
          <Button
            type="button"
            onClick={handleSubmitApplication}
            disabled={!allConfirmationsChecked || isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('apply.submitting') || 'Submitting...'}
              </>
            ) : (
              <>
                {t('apply.submit') || 'Apply'}
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );

  // Step 3: Success Confirmation
  const renderSuccessStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          {t('apply.success.title') || 'Application Submitted!'}
        </DialogTitle>
        <DialogDescription>
          {t('apply.success.description') || 'Your application has been accepted'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
          <div className="mb-4">
            <BookOpen className="mx-auto h-12 w-12 text-green-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{campaign.title}</h3>

          <div className="mt-4 space-y-2">
            {lastAppliedAssignment?.queuePosition && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('apply.success.queuePosition') || 'Queue Position'}:</span>
                <span className="ml-2 font-bold text-green-700 dark:text-green-300">
                  #{lastAppliedAssignment.queuePosition}
                </span>
              </div>
            )}
            {lastAppliedAssignment?.scheduledWeek && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('apply.success.estimatedWeek') || 'Estimated Access'}:</span>
                <span className="ml-2 font-bold text-green-700 dark:text-green-300">
                  {t('apply.success.weekNumber', { week: lastAppliedAssignment.scheduledWeek }) || `Week ${lastAppliedAssignment.scheduledWeek}`}
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">{t('apply.success.status') || 'Status'}:</span>
              <Badge className="ml-2 bg-yellow-500">
                {t('apply.success.waitingForAccess') || 'Waiting for Access'}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('apply.success.notification') || 'You will receive an email notification when your access is granted.'}
        </p>

        <div className="flex justify-center pt-4">
          <Button type="button" onClick={handleClose}>
            {t('apply.success.done') || 'Done'}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        {step === 'details' && renderDetailsStep()}
        {step === 'format' && renderFormatStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}

export function CampaignsPage() {
  const { t, i18n } = useTranslation('reader.campaigns');
  const navigate = useNavigate();
  const { campaigns, isLoadingCampaigns } = useAvailableCampaigns();
  const { profile, isLoadingProfile } = useReaderProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Modal state for book detail
  const [selectedCampaign, setSelectedCampaign] = useState<AvailableCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenDetail = (campaign: AvailableCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  // Redirect to profile creation if no profile
  if (!isLoadingProfile && !profile) {
    navigate(`/reader/profile`);
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
              type="button"
              variant="ghost"
              size="sm"
              className="animate-fade-right"
              onClick={() => navigate(`/reader`)}
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
              onOpenDetail={handleOpenDetail}
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

      {/* Book Detail Modal */}
      <BookDetailModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
