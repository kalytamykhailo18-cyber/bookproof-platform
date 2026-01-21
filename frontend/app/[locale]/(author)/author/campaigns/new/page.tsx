'use client';

import { useState, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampaigns, useUploadProgress } from '@/hooks/useCampaigns';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Book,
  Check,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { BookFormat, Language } from '@/lib/api/campaigns';
import { useRouter } from 'next/navigation';

// Amazon domain validation helper - must match backend validation domains
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
      'amazon.se',
      'amazon.pl',
      'amazon.com.tr',
      'amazon.sa',
      'amazon.eg',
    ];
    const hostname = parsedUrl.hostname.replace('www.', '');
    return amazonDomains.some((domain) => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
};

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  subtitle: z.string().max(255).optional(),
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
  category: z.string().min(1, 'Category is required').max(100),
  availableFormats: z.nativeEnum(BookFormat),
  creditsToAllocate: z.number().min(10, 'Minimum 10 credits required'),
  ebookCredits: z.number().min(0).optional(),
  audiobookCredits: z.number().min(0).optional(),
  amazonCouponCode: z.string().max(50).optional(),
  pageCount: z.number().min(1).optional(),
  wordCount: z.number().min(1).optional(),
  seriesName: z.string().max(255).optional(),
  seriesNumber: z.number().min(1).optional(),
  // Landing page fields - Milestone 2.2
  landingPageEnabled: z.boolean().optional(),
  landingPageLanguages: z.array(z.nativeEnum(Language)).optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  titleEN: z.string().max(255).optional().or(z.literal('')),
  titlePT: z.string().max(255).optional().or(z.literal('')),
  titleES: z.string().max(255).optional().or(z.literal('')),
  synopsisEN: z.string().max(7500).optional().or(z.literal('')),
  synopsisPT: z.string().max(7500).optional().or(z.literal('')),
  synopsisES: z.string().max(7500).optional().or(z.literal('')),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const STEPS = ['bookInfo', 'files', 'landingPage', 'credits', 'review'] as const;
type Step = (typeof STEPS)[number];

