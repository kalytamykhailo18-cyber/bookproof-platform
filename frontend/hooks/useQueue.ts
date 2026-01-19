'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  queueApi,
  Assignment,
  AvailableCampaign,
  ApplyToCampaignRequest,
} from '@/lib/api/queue';
import { useLoading } from '@/components/providers/LoadingProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useAvailableCampaigns() {
  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['available-campaigns'],
    queryFn: queueApi.getAvailableCampaigns,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    campaigns,
    isLoadingCampaigns,
    refetchCampaigns,
  };
}

export function useMyAssignments() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  // Get all my assignments
  const {
    data: assignments,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: queueApi.getMyAssignments,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Apply to campaign mutation
  const applyToCampaignMutation = useMutation({
    mutationFn: (data: ApplyToCampaignRequest) => {
      startLoading('Applying to campaign...');
      return queueApi.applyToCampaign(data);
    },
    onSuccess: (newAssignment) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['available-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['reader-stats'] });
      toast.success('Successfully applied to campaign!');
      router.push(`/reader/assignments/${newAssignment.id}`);
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to apply to campaign';
      toast.error(message);
    },
  });

  // Withdraw from assignment mutation
  const withdrawMutation = useMutation({
    mutationFn: (assignmentId: string) => {
      startLoading('Withdrawing from assignment...');
      return queueApi.withdrawFromAssignment(assignmentId);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['available-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['reader-stats'] });
      toast.success('Successfully withdrawn from assignment');
      router.push('/reader');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to withdraw from assignment';
      toast.error(message);
    },
  });

  // Track ebook download mutation (also updates status to IN_PROGRESS)
  const trackEbookDownloadMutation = useMutation({
    mutationFn: (assignmentId: string) => {
      return queueApi.trackEbookDownload(assignmentId);
    },
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
    },
    onError: (error: any) => {
      console.error('Failed to track ebook download:', error);
    },
  });

  // Track audiobook access mutation (also updates status to IN_PROGRESS)
  const trackAudiobookAccessMutation = useMutation({
    mutationFn: (assignmentId: string) => {
      return queueApi.trackAudiobookAccess(assignmentId);
    },
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
    },
    onError: (error: any) => {
      console.error('Failed to track audiobook access:', error);
    },
  });

  // Group assignments by status
  const groupedAssignments = assignments?.reduce((acc, assignment) => {
    const status = assignment.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  return {
    assignments,
    groupedAssignments,
    isLoadingAssignments,
    refetchAssignments,
    applyToCampaign: applyToCampaignMutation.mutate,
    isApplying: applyToCampaignMutation.isPending,
    withdrawFromAssignment: withdrawMutation.mutate,
    isWithdrawing: withdrawMutation.isPending,
    trackEbookDownload: trackEbookDownloadMutation.mutate,
    trackAudiobookAccess: trackAudiobookAccessMutation.mutate,
  };
}

export function useAssignment(assignmentId: string) {
  const {
    data: assignment,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => queueApi.getAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    assignment,
    isLoading,
    refetch,
  };
}
