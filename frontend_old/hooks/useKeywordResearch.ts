import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  keywordsApi,
  CreateKeywordResearchDto,
  UpdateKeywordResearchDto,
  CreateKeywordResearchCheckoutDto,
  KeywordResearchResponseDto,
  KeywordResearchListItemDto,
} from '@/lib/api/keywords';

// Query keys
export const keywordResearchKeys = {
  all: ['keyword-research'] as const,
  listsAuthor: () => [...keywordResearchKeys.all, 'list-author'] as const,
  listsAdmin: () => [...keywordResearchKeys.all, 'list-admin'] as const,
  details: () => [...keywordResearchKeys.all, 'detail'] as const,
  detail: (id: string) => [...keywordResearchKeys.details(), id] as const,
  download: (id: string) => [...keywordResearchKeys.all, 'download', id] as const,
};

/**
 * Hook to get all keyword research orders for the current author
 */
export function useKeywordResearchForAuthor() {
  return useQuery({
    queryKey: keywordResearchKeys.listsAuthor(),
    queryFn: () => keywordsApi.getAllForAuthor(),
  });
}

/**
 * Hook to get all keyword research orders (Admin only)
 */
export function useKeywordResearchForAdmin() {
  return useQuery({
    queryKey: keywordResearchKeys.listsAdmin(),
    queryFn: () => keywordsApi.getAllForAdmin(),
  });
}

/**
 * Hook to get a single keyword research by ID
 */
export function useKeywordResearch(id: string) {
  return useQuery({
    queryKey: keywordResearchKeys.detail(id),
    queryFn: () => keywordsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to get PDF download URL
 */
export function useKeywordResearchDownload(id: string, enabled: boolean = false) {
  return useQuery({
    queryKey: keywordResearchKeys.download(id),
    queryFn: () => keywordsApi.downloadPdf(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a keyword research order
 */
export function useCreateKeywordResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateKeywordResearchDto) => keywordsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keywordResearchKeys.listsAuthor() });

      if (data.paid) {
        toast.success('Keyword research order created! Processing will begin shortly.');
      } else {
        toast.success('Keyword research order created! Please complete payment to start processing.');
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create keyword research order';
      toast.error(message);
    },
  });
}

/**
 * Hook to update keyword research (Author only, PENDING status only)
 */
export function useUpdateKeywordResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKeywordResearchDto }) =>
      keywordsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keywordResearchKeys.listsAuthor() });
      queryClient.invalidateQueries({ queryKey: keywordResearchKeys.detail(data.id) });
      toast.success('Keyword research updated successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to update keyword research';
      toast.error(message);
    },
  });
}

/**
 * Hook to regenerate keywords (Admin only)
 */
export function useRegenerateKeywordResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => keywordsApi.regenerate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: keywordResearchKeys.listsAdmin() });
      queryClient.invalidateQueries({ queryKey: keywordResearchKeys.detail(data.id) });
      toast.success('Keyword research regeneration started');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to regenerate keyword research';
      toast.error(message);
    },
  });
}

/**
 * Hook to download PDF with auto-increment download count
 */
export function useDownloadKeywordResearchPdf() {
  return useMutation({
    mutationFn: (id: string) => keywordsApi.downloadPdf(id),
    onSuccess: (data) => {
      // Open PDF in new tab
      window.open(data.url, '_blank');
      toast.success('PDF download started');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to download PDF';
      toast.error(message);
    },
  });
}

/**
 * Hook to create checkout session for keyword research payment
 */
export function useKeywordResearchCheckout() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateKeywordResearchCheckoutDto }) =>
      keywordsApi.createCheckout(id, data),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create checkout session';
      toast.error(message);
    },
  });
}