export default function NewCampaignPage() {
  const t = useTranslations('author.campaigns.new');
  const router = useRouter();
  const { createCampaign, isCreating } = useCampaigns();
  const { creditBalance } = useCredits();
  const { uploadProgress } = useUploadProgress();
  const [currentStep, setCurrentStep] = useState<Step>('bookInfo');

  // File state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [audiobookFile, setAudiobookFile] = useState<File | null>(null);

  // Refs for file inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const ebookInputRef = useRef<HTMLInputElement>(null);
  const audiobookInputRef = useRef<HTMLInputElement>(null);

  // Confirmation checkboxes for review step
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmCredits, setConfirmCredits] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      language: Language.EN,
      availableFormats: BookFormat.EBOOK,
      creditsToAllocate: 10,
      ebookCredits: 10,
      audiobookCredits: 0,
      landingPageEnabled: false,
      landingPageLanguages: [],
      slug: '',
      titleEN: '',
      titlePT: '',
      titleES: '',
      synopsisEN: '',
      synopsisPT: '',
      synopsisES: '',
    },
  });

  const availableCredits = creditBalance?.availableCredits || 0;
  const selectedFormat = watch('availableFormats');
  const creditsToAllocate = watch('creditsToAllocate') || 0;
  const ebookCredits = watch('ebookCredits') || 0;
  const audiobookCredits = watch('audiobookCredits') || 0;

  // Calculate estimated duration
  const estimatedWeeks = useMemo(() => {
    const target = creditsToAllocate;
    if (target < 10) return 0;
    let reviewsPerWeek: number;
    if (target <= 25) reviewsPerWeek = Math.ceil(target / 5);
    else if (target <= 50) reviewsPerWeek = Math.ceil(target / 6);
    else if (target <= 100) reviewsPerWeek = Math.ceil(target / 6);
    else if (target <= 200) reviewsPerWeek = Math.ceil(target / 9);
    else if (target <= 500) reviewsPerWeek = Math.ceil(target / 22);
    else reviewsPerWeek = Math.ceil(target / 45);
    return Math.ceil(target / reviewsPerWeek);
  }, [creditsToAllocate]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const canGoNext = currentStepIndex < STEPS.length - 1;
  const canGoBack = currentStepIndex > 0;

  const handleNext = async () => {
    // Validate current step before proceeding
    if (currentStep === 'bookInfo') {
      const fieldsToValidate: (keyof CampaignFormData)[] = [
        'title',
        'authorName',
        'asin',
        'amazonLink',
        'synopsis',
        'language',
        'genre',
        'category',
      ];
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    } else if (currentStep === 'landingPage') {
      // Validate landing page configuration
      if (watch('landingPageEnabled')) {
        const languages = watch('landingPageLanguages');
        if (!languages || languages.length === 0) {
          return; // At least one language required
        }
      }
      // Validate slug format if provided
      const slug = watch('slug');
      if (slug && slug.trim() !== '') {
        const isValid = await trigger('slug');
        if (!isValid) return;
      }
    } else if (currentStep === 'credits') {
      const isValid = await trigger(['creditsToAllocate', 'ebookCredits', 'audiobookCredits']);
      if (!isValid) return;

      // Validate credit split for BOTH format
      if (selectedFormat === BookFormat.BOTH) {
        if (ebookCredits + audiobookCredits !== creditsToAllocate) {
          return;
        }
      }
    }

    if (canGoNext) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEbookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEbookFile(file);
    }
  };

  const handleAudiobookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudiobookFile(file);
    }
  };

  const handleFormSubmit = async () => {
    // Check confirmations
    if (!confirmInfo || !confirmCredits || !confirmTerms) {
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    // Create campaign with credits allocation and landing page data
    createCampaign({
      title: data.title,
      authorName: data.authorName,
      asin: data.asin,
      amazonLink: data.amazonLink,
      synopsis: data.synopsis,
      language: data.language,
      genre: data.genre,
      category: data.category,
      availableFormats: data.availableFormats,
      targetReviews: data.creditsToAllocate,
      amazonCouponCode: data.amazonCouponCode,
      pageCount: data.pageCount,
      wordCount: data.wordCount,
      seriesName: data.seriesName,
      seriesNumber: data.seriesNumber,
      // Landing page fields - Milestone 2.2
      landingPageEnabled: data.landingPageEnabled,
      landingPageLanguages: data.landingPageLanguages,
      slug: data.slug || undefined,
      titleEN: data.titleEN || undefined,
      titlePT: data.titlePT || undefined,
      titleES: data.titleES || undefined,
      synopsisEN: data.synopsisEN || undefined,
      synopsisPT: data.synopsisPT || undefined,
      synopsisES: data.synopsisES || undefined,
    });
  };

  const handleCreditChange = (value: number) => {
    setValue('creditsToAllocate', value);
    // Auto-split for BOTH format
    if (selectedFormat === BookFormat.BOTH) {
      const half = Math.floor(value / 2);
      setValue('ebookCredits', half);
      setValue('audiobookCredits', value - half);
    } else if (selectedFormat === BookFormat.EBOOK) {
      setValue('ebookCredits', value);
      setValue('audiobookCredits', 0);
    } else {
      setValue('ebookCredits', 0);
      setValue('audiobookCredits', value);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back') || 'Back'}
        </Button>
        <h1 className="text-3xl font-bold">{t('title') || 'Create New Campaign'}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle') || 'Set up your book review campaign'}
        </p>
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
                {t(`steps.${step}`) || step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div>
        <Card className="animate-fade-up-slow">
          <CardHeader>
            <CardTitle>{t(`${currentStep}.title`) || currentStep}</CardTitle>
            <CardDescription>{t(`${currentStep}.description`) || ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Book Information */}
            {currentStep === 'bookInfo' && (
              <div className="space-y-4">
                <div className="animate-fade-up">
                  <Label htmlFor="title">{t('bookInfo.bookTitle') || 'Book Title'} *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder={t('bookInfo.bookTitlePlaceholder') || 'Enter book title'}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="animate-fade-up-fast">
                  <Label htmlFor="subtitle">
                    {t('bookInfo.subtitle') || 'Subtitle'} ({t('optional') || 'Optional'})
                  </Label>
                  <Input
                    id="subtitle"
                    {...register('subtitle')}
                    placeholder={t('bookInfo.subtitlePlaceholder') || 'Enter subtitle (optional)'}
                  />
                </div>

                <div className="animate-fade-up-light-slow">
                  <Label htmlFor="authorName">{t('bookInfo.authorName') || 'Author Name'} *</Label>
                  <Input
                    id="authorName"
                    {...register('authorName')}
                    placeholder={
                      t('bookInfo.authorNamePlaceholder') || 'Author name as appears on book'
                    }
                  />
                  {errors.authorName && (
                    <p className="mt-1 text-sm text-red-500">{errors.authorName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="animate-fade-up-slow">
                    <Label htmlFor="asin">{t('bookInfo.asin') || 'Amazon ASIN'} *</Label>
                    <Input id="asin" {...register('asin')} placeholder="B001234567" />
                    {errors.asin && (
                      <p className="mt-1 text-sm text-red-500">{errors.asin.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-up-very-slow">
                    <Label htmlFor="language">{t('bookInfo.language') || 'Language'} *</Label>
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

                <div className="animate-zoom-in">
                  <Label htmlFor="amazonLink">
                    {t('bookInfo.amazonLink') || 'Amazon Product Link'} *
                  </Label>
                  <Input
                    id="amazonLink"
                    {...register('amazonLink')}
                    placeholder="https://www.amazon.com/dp/B001234567"
                  />
                  {errors.amazonLink && (
                    <p className="mt-1 text-sm text-red-500">{errors.amazonLink.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="animate-zoom-in-fast">
                    <Label htmlFor="genre">{t('bookInfo.genre') || 'Genre'} *</Label>
                    <Input
                      id="genre"
                      {...register('genre')}
                      placeholder={
                        t('bookInfo.genrePlaceholder') || 'e.g., Fantasy, Romance, Thriller'
                      }
                    />
                    {errors.genre && (
                      <p className="mt-1 text-sm text-red-500">{errors.genre.message}</p>
                    )}
                  </div>

                  <div className="animate-fade-left">
                    <Label htmlFor="category">{t('bookInfo.category') || 'Category'} *</Label>
                    <Input
                      id="category"
                      {...register('category')}
                      placeholder={
                        t('bookInfo.categoryPlaceholder') || 'e.g., Fiction, Non-Fiction'
                      }
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                <div className="animate-fade-left-fast">
                  <Label htmlFor="synopsis">{t('bookInfo.synopsis') || 'Book Synopsis'} *</Label>
                  <Textarea
                    id="synopsis"
                    {...register('synopsis')}
                    placeholder={
                      t('bookInfo.synopsisPlaceholder') ||
                      'Enter book description/synopsis (max 3 pages)'
                    }
                    rows={6}
                    className="resize-none"
                  />
                  {errors.synopsis && (
                    <p className="mt-1 text-sm text-red-500">{errors.synopsis.message}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {watch('synopsis')?.length || 0} / 7500{' '}
                    {t('bookInfo.characters') || 'characters'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Files Upload */}
            {currentStep === 'files' && (
              <div className="space-y-6">
                {/* Format Selection */}
                <div className="animate-fade-up">
                  <Label htmlFor="availableFormats">{t('files.format') || 'Book Format'} *</Label>
                  <Select
                    value={watch('availableFormats')}
                    onValueChange={(value) => setValue('availableFormats', value as BookFormat)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BookFormat.EBOOK}>
                        <div className="flex items-center">
                          <Book className="mr-2 h-4 w-4" />
                          {t('files.formatEbook') || 'Ebook Only'}
                        </div>
                      </SelectItem>
                      <SelectItem value={BookFormat.AUDIOBOOK}>
                        <div className="flex items-center">
                          <Music className="mr-2 h-4 w-4" />
                          {t('files.formatAudiobook') || 'Audiobook Only'}
                        </div>
                      </SelectItem>
                      <SelectItem value={BookFormat.BOTH}>
                        <div className="flex items-center">
                          <Book className="mr-2 h-4 w-4" />
                          <Music className="mr-2 h-4 w-4" />
                          {t('files.formatBoth') || 'Both Ebook & Audiobook'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover Image Upload */}
                <div className="animate-fade-up-fast">
                  <Label>{t('files.coverImage') || 'Cover Image'}</Label>
                  <div
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <div className="relative">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="h-48 w-auto rounded-md object-cover"
                        />
                        <Badge className="absolute -right-2 -top-2 bg-green-500">
                          <Check className="h-3 w-3" />
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                          {t('files.clickToUpload') || 'Click to upload cover image'}
                        </p>
                        <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                  {coverFile && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {coverFile.name} ({formatBytes(coverFile.size)})
                    </p>
                  )}
                </div>

                {/* Ebook File Upload */}
                {(selectedFormat === BookFormat.EBOOK || selectedFormat === BookFormat.BOTH) && (
                  <div className="animate-fade-up-light-slow">
                    <Label>{t('files.ebookFile') || 'Ebook File'} *</Label>
                    <div
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary"
                      onClick={() => ebookInputRef.current?.click()}
                    >
                      {ebookFile ? (
                        <div className="flex items-center gap-3">
                          <FileText className="h-10 w-10 text-primary" />
                          <div>
                            <p className="font-medium">{ebookFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatBytes(ebookFile.size)}
                            </p>
                          </div>
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3" />
                          </Badge>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-2 h-12 w-12 text-gray-400" />
                          <p className="text-sm text-muted-foreground">
                            {t('files.clickToUploadEbook') || 'Click to upload ebook file'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            EPUB, PDF, MOBI (max 50MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={ebookInputRef}
                      type="file"
                      accept=".epub,.pdf,.mobi"
                      className="hidden"
                      onChange={handleEbookChange}
                    />
                    {uploadProgress.ebook !== null && (
                      <Progress value={uploadProgress.ebook} className="mt-2" />
                    )}
                  </div>
                )}

                {/* Audiobook File Upload */}
                {(selectedFormat === BookFormat.AUDIOBOOK ||
                  selectedFormat === BookFormat.BOTH) && (
                  <div className="animate-fade-up-slow">
                    <Label>{t('files.audiobookFile') || 'Audiobook File'} *</Label>
                    <div
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary"
                      onClick={() => audiobookInputRef.current?.click()}
                    >
                      {audiobookFile ? (
                        <div className="flex items-center gap-3">
                          <Music className="h-10 w-10 text-primary" />
                          <div>
                            <p className="font-medium">{audiobookFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatBytes(audiobookFile.size)}
                            </p>
                          </div>
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3" />
                          </Badge>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-2 h-12 w-12 text-gray-400" />
                          <p className="text-sm text-muted-foreground">
                            {t('files.clickToUploadAudiobook') || 'Click to upload audiobook file'}
                          </p>
                          <p className="text-xs text-muted-foreground">MP3 (max 500MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={audiobookInputRef}
                      type="file"
                      accept=".mp3"
                      className="hidden"
                      onChange={handleAudiobookChange}
                    />
                    {uploadProgress.audiobook !== null && (
                      <Progress value={uploadProgress.audiobook} className="mt-2" />
                    )}
                  </div>
                )}

                {/* Amazon Coupon Code */}
                <div className="animate-fade-up-very-slow">
                  <Label htmlFor="amazonCouponCode">
                    {t('files.couponCode') || 'Amazon Coupon Code'} ({t('optional') || 'Optional'})
                  </Label>
                  <Input
                    id="amazonCouponCode"
                    {...register('amazonCouponCode')}
                    placeholder={
                      t('files.couponCodePlaceholder') || 'Enter Amazon coupon code for readers'
                    }
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('files.couponCodeHelp') ||
                      'If you have a coupon code for readers to get the book at a discount'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Landing Page Configuration */}
            {currentStep === 'landingPage' && (
              <div className="space-y-6">
                {/* Enable Landing Page */}
                <div className="animate-fade-up">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="landingPageEnabled"
                      checked={watch('landingPageEnabled')}
                      onCheckedChange={(checked) => setValue('landingPageEnabled', checked === true)}
                    />
                    <div>
                      <Label htmlFor="landingPageEnabled" className="cursor-pointer font-medium">
                        Enable Public Landing Page
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow readers to discover your campaign through a public shareable link
                      </p>
                    </div>
                  </div>
                </div>

                {watch('landingPageEnabled') && (
                  <>
                    {/* Language Selection */}
                    <div className="animate-fade-up-fast space-y-3">
                      <Label>Select Languages for Landing Page *</Label>
                      <div className="flex flex-wrap gap-3">
                        {[Language.EN, Language.PT, Language.ES].map((lang) => (
                          <div key={lang} className="flex items-center space-x-2">
                            <Checkbox
                              id={`lang-${lang}`}
                              checked={watch('landingPageLanguages')?.includes(lang)}
                              onCheckedChange={(checked) => {
                                const currentLangs = watch('landingPageLanguages') || [];
                                if (checked) {
                                  setValue('landingPageLanguages', [...currentLangs, lang]);
                                } else {
                                  setValue(
                                    'landingPageLanguages',
                                    currentLangs.filter((l) => l !== lang),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                              {lang === Language.EN && 'English'}
                              {lang === Language.PT && 'Portuguese'}
                              {lang === Language.ES && 'Spanish'}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {watch('landingPageLanguages')?.length === 0 && watch('landingPageEnabled') && (
                        <p className="text-sm text-red-500">
                          Please select at least one language
                        </p>
                      )}
                    </div>

                    {/* Custom Slug (Optional) */}
                    <div className="animate-fade-up-light-slow">
                      <Label htmlFor="slug">
                        Custom URL Slug (Optional)
                      </Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        placeholder="my-awesome-book"
                      />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        Leave empty to auto-generate from title. Only lowercase letters, numbers, and hyphens.
                      </p>
                    </div>

                    {/* Language-specific titles */}
                    {watch('landingPageLanguages')?.includes(Language.EN) && (
                      <div className="animate-fade-up-slow">
                        <Label htmlFor="titleEN">
                          English Title (Optional)
                        </Label>
                        <Input
                          id="titleEN"
                          {...register('titleEN')}
                          placeholder="Leave empty to use main title"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Only fill if different from main title
                        </p>
                      </div>
                    )}

                    {watch('landingPageLanguages')?.includes(Language.PT) && (
                      <div className="animate-fade-up-slow">
                        <Label htmlFor="titlePT">
                          Portuguese Title (Optional)
                        </Label>
                        <Input
                          id="titlePT"
                          {...register('titlePT')}
                          placeholder="Título em português"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Only fill if different from main title
                        </p>
                      </div>
                    )}

                    {watch('landingPageLanguages')?.includes(Language.ES) && (
                      <div className="animate-fade-up-slow">
                        <Label htmlFor="titleES">
                          Spanish Title (Optional)
                        </Label>
                        <Input
                          id="titleES"
                          {...register('titleES')}
                          placeholder="Título en español"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Only fill if different from main title
                        </p>
                      </div>
                    )}

                    {/* Language-specific synopsis */}
                    {watch('landingPageLanguages')?.includes(Language.EN) && (
                      <div className="animate-fade-up-very-slow">
                        <Label htmlFor="synopsisEN">
                          English Synopsis (Optional)
                        </Label>
                        <Textarea
                          id="synopsisEN"
                          {...register('synopsisEN')}
                          placeholder="Leave empty to use main synopsis"
                          rows={4}
                          className="resize-none"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          {watch('synopsisEN')?.length || 0} / 7500 characters
                        </p>
                      </div>
                    )}

                    {watch('landingPageLanguages')?.includes(Language.PT) && (
                      <div className="animate-fade-up-very-slow">
                        <Label htmlFor="synopsisPT">
                          Portuguese Synopsis (Optional)
                        </Label>
                        <Textarea
                          id="synopsisPT"
                          {...register('synopsisPT')}
                          placeholder="Sinopse em português"
                          rows={4}
                          className="resize-none"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          {watch('synopsisPT')?.length || 0} / 7500 characters
                        </p>
                      </div>
                    )}

                    {watch('landingPageLanguages')?.includes(Language.ES) && (
                      <div className="animate-fade-up-very-slow">
                        <Label htmlFor="synopsisES">
                          Spanish Synopsis (Optional)
                        </Label>
                        <Textarea
                          id="synopsisES"
                          {...register('synopsisES')}
                          placeholder="Sinopsis en español"
                          rows={4}
                          className="resize-none"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          {watch('synopsisES')?.length || 0} / 7500 characters
                        </p>
                      </div>
                    )}

                    {/* Public URL Preview */}
                    {watch('landingPageLanguages') && watch('landingPageLanguages')!.length > 0 && (
                      <div className="animate-zoom-in rounded-lg bg-primary/10 p-4">
                        <h4 className="mb-2 font-medium">Public Landing Page URLs</h4>
                        <p className="mb-3 text-sm text-muted-foreground">
                          These URLs will be generated for your campaign:
                        </p>
                        <div className="space-y-2">
                          {watch('landingPageLanguages')!.map((lang) => {
                            const slugPreview = watch('slug') || 'auto-generated-slug';
                            const langCode = lang.toLowerCase();
                            const url = `${window.location.origin}/${langCode}/campaigns/${slugPreview}`;
                            return (
                              <div key={lang} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">{lang}</Badge>
                                <code className="flex-1 rounded bg-muted px-2 py-1">
                                  {url}
                                </code>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 4: Credit Allocation */}
            {currentStep === 'credits' && (
              <div className="space-y-6">
                {/* Available Credits */}
                <div className="animate-fade-up rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {t('credits.availableCredits') || 'Available Credits'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{availableCredits}</span>
                  </div>
                </div>

                {/* Credits to Allocate */}
                <div className="animate-fade-up-fast">
                  <Label htmlFor="creditsToAllocate">
                    {t('credits.allocate') || 'Credits to Allocate'} *
                  </Label>
                  <Input
                    id="creditsToAllocate"
                    type="number"
                    min={10}
                    max={availableCredits}
                    value={creditsToAllocate}
                    onChange={(e) => handleCreditChange(parseInt(e.target.value) || 0)}
                  />
                  {errors.creditsToAllocate && (
                    <p className="mt-1 text-sm text-red-500">{errors.creditsToAllocate.message}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('credits.minimumRequired') || 'Minimum 10 credits required'} •{' '}
                    {selectedFormat === BookFormat.AUDIOBOOK
                      ? '2 credits = 1 audiobook review'
                      : selectedFormat === BookFormat.BOTH
                        ? '1 credit = 1 ebook review, 2 credits = 1 audiobook review'
                        : '1 credit = 1 ebook review'}
                  </p>
                </div>

                {/* Credit Split for BOTH format */}
                {selectedFormat === BookFormat.BOTH && (
                  <div className="animate-fade-up-light-slow space-y-4 rounded-lg border p-4">
                    <h4 className="font-medium">
                      {t('credits.splitCredits') || 'Split Credits Between Formats'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Note: Ebook reviews cost 1 credit each. Audiobook reviews cost 2 credits each.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ebookCredits">
                          <Book className="mr-1 inline h-4 w-4" />
                          {t('credits.ebookCredits') || 'Credits for Ebook'}
                        </Label>
                        <Input
                          id="ebookCredits"
                          type="number"
                          min={0}
                          max={creditsToAllocate}
                          value={ebookCredits}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setValue('ebookCredits', value);
                            setValue('audiobookCredits', creditsToAllocate - value);
                          }}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          = {ebookCredits} ebook reviews
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="audiobookCredits">
                          <Music className="mr-1 inline h-4 w-4" />
                          {t('credits.audiobookCredits') || 'Credits for Audiobook'}
                        </Label>
                        <Input
                          id="audiobookCredits"
                          type="number"
                          min={0}
                          step={2}
                          max={creditsToAllocate}
                          value={audiobookCredits}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setValue('audiobookCredits', value);
                            setValue('ebookCredits', creditsToAllocate - value);
                          }}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          = {Math.floor(audiobookCredits / 2)} audiobook reviews (2 credits each)
                        </p>
                      </div>
                    </div>
                    {ebookCredits + audiobookCredits !== creditsToAllocate && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {t('credits.splitError') || 'Total must equal allocated credits'}
                      </div>
                    )}
                    {audiobookCredits % 2 !== 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        Audiobook credits should be even (2 credits per review). You have 1 credit that won't be used for audiobook reviews.
                      </div>
                    )}
                  </div>
                )}

                {/* Estimated Duration */}
                {creditsToAllocate >= 10 && (
                  <div className="animate-fade-up-slow rounded-lg bg-primary/10 p-4">
                    <h4 className="font-medium">
                      {t('credits.estimatedDuration') || 'Estimated Campaign Duration'}
                    </h4>
                    <p className="mt-1 text-2xl font-bold">
                      {estimatedWeeks} {t('credits.weeks') || 'weeks'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('credits.durationNote') ||
                        'Based on our natural distribution algorithm for optimal review pacing'}
                    </p>
                  </div>
                )}

                {/* Insufficient credits warning */}
                {creditsToAllocate > availableCredits && (
                  <div className="flex animate-zoom-in items-center gap-2 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>
                      {t('credits.insufficientCredits') ||
                        'You do not have enough credits. Please purchase more credits first.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review & Confirm */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                {/* Book Information Summary */}
                <div className="animate-fade-up rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">
                    {t('review.bookInfo') || 'Book Information'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('review.title') || 'Title'}:</span>
                      <p className="font-medium">{watch('title')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('review.author') || 'Author'}:
                      </span>
                      <p className="font-medium">{watch('authorName')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('review.asin') || 'ASIN'}:</span>
                      <p className="font-medium">{watch('asin')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('review.language') || 'Language'}:
                      </span>
                      <p className="font-medium">{watch('language')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('review.genre') || 'Genre'}:</span>
                      <p className="font-medium">{watch('genre')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('review.format') || 'Format'}:
                      </span>
                      <p className="font-medium">{watch('availableFormats')}</p>
                    </div>
                  </div>
                </div>

                {/* Files Summary */}
                <div className="animate-fade-up-fast rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">{t('review.files') || 'Uploaded Files'}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>{t('review.cover') || 'Cover'}:</span>
                      <span className={coverFile ? 'text-green-600' : 'text-muted-foreground'}>
                        {coverFile ? coverFile.name : t('review.notUploaded') || 'Not uploaded'}
                      </span>
                    </div>
                    {(selectedFormat === BookFormat.EBOOK ||
                      selectedFormat === BookFormat.BOTH) && (
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        <span>{t('review.ebook') || 'Ebook'}:</span>
                        <span className={ebookFile ? 'text-green-600' : 'text-muted-foreground'}>
                          {ebookFile ? ebookFile.name : t('review.notUploaded') || 'Not uploaded'}
                        </span>
                      </div>
                    )}
                    {(selectedFormat === BookFormat.AUDIOBOOK ||
                      selectedFormat === BookFormat.BOTH) && (
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span>{t('review.audiobook') || 'Audiobook'}:</span>
                        <span
                          className={audiobookFile ? 'text-green-600' : 'text-muted-foreground'}
                        >
                          {audiobookFile
                            ? audiobookFile.name
                            : t('review.notUploaded') || 'Not uploaded'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credits Summary */}
                <div className="animate-fade-up-light-slow rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">
                    {t('review.credits') || 'Credit Allocation'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('review.totalCredits') || 'Total Credits'}:</span>
                      <span className="font-bold">{creditsToAllocate}</span>
                    </div>
                    {selectedFormat === BookFormat.EBOOK && (
                      <div className="flex justify-between">
                        <span>Ebook Reviews:</span>
                        <span>{creditsToAllocate} reviews (1 credit each)</span>
                      </div>
                    )}
                    {selectedFormat === BookFormat.AUDIOBOOK && (
                      <div className="flex justify-between">
                        <span>Audiobook Reviews:</span>
                        <span>{Math.floor(creditsToAllocate / 2)} reviews (2 credits each)</span>
                      </div>
                    )}
                    {selectedFormat === BookFormat.BOTH && (
                      <>
                        <div className="flex justify-between">
                          <span>Ebook Reviews:</span>
                          <span>{ebookCredits} reviews ({ebookCredits} credits)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Audiobook Reviews:</span>
                          <span>{Math.floor(audiobookCredits / 2)} reviews ({audiobookCredits} credits)</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Total Reviews:</span>
                          <span>{ebookCredits + Math.floor(audiobookCredits / 2)} reviews</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span>{t('review.estimatedDuration') || 'Estimated Duration'}:</span>
                      <span>
                        {estimatedWeeks} {t('credits.weeks') || 'weeks'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkboxes */}
                <div className="animate-fade-up-slow space-y-4">
                  <h4 className="font-semibold">
                    {t('review.confirmations') || 'Please confirm the following'}
                  </h4>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirmInfo"
                      checked={confirmInfo}
                      onCheckedChange={(checked) => setConfirmInfo(checked === true)}
                    />
                    <Label htmlFor="confirmInfo" className="cursor-pointer text-sm leading-relaxed">
                      {t('review.confirmInfo') ||
                        'I confirm that all book information is accurate and matches my Amazon listing'}
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirmCredits"
                      checked={confirmCredits}
                      onCheckedChange={(checked) => setConfirmCredits(checked === true)}
                    />
                    <Label
                      htmlFor="confirmCredits"
                      className="cursor-pointer text-sm leading-relaxed"
                    >
                      {t('review.confirmCredits') ||
                        'I understand that credits will be allocated immediately and this action cannot be undone'}
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirmTerms"
                      checked={confirmTerms}
                      onCheckedChange={(checked) => setConfirmTerms(checked === true)}
                    />
                    <Label
                      htmlFor="confirmTerms"
                      className="cursor-pointer text-sm leading-relaxed"
                    >
                      {t('review.confirmTerms') ||
                        'I agree to the terms of service and understand how the review campaign works'}
                    </Label>
                  </div>
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
            disabled={!canGoBack || isCreating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('previous') || 'Previous'}
          </Button>

          {canGoNext ? (
            <Button type="button" onClick={handleNext}>
              {t('next') || 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={
                isCreating ||
                !confirmInfo ||
                !confirmCredits ||
                !confirmTerms ||
                creditsToAllocate > availableCredits
              }
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creating') || 'Creating...'}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t('create') || 'Create Campaign'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
