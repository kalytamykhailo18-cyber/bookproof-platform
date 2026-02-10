import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DollarSign,
  Save,
  Loader2,
  Settings,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Power,
  Clock,
  Calendar,
  Users,
  FileText,
  Wallet } from 'lucide-react';

import { settingsApi } from '@/lib/api/settings';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from '@/components/ui/form';
import { formatDate } from '@/lib/utils';

const keywordPricingSchema = z.object({
  price: z
    .number()
    .min(0, 'Price must be at least 0')
    .max(9999.99, 'Price cannot exceed $9,999.99'),
  reason: z.string().optional() });

type KeywordPricingFormData = z.infer<typeof keywordPricingSchema>;

const reviewRatesSchema = z.object({
  ebookRate: z
    .number()
    .min(0, 'Rate must be at least 0')
    .max(999.99, 'Rate cannot exceed $999.99'),
  audiobookRate: z
    .number()
    .min(0, 'Rate must be at least 0')
    .max(999.99, 'Rate cannot exceed $999.99'),
  reason: z.string().optional() });

type ReviewRatesFormData = z.infer<typeof reviewRatesSchema>;

const systemConfigSchema = z.object({
  distributionDay: z.number().min(1).max(7),
  distributionHour: z.number().min(0).max(23),
  overbookingPercentage: z.number().min(0).max(100),
  reviewDeadlineHours: z.number().min(1).max(720),
  minReviewWordCount: z.number().min(0).max(10000),
  minPayoutThreshold: z.number().min(0).max(10000),
  reason: z.string().optional() });

