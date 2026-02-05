'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminControlsApi } from '@/lib/api/admin-controls';
import { adminAuthorsApi } from '@/lib/api/admin-authors';
import type {
  PauseCampaignDto,
  ResumeCampaignDto,
  AdjustWeeklyDistributionDto,
  AddCreditsDto,
  RemoveCreditsDto,
  AllocateCreditsDto,
  AdjustOverbookingDto,
  CreditTransactionType,
  UpdateCampaignSettingsDto,
  TransferCreditsDto,
  ExtendDeadlineDto,
  ShortenDeadlineDto,
  ReassignReaderDto,
  CancelAssignmentDto,
  RequestResubmissionDto,
  ForceCompleteCampaignDto,
  ManualGrantAccessDto,
  RemoveReaderFromCampaignDto,
} from '@/lib/api/admin-controls';
import type {
  SuspendAuthorDto,
  UnsuspendAuthorDto,
  UpdateAuthorNotesDto,
} from '@/lib/api/admin-authors';

export function useAdminControls() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get campaign health
  const useCampaignHealth = (bookId: string) =>
    useQuery({
      queryKey: ['campaign-health', bookId],
      queryFn: () => adminControlsApi.getCampaignHealth(bookId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!bookId,
    });

  // Get campaign analytics
  const useCampaignAnalytics = (bookId: string) =>
    useQuery({
      queryKey: ['campaign-analytics', bookId],
      queryFn: () => adminControlsApi.getCampaignAnalytics(bookId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!bookId,
    });

  // Get all campaigns
  const useAllCampaigns = () =>
    useQuery({
      queryKey: ['admin-campaigns'],
      queryFn: () => adminControlsApi.getAllCampaigns(),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Get all authors
  const useAllAuthors = (limit: number = 100, offset: number = 0) => {
    console.log('[HOOK] useAllAuthors called', { limit, offset, time: new Date().toISOString() });
    return useQuery({
      queryKey: ['admin-authors', limit, offset],
      queryFn: async () => {
        console.log('[HOOK] useAllAuthors queryFn START', new Date().toISOString());
        const result = await adminControlsApi.getAllAuthors(limit, offset);
        console.log('[HOOK] useAllAuthors queryFn END', { count: result.authors.length, time: new Date().toISOString() });
        return result;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Get author details
  const useAuthorDetails = (authorProfileId: string) =>
    useQuery({
      queryKey: ['admin-author', authorProfileId],
      queryFn: () => adminControlsApi.getAuthorDetails(authorProfileId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!authorProfileId,
    });

  // Get author transaction history
  const useAuthorTransactionHistory = (
    authorProfileId: string,
    limit?: number,
    offset?: number,
  ) =>
    useQuery({
      queryKey: ['admin-author-transactions', authorProfileId, limit, offset],
      queryFn: () => adminControlsApi.getAuthorTransactionHistory(authorProfileId, limit, offset),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!authorProfileId,
    });

  // Get all credit transactions
  const useAllCreditTransactions = (
    limit?: number,
    offset?: number,
    type?: CreditTransactionType,
  ) =>
    useQuery({
      queryKey: ['admin-credit-transactions', limit, offset, type],
      queryFn: () => adminControlsApi.getAllCreditTransactions(limit, offset, type),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Pause campaign mutation
  const pauseCampaign = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: PauseCampaignDto }) =>
      adminControlsApi.pauseCampaign(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to pause campaign');
    },
  });

  // Resume campaign mutation
  const resumeCampaign = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: ResumeCampaignDto }) =>
      adminControlsApi.resumeCampaign(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign resumed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume campaign');
    },
  });

  // Adjust weekly distribution mutation
  const adjustDistribution = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: AdjustWeeklyDistributionDto }) =>
      adminControlsApi.adjustWeeklyDistribution(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      toast.success('Weekly distribution adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust distribution');
    },
  });

  // Add credits mutation
  const addCredits = useMutation({
    mutationFn: ({ authorProfileId, data }: { authorProfileId: string; data: AddCreditsDto }) =>
      adminControlsApi.addCreditsToAuthor(authorProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-author', variables.authorProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-author-transactions', variables.authorProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] });
      toast.success('Credits added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add credits');
    },
  });

  // Remove credits mutation
  const removeCredits = useMutation({
    mutationFn: ({ authorProfileId, data }: { authorProfileId: string; data: RemoveCreditsDto }) =>
      adminControlsApi.removeCreditsFromAuthor(authorProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-author', variables.authorProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-author-transactions', variables.authorProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] });
      toast.success('Credits removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove credits');
    },
  });

  // Allocate credits mutation
  const allocateCredits = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: AllocateCreditsDto }) =>
      adminControlsApi.allocateCreditsToCampaign(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      toast.success('Credits allocated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to allocate credits');
    },
  });

  // Adjust overbooking mutation
  const adjustOverbooking = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: AdjustOverbookingDto }) =>
      adminControlsApi.adjustOverbooking(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      toast.success('Overbooking adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust overbooking');
    },
  });

  // Update campaign settings mutation
  const updateCampaignSettings = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: UpdateCampaignSettingsDto }) =>
      adminControlsApi.updateCampaignSettings(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update campaign settings');
    },
  });

  // Transfer credits mutation
  const transferCredits = useMutation({
    mutationFn: (data: TransferCreditsDto) => adminControlsApi.transferCredits(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.fromBookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.toBookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] });
      toast.success('Credits transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to transfer credits');
    },
  });

  // Resume campaign with catch-up mutation
  const resumeCampaignWithCatchUp = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: ResumeCampaignDto }) =>
      adminControlsApi.resumeCampaignWithCatchUp(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Campaign resumed with catch-up successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resume campaign');
    },
  });

  // Extend deadline mutation
  const extendDeadline = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ExtendDeadlineDto }) =>
      adminControlsApi.extendDeadline(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Deadline extended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to extend deadline');
    },
  });

  // Shorten deadline mutation
  const shortenDeadline = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ShortenDeadlineDto }) =>
      adminControlsApi.shortenDeadline(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Deadline shortened successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to shorten deadline');
    },
  });

  // Reassign reader mutation
  const reassignReader = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ReassignReaderDto }) =>
      adminControlsApi.reassignReader(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Reader reassigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reassign reader');
    },
  });

  // Cancel assignment mutation
  const cancelAssignment = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CancelAssignmentDto }) =>
      adminControlsApi.cancelAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast.success('Assignment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel assignment');
    },
  });

  // Request resubmission mutation
  const requestResubmission = useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: RequestResubmissionDto }) =>
      adminControlsApi.requestResubmission(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-issues'] });
      queryClient.invalidateQueries({ queryKey: ['open-issues'] });
      toast.success('Resubmission requested successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to request resubmission');
    },
  });

  // Get assignment exceptions query
  const useAssignmentExceptions = (bookId?: string, readerProfileId?: string, limit?: number) =>
    useQuery({
      queryKey: ['assignment-exceptions', bookId, readerProfileId, limit],
      queryFn: () => adminControlsApi.getAssignmentExceptions(bookId, readerProfileId, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Suspend author mutation
  const suspendAuthor = useMutation({
    mutationFn: ({ authorProfileId, data }: { authorProfileId: string; data: SuspendAuthorDto }) =>
      adminAuthorsApi.suspendAuthor(authorProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-author', variables.authorProfileId] });
      toast.success('Author suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend author');
    },
  });

  // Unsuspend author mutation
  const unsuspendAuthor = useMutation({
    mutationFn: ({ authorProfileId, data }: { authorProfileId: string; data: UnsuspendAuthorDto }) =>
      adminAuthorsApi.unsuspendAuthor(authorProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-author', variables.authorProfileId] });
      toast.success('Author unsuspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unsuspend author');
    },
  });

  // Update author admin notes mutation
  const updateAuthorNotes = useMutation({
    mutationFn: ({ authorProfileId, data }: { authorProfileId: string; data: UpdateAuthorNotesDto }) =>
      adminAuthorsApi.updateAdminNotes(authorProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-author', variables.authorProfileId] });
      toast.success('Admin notes updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update admin notes');
    },
  });

  // ============================================
  // SECTION 5.3 - CAMPAIGN CONTROL FEATURES
  // ============================================

  // Force complete campaign mutation
  const forceCompleteCampaign = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: ForceCompleteCampaignDto }) =>
      adminControlsApi.forceCompleteCampaign(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-health', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] });
      toast.success('Campaign force completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to force complete campaign');
    },
  });

  // Manual grant access mutation
  const manualGrantAccess = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: ManualGrantAccessDto }) =>
      adminControlsApi.manualGrantAccess(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      toast.success('Access granted to reader successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to grant access');
    },
  });

  // Remove reader from campaign mutation
  const removeReaderFromCampaign = useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: RemoveReaderFromCampaignDto }) =>
      adminControlsApi.removeReaderFromCampaign(bookId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-credit-transactions'] });
      toast.success('Reader removed from campaign successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove reader');
    },
  });

  // Get campaign report data query
  const useCampaignReportData = (bookId: string, enabled = false) =>
    useQuery({
      queryKey: ['campaign-report', bookId],
      queryFn: () => adminControlsApi.generateCampaignReport(bookId),
      staleTime: 60000,
      enabled: !!bookId && enabled,
    });

  return {
    useCampaignHealth,
    useCampaignAnalytics,
    useAllCampaigns,
    useAllAuthors,
    useAuthorDetails,
    useAuthorTransactionHistory,
    useAllCreditTransactions,
    useAssignmentExceptions,
    pauseCampaign,
    resumeCampaign,
    resumeCampaignWithCatchUp,
    adjustDistribution,
    addCredits,
    removeCredits,
    allocateCredits,
    adjustOverbooking,
    updateCampaignSettings,
    transferCredits,
    extendDeadline,
    shortenDeadline,
    reassignReader,
    cancelAssignment,
    requestResubmission,
    suspendAuthor,
    unsuspendAuthor,
    updateAuthorNotes,
    // Section 5.3 - Campaign control features
    forceCompleteCampaign,
    manualGrantAccess,
    removeReaderFromCampaign,
    useCampaignReportData,
  };
}
