'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { readerBehaviorApi } from '@/lib/api/reader-behavior';
import type {
  CreateBehaviorFlagDto,
  InvestigateBehaviorFlagDto,
  TakeActionDto,
  GetBehaviorFlagsQuery,
  BehaviorFlagResponse,
  ReaderBehaviorReport,
  SuspiciousReader,
  BehaviorStats,
} from '@/lib/api/reader-behavior';

// Query keys
const READER_BEHAVIOR_KEY = 'reader-behavior';
const SUSPICIOUS_READERS_KEY = 'suspicious-readers';
const BEHAVIOR_FLAGS_KEY = 'behavior-flags';
const BEHAVIOR_STATS_KEY = 'behavior-stats';

/**
 * Hook for getting suspicious readers
 */
export function useSuspiciousReaders() {
  return useQuery<SuspiciousReader[]>({
    queryKey: [SUSPICIOUS_READERS_KEY],
    queryFn: () => readerBehaviorApi.getSuspiciousReaders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting behavior flags with optional filters
 */
export function useBehaviorFlags(query?: GetBehaviorFlagsQuery) {
  return useQuery<BehaviorFlagResponse[]>({
    queryKey: [BEHAVIOR_FLAGS_KEY, query],
    queryFn: () => readerBehaviorApi.getBehaviorFlags(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting behavior statistics
 */
export function useBehaviorStats() {
  return useQuery<BehaviorStats>({
    queryKey: [BEHAVIOR_STATS_KEY],
    queryFn: () => readerBehaviorApi.getBehaviorStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting reader behavior report
 */
export function useReaderBehaviorReport(readerProfileId: string) {
  return useQuery<ReaderBehaviorReport>({
    queryKey: [READER_BEHAVIOR_KEY, readerProfileId],
    queryFn: () => readerBehaviorApi.getReaderBehaviorReport(readerProfileId),
    enabled: !!readerProfileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for analyzing reader behavior
 */
export function useAnalyzeReaderBehavior(readerProfileId: string) {
  return useQuery<ReaderBehaviorReport>({
    queryKey: [READER_BEHAVIOR_KEY, 'analyze', readerProfileId],
    queryFn: () => readerBehaviorApi.analyzeReaderBehavior(readerProfileId),
    enabled: !!readerProfileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for flagging a suspicious reader
 */
export function useFlagSuspiciousReader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBehaviorFlagDto) => readerBehaviorApi.flagSuspiciousReader(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUSPICIOUS_READERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_FLAGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [READER_BEHAVIOR_KEY] });
      toast.success('Reader flagged successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to flag reader');
    },
  });
}

/**
 * Hook for investigating a behavior flag
 */
export function useInvestigateBehaviorFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, data }: { flagId: string; data: InvestigateBehaviorFlagDto }) =>
      readerBehaviorApi.investigateBehaviorFlag(flagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUSPICIOUS_READERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_FLAGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [READER_BEHAVIOR_KEY] });
      toast.success('Investigation notes updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update investigation');
    },
  });
}

/**
 * Hook for taking action on a behavior flag
 */
export function useTakeActionOnFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, data }: { flagId: string; data: TakeActionDto }) =>
      readerBehaviorApi.takeAction(flagId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SUSPICIOUS_READERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_FLAGS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEHAVIOR_STATS_KEY] });
      queryClient.invalidateQueries({ queryKey: [READER_BEHAVIOR_KEY] });
      toast.success(`Action taken: ${variables.data.action}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to take action');
    },
  });
}
