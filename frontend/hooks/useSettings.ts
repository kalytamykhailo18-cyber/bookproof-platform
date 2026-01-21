'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  settingsApi,
  SettingResponse,
  KeywordPricingResponse,
  PricingSettingsResponse,
  UpdateSettingData,
  UpdateKeywordPricingData,
  KeywordResearchFeatureStatusResponse,
  UpdateKeywordResearchFeatureData,
  ReviewPaymentRatesResponse,
  UpdateReviewPaymentRatesData,
} from '@/lib/api/settings';

// ============================================
// ADMIN HOOKS
// ============================================

/**
 * Get all system settings (admin)
 */
export function useAllSettings() {
  return useQuery<SettingResponse[]>({
    queryKey: ['settings', 'all'],
    queryFn: () => settingsApi.getAllSettings(),
    staleTime: 60000,
  });
}

/**
 * Get settings by category (admin)
 */
export function useSettingsByCategory(category: string) {
  return useQuery<SettingResponse[]>({
    queryKey: ['settings', 'category', category],
    queryFn: () => settingsApi.getSettingsByCategory(category),
    enabled: !!category,
    staleTime: 60000,
  });
}

/**
 * Get pricing settings (admin)
 */
export function usePricingSettings() {
  return useQuery<PricingSettingsResponse>({
    queryKey: ['settings', 'pricing'],
    queryFn: () => settingsApi.getPricingSettings(),
    staleTime: 60000,
  });
}

/**
 * Get keyword research pricing (admin)
 */
export function useKeywordResearchPricing() {
  return useQuery<KeywordPricingResponse>({
    queryKey: ['settings', 'pricing', 'keyword-research'],
    queryFn: () => settingsApi.getKeywordResearchPricing(),
    staleTime: 60000,
  });
}

/**
 * Update a setting (admin)
 */
export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateSettingData }) =>
      settingsApi.updateSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update setting');
    },
  });
}

/**
 * Update keyword research pricing (admin)
 */
export function useUpdateKeywordResearchPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateKeywordPricingData) =>
      settingsApi.updateKeywordResearchPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'pricing'] });
      toast.success('Keyword research pricing updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update pricing');
    },
  });
}

/**
 * Get review payment rates (admin)
 */
export function useReviewPaymentRates() {
  return useQuery<ReviewPaymentRatesResponse>({
    queryKey: ['settings', 'pricing', 'review-rates'],
    queryFn: () => settingsApi.getReviewPaymentRates(),
    staleTime: 60000,
  });
}

/**
 * Update review payment rates (admin)
 */
export function useUpdateReviewPaymentRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReviewPaymentRatesData) =>
      settingsApi.updateReviewPaymentRates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'pricing'] });
      toast.success('Review payment rates updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment rates');
    },
  });
}

// ============================================
// PUBLIC HOOKS (for author pages)
// ============================================

/**
 * Get keyword research pricing (public - for checkout display)
 */
export function usePublicKeywordResearchPricing() {
  return useQuery<KeywordPricingResponse>({
    queryKey: ['public', 'pricing', 'keyword-research'],
    queryFn: () => settingsApi.getPublicKeywordResearchPricing(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get keyword research feature status (public - to check if feature is available)
 */
export function usePublicKeywordResearchFeatureStatus() {
  return useQuery<{ enabled: boolean }>({
    queryKey: ['public', 'features', 'keyword-research'],
    queryFn: () => settingsApi.getPublicKeywordResearchFeatureStatus(),
    staleTime: 60000, // 1 minute
  });
}

// ============================================
// ADMIN FEATURE TOGGLE HOOKS
// ============================================

/**
 * Get keyword research feature status (admin)
 */
export function useKeywordResearchFeatureStatus() {
  return useQuery<KeywordResearchFeatureStatusResponse>({
    queryKey: ['settings', 'features', 'keyword-research'],
    queryFn: () => settingsApi.getKeywordResearchFeatureStatus(),
    staleTime: 30000,
  });
}

/**
 * Update keyword research feature status (admin)
 */
export function useUpdateKeywordResearchFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateKeywordResearchFeatureData) =>
      settingsApi.updateKeywordResearchFeature(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'features'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'features'] });
      toast.success(
        data.enabled
          ? 'Keyword research feature enabled'
          : 'Keyword research feature disabled',
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update feature status');
    },
  });
}
