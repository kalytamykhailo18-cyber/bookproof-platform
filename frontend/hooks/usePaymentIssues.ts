'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentIssuesApi } from '@/lib/api/payment-issues';
import type {
  CreatePaymentIssueDto,
  ResolvePaymentIssueDto,
  ProcessRefundDto,
  UpdatePaymentIssueStatusDto,
  GetPaymentIssuesQuery,
  PaymentIssueResponse,
  PaymentIssueStats,
} from '@/lib/api/payment-issues';

// Query keys
const PAYMENT_ISSUES_KEY = 'payment-issues';
const PAYMENT_ISSUES_STATS_KEY = 'payment-issues-stats';
const PAYMENT_ISSUES_OPEN_KEY = 'payment-issues-open';

/**
 * Hook for getting payment issues with optional filters
 */
export function usePaymentIssues(query?: GetPaymentIssuesQuery) {
  return useQuery<PaymentIssueResponse[]>({
    queryKey: [PAYMENT_ISSUES_KEY, query],
    queryFn: () => paymentIssuesApi.getPaymentIssues(query),
    staleTime: 30000,
  });
}

/**
 * Hook for getting open payment issues
 */
export function useOpenPaymentIssues() {
  return useQuery<PaymentIssueResponse[]>({
    queryKey: [PAYMENT_ISSUES_OPEN_KEY],
    queryFn: () => paymentIssuesApi.getOpenPaymentIssues(),
    staleTime: 30000,
  });
}

/**
 * Hook for getting payment issue statistics
 */
export function usePaymentIssueStats() {
  return useQuery<PaymentIssueStats>({
    queryKey: [PAYMENT_ISSUES_STATS_KEY],
    queryFn: () => paymentIssuesApi.getPaymentIssueStats(),
    staleTime: 60000,
  });
}

/**
 * Hook for getting a single payment issue
 */
export function usePaymentIssue(issueId: string) {
  return useQuery<PaymentIssueResponse>({
    queryKey: [PAYMENT_ISSUES_KEY, issueId],
    queryFn: () => paymentIssuesApi.getPaymentIssueById(issueId),
    enabled: !!issueId,
    staleTime: 30000,
  });
}

/**
 * Hook for creating a payment issue
 */
export function useCreatePaymentIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentIssueDto) => paymentIssuesApi.createPaymentIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_STATS_KEY] });
      toast.success('Payment issue created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment issue');
    },
  });
}

/**
 * Hook for resolving a payment issue
 */
export function useResolvePaymentIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: ResolvePaymentIssueDto }) =>
      paymentIssuesApi.resolvePaymentIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_STATS_KEY] });
      toast.success('Payment issue resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resolve payment issue');
    },
  });
}

/**
 * Hook for processing a refund
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: ProcessRefundDto }) =>
      paymentIssuesApi.processRefund(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_STATS_KEY] });
      toast.success('Refund processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
  });
}

/**
 * Hook for reconciling a payment
 */
export function useReconcilePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, notes }: { issueId: string; notes: string }) =>
      paymentIssuesApi.reconcilePayment(issueId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_STATS_KEY] });
      toast.success('Payment reconciled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reconcile payment');
    },
  });
}

/**
 * Hook for updating payment issue status
 */
export function useUpdatePaymentIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: UpdatePaymentIssueStatusDto }) =>
      paymentIssuesApi.updatePaymentIssueStatus(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_OPEN_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYMENT_ISSUES_STATS_KEY] });
      toast.success('Payment issue status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payment issue status');
    },
  });
}
