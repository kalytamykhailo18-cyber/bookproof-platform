'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllLandingPages,
  getLandingPage,
  updateLandingPage,
  getLeads,
  deleteLead,
  resendWelcomeEmail,
  getGlobalAnalytics,
  getAnalyticsByLanguage,
  exportLeads,
  LandingPage,
  UpdateLandingPageRequest,
  LeadsListResponse,
  GetLeadsParams,
  GlobalAnalytics,
  AnalyticsStats,
  Language,
} from '@/lib/api/landing-pages';

// ============================================
// LANDING PAGE HOOKS (ADMIN)
// ============================================

/**
 * Get all landing pages (admin)
 */
export function useAllLandingPages() {
  return useQuery<LandingPage[]>({
    queryKey: ['landing-pages', 'all'],
    queryFn: getAllLandingPages,
    staleTime: 60000,
  });
}

/**
 * Get landing page by language (admin)
 */
export function useLandingPage(language: Language) {
  return useQuery<LandingPage>({
    queryKey: ['landing-pages', language],
    queryFn: () => getLandingPage(language),
    enabled: !!language,
    staleTime: 60000,
  });
}

/**
 * Update landing page content (admin CMS)
 */
export function useUpdateLandingPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLandingPageRequest) => updateLandingPage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast.success(`Landing page (${variables.language}) updated successfully`);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to update landing page')
          : 'Failed to update landing page';
      toast.error(errorMessage);
    },
  });
}

// ============================================
// LEADS HOOKS (ADMIN)
// ============================================

/**
 * Get leads with pagination and filters (admin)
 */
export function useLeads(params: GetLeadsParams = {}) {
  return useQuery<LeadsListResponse>({
    queryKey: ['landing-pages', 'leads', params],
    queryFn: () => getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Delete a lead (admin)
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages', 'leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to delete lead')
          : 'Failed to delete lead';
      toast.error(errorMessage);
    },
  });
}

/**
 * Resend welcome email to a lead (admin)
 */
export function useResendWelcomeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendWelcomeEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages', 'leads'] });
      toast.success('Welcome email resent successfully');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'Failed to resend email')
          : 'Failed to resend email';
      toast.error(errorMessage);
    },
  });
}

/**
 * Export leads (admin)
 */
export function useExportLeads() {
  return useMutation({
    mutationFn: ({ language, format }: { language?: Language; format?: 'csv' | 'json' }) =>
      exportLeads(language, format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads.${variables.format || 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Leads exported successfully');
    },
    onError: () => {
      toast.error('Failed to export leads');
    },
  });
}

// ============================================
// ANALYTICS HOOKS (ADMIN)
// ============================================

/**
 * Get global analytics (admin)
 */
export function useGlobalAnalytics() {
  return useQuery<GlobalAnalytics>({
    queryKey: ['landing-pages', 'analytics', 'global'],
    queryFn: getGlobalAnalytics,
    staleTime: 60000,
  });
}

/**
 * Get analytics by language (admin)
 */
export function useAnalyticsByLanguage(language: Language) {
  return useQuery<AnalyticsStats>({
    queryKey: ['landing-pages', 'analytics', language],
    queryFn: () => getAnalyticsByLanguage(language),
    enabled: !!language,
    staleTime: 60000,
  });
}
