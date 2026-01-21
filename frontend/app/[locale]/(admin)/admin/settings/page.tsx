'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
} from 'lucide-react';

import {
  usePricingSettings,
  useUpdateKeywordResearchPricing,
  useKeywordResearchFeatureStatus,
  useUpdateKeywordResearchFeature,
  useReviewPaymentRates,
  useUpdateReviewPaymentRates,
  useAllSettings,
  useUpdateSetting,
} from '@/hooks/useSettings';
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
  FormMessage,
} from '@/components/ui/form';
import { formatDate } from '@/lib/utils';

const keywordPricingSchema = z.object({
  price: z
    .number()
    .min(0, 'Price must be at least 0')
    .max(9999.99, 'Price cannot exceed $9,999.99'),
  reason: z.string().optional(),
});

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
  reason: z.string().optional(),
});

type ReviewRatesFormData = z.infer<typeof reviewRatesSchema>;

export default function AdminSettingsPage() {
  const t = useTranslations('adminSettings');
  const { data: pricingSettings, isLoading, refetch } = usePricingSettings();
  const updatePricingMutation = useUpdateKeywordResearchPricing();
  const {
    data: featureStatus,
    isLoading: featureLoading,
    refetch: refetchFeature,
  } = useKeywordResearchFeatureStatus();
  const updateFeatureMutation = useUpdateKeywordResearchFeature();
  const { data: reviewRates, isLoading: reviewRatesLoading, refetch: refetchReviewRates } = useReviewPaymentRates();
  const updateReviewRatesMutation = useUpdateReviewPaymentRates();
  const { data: allSettings, isLoading: allSettingsLoading } = useAllSettings();
  const updateSettingMutation = useUpdateSetting();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingReviewRates, setIsEditingReviewRates] = useState(false);
  const [featureToggleReason, setFeatureToggleReason] = useState('');
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null);
  const [settingValues, setSettingValues] = useState<Record<string, string>>({});

  const form = useForm<KeywordPricingFormData>({
    resolver: zodResolver(keywordPricingSchema),
    defaultValues: {
      price: pricingSettings?.keywordResearch?.price || 49.99,
      reason: '',
    },
  });

  const reviewRatesForm = useForm<ReviewRatesFormData>({
    resolver: zodResolver(reviewRatesSchema),
    defaultValues: {
      ebookRate: reviewRates?.ebookRate || 1.00,
      audiobookRate: reviewRates?.audiobookRate || 2.00,
      reason: '',
    },
  });

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

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const data = form.getValues();
    await updatePricingMutation.mutateAsync({
      price: data.price,
      reason: data.reason || undefined,
    });
    setIsEditing(false);
    form.setValue('reason', '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (pricingSettings?.keywordResearch) {
      form.setValue('price', pricingSettings.keywordResearch.price);
    }
    form.setValue('reason', '');
  };

  const handleFeatureToggle = async (enabled: boolean) => {
    await updateFeatureMutation.mutateAsync({
      enabled,
      reason: featureToggleReason || undefined,
    });
    setFeatureToggleReason('');
  };

  const handleReviewRatesSubmit = async () => {
    const isValid = await reviewRatesForm.trigger();
    if (!isValid) return;

    const data = reviewRatesForm.getValues();
    await updateReviewRatesMutation.mutateAsync({
      ebookRate: data.ebookRate,
      audiobookRate: data.audiobookRate,
      reason: data.reason || undefined,
    });
    setIsEditingReviewRates(false);
    reviewRatesForm.setValue('reason', '');
  };

  const handleReviewRatesCancel = () => {
    setIsEditingReviewRates(false);
    if (reviewRates) {
      reviewRatesForm.setValue('ebookRate', reviewRates.ebookRate);
      reviewRatesForm.setValue('audiobookRate', reviewRates.audiobookRate);
    }
    reviewRatesForm.setValue('reason', '');
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
                    disabled={updateFeatureMutation.isPending}
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
                        disabled={updatePricingMutation.isPending}
                      >
                        {updatePricingMutation.isPending ? (
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
                        disabled={updatePricingMutation.isPending}
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
                          disabled={updateReviewRatesMutation.isPending}
                        >
                          {updateReviewRatesMutation.isPending ? (
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
                          disabled={updateReviewRatesMutation.isPending}
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
                                      [setting.key]: e.target.value,
                                    }))
                                  }
                                  className="w-48"
                                  type={setting.dataType === 'number' ? 'number' : 'text'}
                                />
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    await updateSettingMutation.mutateAsync({
                                      key: setting.key,
                                      data: {
                                        value: settingValues[setting.key] ?? setting.value,
                                      },
                                    });
                                    setEditingSettingKey(null);
                                  }}
                                  disabled={updateSettingMutation.isPending}
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
                                        [setting.key]: setting.value,
                                      }));
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
