'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampaign, useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { BookFormat, Language, CampaignStatus } from '@/lib/api/campaigns';

// Amazon domain validation helper
const isAmazonUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const amazonDomains = [
      'amazon.com',
      'amazon.co.uk',
      'amazon.de',
      'amazon.fr',
      'amazon.it',
      'amazon.es',
      'amazon.ca',
      'amazon.com.au',
      'amazon.co.jp',
      'amazon.in',
      'amazon.com.mx',
      'amazon.com.br',
      'amazon.nl',
      'amazon.ae',
      'amazon.sg',
    ];
    const hostname = parsedUrl.hostname.replace('www.', '');
    return amazonDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
};

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  authorName: z.string().min(1, 'Author name is required').max(255),
  asin: z
    .string()
    .min(10, 'ASIN must be exactly 10 characters')
    .max(10, 'ASIN must be exactly 10 characters')
    .regex(/^[A-Z0-9]{10}$/, 'ASIN must be 10 alphanumeric characters (e.g., B001234567)'),
  amazonLink: z
    .string()
    .url('Must be a valid URL')
    .refine(isAmazonUrl, 'Must be a valid Amazon URL (e.g., https://www.amazon.com/dp/B001234567)'),
  synopsis: z
    .string()
    .min(10, 'Synopsis must be at least 10 characters')
    .max(7500, 'Synopsis must not exceed 7500 characters (approximately 3 pages)'),
  language: z.nativeEnum(Language),
  genre: z.string().min(1, 'Genre is required').max(100),
  secondaryGenre: z.string().max(100).optional().nullable(), // Optional per Section 2.3
  category: z.string().min(1, 'Category is required').max(100),
  availableFormats: z.nativeEnum(BookFormat),
  targetReviews: z.number().min(10, 'Minimum 10 reviews required').max(1000, 'Maximum 1000 reviews'),
  amazonCouponCode: z.string().max(50).optional().nullable(),
  requireVerifiedPurchase: z.boolean().optional(),
  pageCount: z.number().min(1).optional().nullable(),
  wordCount: z.number().min(1).optional().nullable(),
  seriesName: z.string().max(255).optional().nullable(),
  seriesNumber: z.number().min(1).optional().nullable(),
  readingInstructions: z.string().max(2000, 'Reading instructions must not exceed 2000 characters').optional().nullable(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = ['basic', 'details', 'settings'] as const;
type Step = (typeof STEPS)[number];

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const locale = (params.locale as string) || 'en';
  const t = useTranslations('author.campaigns.edit');
  const tNew = useTranslations('author.campaigns.new');

  const { campaign, isLoading: isLoadingCampaign } = useCampaign(campaignId);
  const { updateCampaign, isUpdating } = useCampaigns();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      language: Language.EN,
      availableFormats: BookFormat.EBOOK,
      targetReviews: 25,
      requireVerifiedPurchase: false,
    },
  });

  // Load campaign data when available
  useEffect(() => {
    if (campaign) {
      reset({
        title: campaign.title,
        authorName: campaign.authorName,
        asin: campaign.asin,
        amazonLink: campaign.amazonLink,
        synopsis: campaign.synopsis,
        language: campaign.language,
        genre: campaign.genre,
        category: campaign.category,
        availableFormats: campaign.availableFormats,
        targetReviews: campaign.targetReviews,
        amazonCouponCode: campaign.amazonCouponCode ?? undefined,
        requireVerifiedPurchase: campaign.requireVerifiedPurchase ?? false,
        pageCount: campaign.pageCount ?? undefined,
        wordCount: campaign.wordCount ?? undefined,
        seriesName: campaign.seriesName ?? undefined,
        seriesNumber: campaign.seriesNumber ?? undefined,
        readingInstructions: campaign.readingInstructions ?? undefined,
      });
    }
  }, [campaign, reset]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoBack = currentStepIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    // Clean up optional fields - convert null to undefined
    const cleanData = {
      ...data,
      amazonCouponCode: data.amazonCouponCode || undefined,
      secondaryGenre: data.secondaryGenre || undefined, // Optional per Section 2.3
      pageCount: data.pageCount || undefined,
      wordCount: data.wordCount || undefined,
      seriesName: data.seriesName || undefined,
      seriesNumber: data.seriesNumber || undefined,
      readingInstructions: data.readingInstructions || undefined,
    };

    updateCampaign(
      { id: campaignId, data: cleanData },
      {
        onSuccess: () => {
          router.push(`/${locale}/author/campaigns/${campaignId}`);
        },
      },
    );
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>{t('notFound')}</p>
            <Button
              type="button"
              onClick={() => {
                setIsDashboardLoading(true);
                router.push(`/${locale}/author`);
              }}
              className="mt-4"
              disabled={isDashboardLoading}
            >
              {isDashboardLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only allow editing DRAFT campaigns
  if (campaign.status !== CampaignStatus.DRAFT) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p>{t('cannotEdit')}</p>
            <Button
              type="button"
              onClick={() => {
                setIsCampaignLoading(true);
                router.push(`/${locale}/author/campaigns/${campaignId}`);
              }}
              className="mt-4"
              disabled={isCampaignLoading}
            >
              {isCampaignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('backToCampaign')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setIsBackLoading(true);
            router.push(`/${locale}/author/campaigns/${campaignId}`);
          }}
          className="mb-4"
          disabled={isBackLoading}
        >
          {isBackLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {t('back')}
        </Button>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 animate-fade-up-fast">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className={`flex-1 ${index !== 0 ? 'ml-2' : ''}`}>
              <div
                className={`h-2 rounded-md ${
                  index <= currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
              <p
                className={`mt-2 text-sm ${
                  index <= currentStepIndex
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {tNew(`steps.${step}`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div>
        <Card className="animate-fade-up-slow">
          <CardHeader>
            <CardTitle>{tNew(`${currentStep}.title`)}</CardTitle>
            <CardDescription>{tNew(`${currentStep}.description`)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 'basic' && (
              <div className="space-y-4">
                <div className="animate-fade-up">
                  <Label htmlFor="title">{tNew('basic.bookTitle')}</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder={tNew('basic.bookTitlePlaceholder')}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="animate-fade-up-fast">
                  <Label htmlFor="authorName">{tNew('basic.authorName')}</Label>
                  <Input
                    id="authorName"
                    {...register('authorName')}
                    placeholder={tNew('basic.authorNamePlaceholder')}
                  />
                  {errors.authorName && (
                    <p className="mt-1 text-sm text-red-500">{errors.authorName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="animate-fade-up-light-slow">
                    <Label htmlFor="asin">{tNew('basic.asin')}</Label>
                    <Input
                      id="asin"
                      {...register('asin')}
                      placeholder={tNew('basic.asinPlaceholder')}
                    />
                    {errors.asin && (
                      <p className="mt-1 text-sm text-red-500">{errors.asin.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up-slow">
                    <Label htmlFor="language">{tNew('basic.language')}</Label>
                    <Select
                      value={watch('language')}
                      onValueChange={(value) => setValue('language', value as Language)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Language.EN}>English</SelectItem>
                        <SelectItem value={Language.PT}>Portuguese</SelectItem>
                        <SelectItem value={Language.ES}>Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="animate-fade-up-very-slow">
                  <Label htmlFor="amazonLink">{tNew('basic.amazonLink')}</Label>
                  <Input
                    id="amazonLink"
                    {...register('amazonLink')}
                    placeholder={tNew('basic.amazonLinkPlaceholder')}
                  />
                  {errors.amazonLink && (
                    <p className="mt-1 text-sm text-red-500">{errors.amazonLink.message}</p>
                  )}
                </div>

                <div className="animate-zoom-in">
                  <Label htmlFor="synopsis">{tNew('basic.synopsis')}</Label>
                  <Textarea
                    id="synopsis"
                    {...register('synopsis')}
                    placeholder={tNew('basic.synopsisPlaceholder')}
                    rows={6}
                    className="resize-none"
                  />
                  {errors.synopsis && (
                    <p className="mt-1 text-sm text-red-500">{errors.synopsis.message}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {watch('synopsis')?.length || 0} / 7500 characters (max ~3 pages)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Book Details */}
            {currentStep === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="animate-fade-up">
                    <Label htmlFor="genre">{tNew('details.genre') || 'Primary Genre'}</Label>
                    <Input
                      id="genre"
                      {...register('genre')}
                      placeholder={tNew('details.genrePlaceholder')}
                    />
                    {errors.genre && (
                      <p className="mt-1 text-sm text-red-500">{errors.genre.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up">
                    <Label htmlFor="secondaryGenre">{tNew('details.secondaryGenre') || 'Secondary Genre'}</Label>
                    <Input
                      id="secondaryGenre"
                      {...register('secondaryGenre')}
                      placeholder={tNew('details.secondaryGenrePlaceholder') || 'Optional secondary genre'}
                    />
                    {errors.secondaryGenre && (
                      <p className="mt-1 text-sm text-red-500">{errors.secondaryGenre.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up-fast">
                    <Label htmlFor="category">{tNew('details.category')}</Label>
                    <Input
                      id="category"
                      {...register('category')}
                      placeholder={tNew('details.categoryPlaceholder')}
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="animate-fade-up-light-slow">
                    <Label htmlFor="pageCount">{tNew('details.pageCount')}</Label>
                    <Input
                      id="pageCount"
                      type="number"
                      {...register('pageCount', { valueAsNumber: true })}
                      placeholder={tNew('details.pageCountPlaceholder')}
                    />
                  </div>

                  <div className="animate-fade-up-slow">
                    <Label htmlFor="wordCount">{tNew('details.wordCount')}</Label>
                    <Input
                      id="wordCount"
                      type="number"
                      {...register('wordCount', { valueAsNumber: true })}
                      placeholder={tNew('details.wordCountPlaceholder')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="animate-zoom-in">
                    <Label htmlFor="seriesName">{tNew('details.seriesName')}</Label>
                    <Input
                      id="seriesName"
                      {...register('seriesName')}
                      placeholder={tNew('details.seriesNamePlaceholder')}
                    />
                  </div>

                  <div className="animate-zoom-in-fast">
                    <Label htmlFor="seriesNumber">{tNew('details.seriesNumber')}</Label>
                    <Input
                      id="seriesNumber"
                      type="number"
                      {...register('seriesNumber', { valueAsNumber: true })}
                      placeholder={tNew('details.seriesNumberPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Campaign Settings */}
            {currentStep === 'settings' && (
              <div className="space-y-4">
                <div className="animate-fade-up">
                  <Label htmlFor="availableFormats">{tNew('settings.format')}</Label>
                  <Select
                    value={watch('availableFormats')}
                    onValueChange={(value) => setValue('availableFormats', value as BookFormat)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BookFormat.EBOOK}>
                        {tNew('settings.formatEbook')}
                      </SelectItem>
                      <SelectItem value={BookFormat.AUDIOBOOK}>
                        {tNew('settings.formatAudiobook')}
                      </SelectItem>
                      <SelectItem value={BookFormat.BOTH}>{tNew('settings.formatBoth')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="animate-fade-up-fast">
                  <Label htmlFor="targetReviews">{tNew('settings.targetReviews')}</Label>
                  <Input
                    id="targetReviews"
                    type="number"
                    {...register('targetReviews', { valueAsNumber: true })}
                    min={10}
                    max={1000}
                  />
                  {errors.targetReviews && (
                    <p className="mt-1 text-sm text-red-500">{errors.targetReviews.message}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tNew('settings.targetReviewsHelp')}
                  </p>
                </div>

                <div className="animate-fade-up-light-slow">
                  <Label htmlFor="amazonCouponCode">
                    {tNew('settings.couponCode')} ({tNew('settings.optional')})
                  </Label>
                  <Input
                    id="amazonCouponCode"
                    {...register('amazonCouponCode')}
                    placeholder={tNew('settings.couponCodePlaceholder')}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tNew('settings.couponCodeHelp')}
                  </p>
                </div>

                <div className="animate-fade-up-slow">
                  <Label htmlFor="readingInstructions">
                    Reading Instructions ({tNew('settings.optional')})
                  </Label>
                  <Textarea
                    id="readingInstructions"
                    {...register('readingInstructions')}
                    placeholder="Special instructions for readers (e.g., specific chapters to focus on, reading order for series, etc.)"
                    rows={4}
                    className="resize-none"
                  />
                  {errors.readingInstructions && (
                    <p className="mt-1 text-sm text-red-500">{errors.readingInstructions.message}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {watch('readingInstructions')?.length || 0} / 2000 characters
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex animate-fade-up justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack || isUpdating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tNew('previous')}
          </Button>

          {canGoNext ? (
            <Button type="button" onClick={handleNext}>
              {tNew('next')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleFormSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('save')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
