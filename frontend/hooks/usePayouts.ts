import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  requestPayout,
  getMyPayouts,
  getWalletTransactions,
  getWalletSummary,
  getPendingPayouts,
  getAllPayouts,
  approvePayout,
  rejectPayout,
  completePayout,
  RequestPayoutData,
  ApprovePayoutData,
  RejectPayoutData,
  CompletePayoutData,
  PayoutResponse,
  WalletTransaction,
  WalletSummary,
} from '@/lib/api/payouts';

// Reader hooks
export function useMyPayouts() {
  return useQuery<PayoutResponse[]>({
    queryKey: ['payouts', 'my-payouts'],
    queryFn: getMyPayouts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWalletTransactions() {
  return useQuery<WalletTransaction[]>({
    queryKey: ['wallet', 'transactions'],
    queryFn: getWalletTransactions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useWalletSummary() {
  return useQuery<WalletSummary>({
    queryKey: ['wallet', 'summary'],
    queryFn: getWalletSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestPayoutData) => requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', 'my-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['reader', 'stats'] });
      toast.success('Payout request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit payout request');
    },
  });
}

// Admin hooks
export function usePendingPayouts() {
  return useQuery<PayoutResponse[]>({
    queryKey: ['payouts', 'pending'],
    queryFn: getPendingPayouts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAllPayouts() {
  return useQuery<PayoutResponse[]>({
    queryKey: ['payouts', 'all'],
    queryFn: getAllPayouts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovePayoutData }) =>
      approvePayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success('Payout approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payout');
    },
  });
}

export function useRejectPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectPayoutData }) =>
      rejectPayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success('Payout rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject payout');
    },
  });
}

export function useCompletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompletePayoutData }) =>
      completePayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast.success('Payout marked as completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete payout');
    },
  });
}
