import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  refundsApi,
  RefundRequest,
  RefundEligibility,
  CreateRefundRequestDto,
  AdminRefundDecisionDto,
  RefundRequestStatus,
} from '@/lib/api/refunds';

// Query keys
const REFUND_KEYS = {
  all: ['refunds'] as const,
  eligibility: (creditPurchaseId: string) =>
    [...REFUND_KEYS.all, 'eligibility', creditPurchaseId] as const,
  myRequests: () => [...REFUND_KEYS.all, 'my-requests'] as const,
  request: (id: string) => [...REFUND_KEYS.all, 'request', id] as const,
  adminRequests: (status?: RefundRequestStatus) =>
    [...REFUND_KEYS.all, 'admin-requests', status] as const,
};

/**
 * Hook to check refund eligibility for a purchase
 */
export function useRefundEligibility(creditPurchaseId: string | undefined) {
  return useQuery({
    queryKey: REFUND_KEYS.eligibility(creditPurchaseId || ''),
    queryFn: () => refundsApi.checkEligibility(creditPurchaseId!),
    enabled: !!creditPurchaseId,
  });
}

/**
 * Hook to get all refund requests for the current author
 */
export function useMyRefundRequests() {
  return useQuery({
    queryKey: REFUND_KEYS.myRequests(),
    queryFn: () => refundsApi.getMyRequests(),
  });
}

/**
 * Hook to get a specific refund request
 */
export function useRefundRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: REFUND_KEYS.request(requestId || ''),
    queryFn: () => refundsApi.getRequest(requestId!),
    enabled: !!requestId,
  });
}

/**
 * Hook to create a refund request
 */
export function useCreateRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRefundRequestDto) => refundsApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFUND_KEYS.myRequests() });
    },
  });
}

/**
 * Hook to cancel a pending refund request
 */
export function useCancelRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => refundsApi.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFUND_KEYS.myRequests() });
    },
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

/**
 * Hook to get all refund requests (admin)
 */
export function useAdminRefundRequests(filters?: {
  status?: RefundRequestStatus;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: REFUND_KEYS.adminRequests(filters?.status),
    queryFn: () => refundsApi.getAllRequests(filters),
  });
}

/**
 * Hook to get a specific refund request (admin)
 */
export function useAdminRefundRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: REFUND_KEYS.request(requestId || ''),
    queryFn: () => refundsApi.getRequestAdmin(requestId!),
    enabled: !!requestId,
  });
}

/**
 * Hook to process a refund request (admin)
 */
export function useProcessRefundRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      decision,
    }: {
      requestId: string;
      decision: AdminRefundDecisionDto;
    }) => refundsApi.processRequest(requestId, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFUND_KEYS.all });
    },
  });
}
