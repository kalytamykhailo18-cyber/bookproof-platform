import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { disputesApi } from '@/lib/api/disputes';
import type {
  CreateDisputeDto,
  ResolveDisputeDto,
  EscalateDisputeDto,
  UpdateDisputeStatusDto,
  GetDisputesQuery,
  DisputeResponse,
  DisputeStats,
  FileAppealDto,
  ResolveAppealDto,
  SlaStats,
} from '@/lib/api/disputes';

// Query keys
const DISPUTES_KEY = 'disputes';
const DISPUTES_STATS_KEY = 'disputes-stats';
const DISPUTES_OPEN_KEY = 'disputes-open';
const SLA_STATS_KEY = 'sla-stats';

/**
 * Hook for managing disputes
 */
export function useDisputes(query?: GetDisputesQuery) {
  return useQuery<DisputeResponse[]>({
    queryKey: [DISPUTES_KEY, query],
    queryFn: () => disputesApi.getDisputes(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting open disputes
 */
export function useOpenDisputes() {
  return useQuery<DisputeResponse[]>({
    queryKey: [DISPUTES_OPEN_KEY],
    queryFn: () => disputesApi.getOpenDisputes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting dispute statistics
 */
export function useDisputeStats() {
  return useQuery<DisputeStats>({
    queryKey: [DISPUTES_STATS_KEY],
    queryFn: () => disputesApi.getDisputeStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting a single dispute
 */
export function useDispute(disputeId: string) {
  return useQuery<DisputeResponse>({
    queryKey: [DISPUTES_KEY, disputeId],
    queryFn: () => disputesApi.getDisputeById(disputeId),
    enabled: !!disputeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting disputes by user
 */
export function useUserDisputes(userId: string) {
  return useQuery<DisputeResponse[]>({
    queryKey: [DISPUTES_KEY, 'user', userId],
    queryFn: () => disputesApi.getDisputesByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating a dispute
 */
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisputeDto) => disputesApi.createDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Dispute created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create dispute');
    },
  });
}

/**
 * Hook for resolving a dispute
 */
export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: ResolveDisputeDto }) =>
      disputesApi.resolveDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Dispute resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resolve dispute');
    },
  });
}

/**
 * Hook for escalating a dispute
 */
export function useEscalateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: EscalateDisputeDto }) =>
      disputesApi.escalateDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Dispute escalated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to escalate dispute');
    },
  });
}

/**
 * Hook for updating dispute status
 */
export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: UpdateDisputeStatusDto }) =>
      disputesApi.updateDisputeStatus(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Dispute status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update dispute status');
    },
  });
}

/**
 * Hook for getting SLA compliance statistics
 */
export function useSlaStats() {
  return useQuery<SlaStats>({
    queryKey: [SLA_STATS_KEY],
    queryFn: () => disputesApi.getSlaStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for filing an appeal on a dispute (one per issue)
 */
export function useFileAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: FileAppealDto }) =>
      disputesApi.fileAppeal(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Appeal filed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to file appeal');
    },
  });
}

/**
 * Hook for resolving an appeal (admin only)
 */
export function useResolveAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: { disputeId: string; data: ResolveAppealDto }) =>
      disputesApi.resolveAppeal(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DISPUTES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DISPUTES_STATS_KEY] });
      toast.success('Appeal resolved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resolve appeal');
    },
  });
}