type SystemConfigFormData = z.infer<typeof systemConfigSchema>;

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export function AdminSettingsPage() {
  const { t, i18n } = useTranslation('adminSettings');

  // State for queries
  const [pricingSettings, setPricingSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featureStatus, setFeatureStatus] = useState<any>(null);
  const [featureLoading, setFeatureLoading] = useState(true);
  const [reviewRates, setReviewRates] = useState<any>(null);
  const [reviewRatesLoading, setReviewRatesLoading] = useState(true);
  const [allSettings, setAllSettings] = useState<any[]>([]);
  const [allSettingsLoading, setAllSettingsLoading] = useState(true);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [systemConfigLoading, setSystemConfigLoading] = useState(true);

  // State for mutations
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);
  const [isUpdatingFeature, setIsUpdatingFeature] = useState(false);
  const [isUpdatingReviewRates, setIsUpdatingReviewRates] = useState(false);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);
  const [isUpdatingSystemConfig, setIsUpdatingSystemConfig] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSystemConfig, setIsEditingSystemConfig] = useState(false);
  const [isEditingReviewRates, setIsEditingReviewRates] = useState(false);
  const [featureToggleReason, setFeatureToggleReason] = useState('');
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null);
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});

  // Fetch functions
  const refetch = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getPricingSettings();
      setPricingSettings(data);
    } catch (error: any) {
      console.error('Pricing settings error:', error);
      toast.error('Failed to load pricing settings');
    } finally {
      setIsLoading(false);
    }
  };

  const refetchFeature = async () => {
    try {
      setFeatureLoading(true);
      const data = await settingsApi.getKeywordResearchFeatureStatus();
      setFeatureStatus(data);
    } catch (error: any) {
      console.error('Feature status error:', error);
    } finally {
      setFeatureLoading(false);
    }
  };

  const refetchReviewRates = async () => {
    try {
      setReviewRatesLoading(true);
      const data = await settingsApi.getReviewPaymentRates();
      setReviewRates(data);
    } catch (error: any) {
      console.error('Review rates error:', error);
    } finally {
      setReviewRatesLoading(false);
    }
  };

  const refetchSystemConfig = async () => {
    try {
      setSystemConfigLoading(true);
      const data = await settingsApi.getSystemConfiguration();
      setSystemConfig(data);
    } catch (error: any) {
      console.error('System config error:', error);
    } finally {
      setSystemConfigLoading(false);
    }
  };

  const fetchAllSettings = async () => {
    try {
      setAllSettingsLoading(true);
      const data = await settingsApi.getAllSettings();
      setAllSettings(data);
    } catch (error: any) {
      console.error('All settings error:', error);
    } finally {
      setAllSettingsLoading(false);
    }
  };

  // Initial data fetches
  useEffect(() => {
    refetch();
    refetchFeature();
    refetchReviewRates();
    refetchSystemConfig();
    fetchAllSettings();
  }, []);

  const form = useForm<KeywordPricingFormData>({
    resolver: zodResolver(keywordPricingSchema),
    defaultValues: {
      price: pricingSettings?.keywordResearch?.price || 49.99,
      reason: '' } });

  const reviewRatesForm = useForm<ReviewRatesFormData>({
    resolver: zodResolver(reviewRatesSchema),
    defaultValues: {
      ebookRate: reviewRates?.ebookRate || 1.00,
      audiobookRate: reviewRates?.audiobookRate || 2.00,
      reason: '' } });

  const systemConfigForm = useForm<SystemConfigFormData>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      distributionDay: systemConfig?.distributionDay || 1,
      distributionHour: systemConfig?.distributionHour || 0,
      overbookingPercentage: systemConfig?.overbookingPercentage || 20,
      reviewDeadlineHours: systemConfig?.reviewDeadlineHours || 72,
      minReviewWordCount: systemConfig?.minReviewWordCount || 50,
      minPayoutThreshold: systemConfig?.minPayoutThreshold || 10,
      reason: '' } });

  // Update form when data loads
  if (pricingSettings?.keywordResearch && !isEditing) {
    const currentPrice = pricingSettings.keywordResearch.price;
    if (form.getValues('price') !== currentPrice) {
      form.setValue('price', currentPrice);
    }
  }

  // Update review rates form when data loads
  if (reviewRates && !isEditingReviewRates) {
    if (reviewRatesForm.getValues('ebookRate') !== reviewRates.ebookRate) {
      reviewRatesForm.setValue('ebookRate', reviewRates.ebookRate);
    }
    if (reviewRatesForm.getValues('audiobookRate') !== reviewRates.audiobookRate) {
      reviewRatesForm.setValue('audiobookRate', reviewRates.audiobookRate);
    }
  }

  // Update system config form when data loads
  if (systemConfig && !isEditingSystemConfig) {
    if (systemConfigForm.getValues('distributionDay') !== systemConfig.distributionDay) {
      systemConfigForm.setValue('distributionDay', systemConfig.distributionDay);
    }
    if (systemConfigForm.getValues('distributionHour') !== systemConfig.distributionHour) {
      systemConfigForm.setValue('distributionHour', systemConfig.distributionHour);
    }
    if (systemConfigForm.getValues('overbookingPercentage') !== systemConfig.overbookingPercentage) {
      systemConfigForm.setValue('overbookingPercentage', systemConfig.overbookingPercentage);
    }
    if (systemConfigForm.getValues('reviewDeadlineHours') !== systemConfig.reviewDeadlineHours) {
      systemConfigForm.setValue('reviewDeadlineHours', systemConfig.reviewDeadlineHours);
    }
    if (systemConfigForm.getValues('minReviewWordCount') !== systemConfig.minReviewWordCount) {
      systemConfigForm.setValue('minReviewWordCount', systemConfig.minReviewWordCount);
    }
    if (systemConfigForm.getValues('minPayoutThreshold') !== systemConfig.minPayoutThreshold) {
      systemConfigForm.setValue('minPayoutThreshold', systemConfig.minPayoutThreshold);
    }
  }

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    try {
      setIsUpdatingPricing(true);
      await settingsApi.updateKeywordResearchPricing({
        price: data.price,
        reason: data.reason || undefined
      });
      toast.success('Keyword research pricing updated successfully');
      await refetch();
      setIsEditing(false);
      form.setValue('reason', '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update pricing');
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (pricingSettings?.keywordResearch) {
      form.setValue('price', pricingSettings.keywordResearch.price);
    }
    form.setValue('reason', '');
  };

  const handleFeatureToggle = async (enabled: boolean) => {
    try {
      setIsUpdatingFeature(true);
      const result = await settingsApi.updateKeywordResearchFeature({
        enabled,
        reason: featureToggleReason || undefined
      });
      toast.success(
        result.enabled
          ? 'Keyword research feature enabled'
          : 'Keyword research feature disabled'
      );
      await refetchFeature();
      setFeatureToggleReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update feature status');
    } finally {
      setIsUpdatingFeature(false);
    }
  };

  const handleReviewRatesSubmit = async () => {
    const isValid = await reviewRatesForm.trigger();
    if (!isValid) return;

    const data = reviewRatesForm.getValues();
    try {
      setIsUpdatingReviewRates(true);
      await settingsApi.updateReviewPaymentRates({
        ebookRate: data.ebookRate,
        audiobookRate: data.audiobookRate,
        reason: data.reason || undefined
      });
      toast.success('Review payment rates updated successfully');
      await refetchReviewRates();
      setIsEditingReviewRates(false);
      reviewRatesForm.setValue('reason', '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment rates');
    } finally {
      setIsUpdatingReviewRates(false);
    }
  };

  const handleReviewRatesCancel = () => {
    setIsEditingReviewRates(false);
    if (reviewRates) {
      reviewRatesForm.setValue('ebookRate', reviewRates.ebookRate);
      reviewRatesForm.setValue('audiobookRate', reviewRates.audiobookRate);
    }
    reviewRatesForm.setValue('reason', '');
  };

  const handleSystemConfigSubmit = async () => {
    const isValid = await systemConfigForm.trigger();
    if (!isValid) return;

    const data = systemConfigForm.getValues();
    try {
      setIsUpdatingSystemConfig(true);
      await settingsApi.updateSystemConfiguration({
        distributionDay: data.distributionDay,
        distributionHour: data.distributionHour,
        overbookingPercentage: data.overbookingPercentage,
        reviewDeadlineHours: data.reviewDeadlineHours,
        minReviewWordCount: data.minReviewWordCount,
        minPayoutThreshold: data.minPayoutThreshold,
        reason: data.reason || undefined
      });
      toast.success('System configuration updated successfully');
      await refetchSystemConfig();
      setIsEditingSystemConfig(false);
      systemConfigForm.setValue('reason', '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update system configuration');
    } finally {
      setIsUpdatingSystemConfig(false);
    }
  };

  const handleSystemConfigCancel = () => {
    setIsEditingSystemConfig(false);
    if (systemConfig) {
      systemConfigForm.setValue('distributionDay', systemConfig.distributionDay);
      systemConfigForm.setValue('distributionHour', systemConfig.distributionHour);
      systemConfigForm.setValue('overbookingPercentage', systemConfig.overbookingPercentage);
      systemConfigForm.setValue('reviewDeadlineHours', systemConfig.reviewDeadlineHours);
      systemConfigForm.setValue('minReviewWordCount', systemConfig.minReviewWordCount);
      systemConfigForm.setValue('minPayoutThreshold', systemConfig.minPayoutThreshold);
    }
    systemConfigForm.setValue('reason', '');
  };

  if (isLoading || featureLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 animate-pulse" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-48 animate-pulse" />
            <Skeleton className="h-5 w-64 animate-pulse" />
          </div>
        </div>
        <Skeleton className="h-64 animate-pulse" />
        <Skeleton className="h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
      </div>

      {/* Feature Toggles Section */}
      <Card className="animate-fade-up-fast">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className="h-5 w-5 text-blue-600" />
              <CardTitle>{t('features.title')}</CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => refetchFeature()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('actions.refresh')}
            </Button>
          </div>
          <CardDescription>{t('features.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Keyword Research Feature Toggle */}
          <div className="animate-fade-up-light-slow rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{t('features.keywordResearch.title')}</h3>
                  <Badge variant={featureStatus?.enabled ? 'default' : 'secondary'}>
                    {featureStatus?.enabled ? t('status.enabled') : t('status.disabled')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('features.keywordResearch.description')}
                </p>
                {featureStatus?.updatedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('lastUpdated')}: {formatDate(featureStatus.updatedAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {featureStatus?.enabled ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                  <Switch
                    checked={featureStatus?.enabled || false}
                    onCheckedChange={handleFeatureToggle}
                    disabled={isUpdatingFeature}
                  />
                </div>
              </div>
            </div>
            {/* Optional reason input */}
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">{t('fields.reasonOptional')}</Label>
              <Input
                placeholder={t('fields.reasonPlaceholder')}
                value={featureToggleReason}
                onChange={(e) => setFeatureToggleReason(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">{t('fields.auditNote')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings Section */}
      <Card className="animate-fade-up-medium-slow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>{t('pricing.title')}</CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('actions.refresh')}
            </Button>
          </div>
          <CardDescription>{t('pricing.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-6">
              {/* Keyword Research Pricing */}
              <div className="animate-fade-up-heavy-slow rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{t('pricing.keywordResearch.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('pricing.keywordResearch.description')}
                    </p>
                  </div>
                  {!isEditing && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                      {t('actions.editPrice')}
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.priceUsd')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="9999.99"
                                className="pl-8"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t('fields.currentPrice')}: $
                            {pricingSettings?.keywordResearch?.price?.toFixed(2)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('fields.reasonOptional')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('fields.reasonPlaceholder')}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>{t('fields.auditNote')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isUpdatingPricing}
                      >
                        {isUpdatingPricing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('actions.saving')}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {t('actions.saveChanges')}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdatingPricing}
                      >
                        {t('actions.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        {t('fields.currentPrice')}
                      </Label>
                      <p className="text-2xl font-bold text-green-600">
                        ${pricingSettings?.keywordResearch?.price?.toFixed(2) || '49.99'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        {t('fields.currency')}
                      </Label>
                      <p className="text-lg font-medium">
                        {pricingSettings?.keywordResearch?.currency || 'USD'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">{t('lastUpdated')}</Label>
                      <p className="text-sm">
                        {pricingSettings?.keywordResearch?.updatedAt
                          ? formatDate(pricingSettings.keywordResearch.updatedAt)
                          : t('never')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Payment Rates */}
              <div className="animate-fade-up-heavy-slow rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Reader Review Payment Rates</h3>
                    <p className="text-sm text-muted-foreground">
                      Set payment rates for ebook and audiobook reviews
                    </p>
                  </div>
                  {!isEditingReviewRates && (
                    <Button type="button" variant="outline" onClick={() => setIsEditingReviewRates(true)}>
                      Edit Rates
                    </Button>
                  )}
                </div>

                {isEditingReviewRates ? (
                  <Form {...reviewRatesForm}>
                    <div className="space-y-4">
                      <FormField
                        control={reviewRatesForm.control}
                        name="ebookRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ebook Review Rate (USD)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="999.99"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Current rate: ${reviewRates?.ebookRate?.toFixed(2) || '1.00'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewRatesForm.control}
                        name="audiobookRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audiobook Review Rate (USD)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="999.99"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Current rate: ${reviewRates?.audiobookRate?.toFixed(2) || '2.00'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reviewRatesForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Reason for rate change (for audit trail)"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>This will be logged in the audit trail</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleReviewRatesSubmit}
                          disabled={isUpdatingReviewRates}
                        >
                          {isUpdatingReviewRates ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReviewRatesCancel}
                          disabled={isUpdatingReviewRates}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Form>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Ebook Rate</Label>
                      <p className="text-2xl font-bold text-green-600">
                        ${reviewRates?.ebookRate?.toFixed(2) || '1.00'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Audiobook Rate</Label>
                      <p className="text-2xl font-bold text-green-600">
                        ${reviewRates?.audiobookRate?.toFixed(2) || '2.00'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Currency</Label>
                      <p className="text-lg font-medium">
                        {reviewRates?.currency || 'USD'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Last Updated</Label>
                      <p className="text-sm">
                        {reviewRates?.updatedAt
                          ? formatDate(reviewRates.updatedAt)
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* System Configuration Section (Section 5.6) */}
      <Card className="animate-fade-up-slow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <CardTitle>System Configuration</CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => refetchSystemConfig()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Configure distribution schedules, review settings, and payment thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemConfigLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
              <Skeleton className="h-12 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Edit / View Mode Toggle */}
              <div className="flex justify-end">
                {!isEditingSystemConfig ? (
                  <Button type="button" variant="outline" onClick={() => setIsEditingSystemConfig(true)}>
                    Edit Configuration
                  </Button>
                ) : null}
              </div>

              {isEditingSystemConfig ? (
                <Form {...systemConfigForm}>
                  <div className="space-y-6">
                    {/* Distribution Schedule */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Distribution Schedule</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={systemConfigForm.control}
                          name="distributionDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distribution Day</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                >
                                  {DAYS_OF_WEEK.map((day) => (
                                    <option key={day.value} value={day.value}>
                                      {day.label}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormDescription>
                                Day when weekly distribution runs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={systemConfigForm.control}
                          name="distributionHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Distribution Hour (UTC)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="23"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Hour in UTC (0-23) when distribution runs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Reader Slot Settings */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Reader Slot Settings</h3>
                      </div>
                      <FormField
                        control={systemConfigForm.control}
                        name="overbookingPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overbooking Percentage</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="pr-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Percentage of extra reader slots to allow for no-shows (recommended: 20%)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Review Settings */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Review Settings</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={systemConfigForm.control}
                          name="reviewDeadlineHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Deadline (Hours)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="720"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 72)}
                                />
                              </FormControl>
                              <FormDescription>
                                Hours readers have to submit reviews after material access
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={systemConfigForm.control}
                          name="minReviewWordCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Review Word Count</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 50)}
                                />
                              </FormControl>
                              <FormDescription>
                                Minimum words required in review feedback
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="h-5 w-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold">Payment Settings</h3>
                      </div>
                      <FormField
                        control={systemConfigForm.control}
                        name="minPayoutThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Payout Threshold (USD)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10000"
                                  step="0.01"
                                  className="pl-8"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 10)}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum wallet balance required for readers to request payout
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Reason Field */}
                    <FormField
                      control={systemConfigForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Changes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why you are changing these settings (for audit trail)"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be logged in the audit trail for all changed settings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleSystemConfigSubmit}
                        disabled={isUpdatingSystemConfig}
                      >
                        {isUpdatingSystemConfig ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Configuration
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSystemConfigCancel}
                        disabled={isUpdatingSystemConfig}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Form>
              ) : (
                <div className="space-y-6">
                  {/* Distribution Schedule Display */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Distribution Schedule</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Distribution Day</Label>
                        <p className="text-lg font-medium">
                          {DAYS_OF_WEEK.find((d) => d.value === systemConfig?.distributionDay)?.label || 'Monday'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Distribution Hour (UTC)</Label>
                        <p className="text-lg font-medium">
                          {systemConfig?.distributionHour !== undefined
                            ? `${systemConfig.distributionHour.toString().padStart(2, '0')}:00 UTC`
                            : '00:00 UTC'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reader Slot Settings Display */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Reader Slot Settings</h3>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Overbooking Percentage</Label>
                      <p className="text-2xl font-bold text-green-600">
                        {systemConfig?.overbookingPercentage ?? 20}%
                      </p>
                    </div>
                  </div>

                  {/* Review Settings Display */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold">Review Settings</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Review Deadline</Label>
                        <p className="text-2xl font-bold text-purple-600">
                          {systemConfig?.reviewDeadlineHours ?? 72} hours
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Min Word Count</Label>
                        <p className="text-2xl font-bold text-purple-600">
                          {systemConfig?.minReviewWordCount ?? 50} words
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Settings Display */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Wallet className="h-5 w-5 text-yellow-600" />
                      <h3 className="text-lg font-semibold">Payment Settings</h3>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Minimum Payout Threshold</Label>
                      <p className="text-2xl font-bold text-yellow-600">
                        ${systemConfig?.minPayoutThreshold?.toFixed(2) ?? '10.00'}
                      </p>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {systemConfig?.updatedAt && (
                    <div className="text-sm text-muted-foreground">
                      Last updated: {formatDate(systemConfig.updatedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* General Settings Section (All other settings by category) */}
      {allSettings && allSettings.length > 0 && (
        <Card className="animate-fade-up-extra-slow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <CardTitle>General System Settings</CardTitle>
            </div>
            <CardDescription>
              Configure system-wide settings organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              // Group settings by category
              const settingsByCategory: Record<string, typeof allSettings> = {};
              allSettings.forEach((setting) => {
                if (!settingsByCategory[setting.category]) {
                  settingsByCategory[setting.category] = [];
                }
                settingsByCategory[setting.category].push(setting);
              });

              // Filter out categories already shown elsewhere (pricing, features)
              const filteredCategories = Object.entries(settingsByCategory).filter(
                ([category]) => !['pricing', 'features'].includes(category)
              );

              if (filteredCategories.length === 0) {
                return (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No additional settings available
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {filteredCategories.map(([category, settings]) => (
                    <div key={category} className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold capitalize mb-4">
                        {category} Settings
                      </h3>
                      <div className="space-y-4">
                        {settings.map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between border-b pb-3">
                            <div className="flex-1 mr-4">
                              <Label className="text-sm font-medium">
                                {setting.description || setting.key}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Key: {setting.key} | Type: {setting.dataType}
                              </p>
                            </div>
                            {editingSettingKey === setting.key ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={settingValues[setting.key] ?? setting.value}
                                  onChange={(e) =>
                                    setSettingValues((prev) => ({
                                      ...prev,
                                      [setting.key]: e.target.value }))
                                  }
                                  className="w-48"
                                  type={setting.dataType === 'number' ? 'number' : 'text'}
                                />
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      setIsUpdatingSetting(true);
                                      await settingsApi.updateSetting(setting.key, {
                                        value: settingValues[setting.key] ?? setting.value
                                      });
                                      toast.success('Setting updated successfully');
                                      await fetchAllSettings();
                                      setEditingSettingKey(null);
                                    } catch (error: any) {
                                      toast.error(error.response?.data?.message || 'Failed to update setting');
                                    } finally {
                                      setIsUpdatingSetting(false);
                                    }
                                  }}
                                  disabled={isUpdatingSetting}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSettingKey(null);
                                    setSettingValues((prev) => {
                                      const updated = { ...prev };
                                      delete updated[setting.key];
                                      return updated;
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {setting.value}
                                </Badge>
                                {setting.isEditable && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingSettingKey(setting.key);
                                      setSettingValues((prev) => ({
                                        ...prev,
                                        [setting.key]: setting.value }));
                                    }}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
