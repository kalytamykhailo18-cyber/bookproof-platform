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

  const [isEditing, setIsEditing] = useState(false);
  const [featureToggleReason, setFeatureToggleReason] = useState('');

  const form = useForm<KeywordPricingFormData>({
    resolver: zodResolver(keywordPricingSchema),
    defaultValues: {
      price: pricingSettings?.keywordResearch?.price || 49.99,
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

              {/* Future: Add more pricing settings here */}
              <div className="animate-fade-up-extra-slow rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                <p className="text-sm">{t('pricing.futureNote')}</p>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
