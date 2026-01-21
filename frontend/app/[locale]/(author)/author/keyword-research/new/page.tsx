'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateKeywordResearch } from '@/hooks/useKeywordResearch';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { usePublicKeywordResearchPricing } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Save, Trash2 } from 'lucide-react';
import { Language, TargetMarket } from '@/lib/api/keywords';
import { campaignsApi } from '@/lib/api/campaigns';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const DRAFT_STORAGE_KEY = 'keyword-research-draft';

const formSchema = z.object({
  bookId: z.string().optional(), // Optional for standalone purchases (no existing book)
  bookTitle: z.string().min(2, 'Book title is required'),
  genre: z.string().min(2, 'Genre is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  targetAudience: z.string().min(5, 'Target audience is required'),
  competingBooks: z.string().optional(),
  specificKeywords: z.string().optional(),
  bookLanguage: z.nativeEnum(Language),
  targetMarket: z.nativeEnum(TargetMarket),
  additionalNotes: z.string().optional(),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewKeywordResearchPage() {
  const t = useTranslations('keyword-research.new');
  const router = useRouter();
  const createMutation = useCreateKeywordResearch();
  const validateCouponMutation = useValidateCoupon();
  const { data: pricing } = usePublicKeywordResearchPricing();

  // Get dynamic price from settings, fallback to $49.99
  const basePrice = pricing?.price ?? 49.99;

  const [couponValidation, setCouponValidation] = useState<{
    valid: boolean;
    discountAmount?: number;
    finalPrice?: number;
  } | null>(null);

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch user's campaigns/books
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.getCampaigns(),
  });

  // Load draft from localStorage on mount
  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        return draft.values as Partial<FormValues>;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookLanguage: Language.EN,
      targetMarket: TargetMarket.US,
      bookTitle: '',
      genre: '',
      category: '',
      description: '',
      targetAudience: '',
      competingBooks: '',
      specificKeywords: '',
      additionalNotes: '',
      couponCode: '',
    },
  });

  // Check for existing draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setHasDraft(true);
      // Restore draft values
      Object.entries(draft).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          form.setValue(key as keyof FormValues, value as string);
        }
      });
    }
  }, [loadDraft, form]);

  const selectedBookId = form.watch('bookId');

  // Auto-save draft when form values change (debounced)
  const formValues = form.watch();
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if there's meaningful content
      const hasContent = formValues.bookTitle || formValues.description || formValues.genre;
      if (hasContent) {
        try {
          localStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify({
              values: formValues,
              savedAt: new Date().toISOString(),
            }),
          );
          setHasDraft(true);
          setLastSaved(new Date());
        } catch {
          // Ignore storage errors
        }
      }
    }, 1000); // Debounce 1 second

    return () => clearTimeout(timer);
  }, [formValues]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setLastSaved(null);
    form.reset({
      bookLanguage: Language.EN,
      targetMarket: TargetMarket.US,
      bookTitle: '',
      genre: '',
      category: '',
      description: '',
      targetAudience: '',
      competingBooks: '',
      additionalNotes: '',
      couponCode: '',
    });
    toast.success(t('draft.cleared'));
  }, [form, t]);

  // Auto-fill book details when book is selected
  useEffect(() => {
    if (selectedBookId && campaigns) {
      const campaign = campaigns.find((c) => c.id === selectedBookId);
      if (campaign) {
        form.setValue('bookTitle', campaign.title);
        form.setValue('genre', campaign.genre || '');
        form.setValue('category', campaign.category || '');
        form.setValue('description', campaign.synopsis || '');
        form.setValue('bookLanguage', campaign.language as Language);
      }
    }
  }, [selectedBookId, campaigns, form]);

  const handleValidateCoupon = async () => {
    const couponCode = form.getValues('couponCode');
    if (!couponCode) return;

    const result = await validateCouponMutation.mutateAsync({
      code: couponCode,
      purchaseAmount: basePrice,
    });

    setCouponValidation({
      valid: result.valid,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice,
    });
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    try {
      const result = await createMutation.mutateAsync(data);
      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.push(`/author/keyword-research/${result.id}`);
    } catch (error) {
      console.error('Failed to create keyword research:', error);
    }
  };

  const finalPrice = couponValidation?.finalPrice ?? basePrice;
  const discount = couponValidation?.discountAmount ?? 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Draft Status Indicator */}
      {hasDraft && (
        <Alert className="mb-6">
          <Save className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t('draft.restored')}
              {lastSaved && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({t('draft.lastSaved')}: {lastSaved.toLocaleTimeString()})
                </span>
              )}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={clearDraft} className="ml-4">
              <Trash2 className="mr-1 h-4 w-4" />
              {t('draft.clear')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <div className="space-y-6">
          {/* Book Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t('steps.bookInfo')}</CardTitle>
              <CardDescription>Select the book for keyword research</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.bookId.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('fields.bookId.placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingCampaigns ? (
                          <div className="p-4 text-center text-muted-foreground">
                            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                            Loading campaigns...
                          </div>
                        ) : campaigns && campaigns.length > 0 ? (
                          campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No campaigns found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('fields.bookId.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bookTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.bookTitle.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.bookTitle.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.bookTitle.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('steps.details')}</CardTitle>
              <CardDescription>Provide detailed information about your book</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.genre.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('fields.genre.placeholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('fields.genre.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fields.bookLanguage.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Language.EN}>English</SelectItem>
                          <SelectItem value={Language.ES}>Spanish</SelectItem>
                          <SelectItem value={Language.PT}>Portuguese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>{t('fields.bookLanguage.description')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="targetMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.targetMarket.label')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TargetMarket.US}>
                          Amazon United States (amazon.com)
                        </SelectItem>
                        <SelectItem value={TargetMarket.BR}>
                          Amazon Brazil (amazon.com.br)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>{t('fields.targetMarket.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.category.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.category.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.category.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.description.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('fields.description.placeholder')}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('fields.description.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.targetAudience.label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.targetAudience.placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.targetAudience.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="competingBooks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.competingBooks.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('fields.competingBooks.placeholder')}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('fields.competingBooks.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specificKeywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fields.specificKeywords.label') || 'Specific Keywords to Include'}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          t('fields.specificKeywords.placeholder') ||
                          'e.g., self-publishing, book marketing, Amazon KDP'
                        }
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('fields.specificKeywords.description') ||
                        'Optional: Specific keywords you want to include in the research'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.additionalNotes.label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('fields.additionalNotes.placeholder')}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('fields.additionalNotes.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Review & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>{t('review.title')}</CardTitle>
              <CardDescription>Review your order and complete payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coupon Code */}
              <FormField
                control={form.control}
                name="couponCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.couponCode.label')}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder={t('fields.couponCode.placeholder')} {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateCoupon}
                        disabled={!field.value || validateCouponMutation.isPending}
                      >
                        {validateCouponMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('fields.couponCode.apply')
                        )}
                      </Button>
                    </div>
                    {couponValidation && (
                      <div className="mt-2 flex items-center gap-2">
                        {couponValidation.valid ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              {t('fields.couponCode.applied')}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">
                              {t('fields.couponCode.invalid')}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <FormDescription>{t('fields.couponCode.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pricing Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>{t('review.subtotal')}</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('review.discount')}</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>{t('review.total')}</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
}
