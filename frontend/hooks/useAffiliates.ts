import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  affiliatesApi,
  RegisterAffiliateDto,
  ApproveAffiliateDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  AffiliateProfileResponseDto,
  AffiliateListItemDto,
  AffiliateStatsDto,
  CommissionResponseDto,
  PayoutResponseDto,
  CommissionStatus,
  PayoutRequestStatus,
} from '@/lib/api/affiliates';

// Query keys
export const affiliateKeys = {
  all: ['affiliates'] as const,
  profile: () => [...affiliateKeys.all, 'profile'] as const,
  stats: () => [...affiliateKeys.all, 'stats'] as const,
  referralLink: () => [...affiliateKeys.all, 'referral-link'] as const,
  commissions: () => [...affiliateKeys.all, 'commissions'] as const,
  commissionsByStatus: (status?: CommissionStatus) => [...affiliateKeys.commissions(), status] as const,
  payouts: () => [...affiliateKeys.all, 'payouts'] as const,
  listsAdmin: () => [...affiliateKeys.all, 'list-admin'] as const,
  detailAdmin: (id: string) => [...affiliateKeys.all, 'detail-admin', id] as const,
  commissionsAdmin: (id: string, status?: CommissionStatus) =>
    [...affiliateKeys.all, 'commissions-admin', id, status] as const,
  payoutsAdmin: (status?: PayoutRequestStatus) => [...affiliateKeys.all, 'payouts-admin', status] as const,
};

// Affiliate hooks
export function useAffiliateProfile() {
  return useQuery({
    queryKey: affiliateKeys.profile(),
    queryFn: () => affiliatesApi.getMe(),
  });
}

export function useAffiliateStats() {
  return useQuery({
    queryKey: affiliateKeys.stats(),
    queryFn: () => affiliatesApi.getStats(),
  });
}

export function useReferralLink() {
  return useQuery({
    queryKey: affiliateKeys.referralLink(),
    queryFn: () => affiliatesApi.getReferralLink(),
  });
}

export function useCommissions(status?: CommissionStatus) {
  return useQuery({
    queryKey: affiliateKeys.commissionsByStatus(status),
    queryFn: () => affiliatesApi.getCommissions(status),
  });
}

export function usePayouts() {
  return useQuery({
    queryKey: affiliateKeys.payouts(),
    queryFn: () => affiliatesApi.getPayouts(),
  });
}

// Mutations
export function useRegisterAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterAffiliateDto) => affiliatesApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.profile() });
      toast.success('Affiliate application submitted! Awaiting admin approval.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit affiliate application';
      toast.error(message);
    },
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestPayoutDto) => affiliatesApi.requestPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.stats() });
      toast.success('Payout request submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to request payout';
      toast.error(message);
    },
  });
}

// Admin hooks
export function useAffiliatesForAdmin() {
  return useQuery({
    queryKey: affiliateKeys.listsAdmin(),
    queryFn: () => affiliatesApi.getAllForAdmin(),
  });
}

export function useAffiliateByIdForAdmin(id: string) {
  return useQuery({
    queryKey: affiliateKeys.detailAdmin(id),
    queryFn: () => affiliatesApi.getByIdForAdmin(id),
    enabled: !!id,
  });
}

export function useCommissionsForAdmin(id: string, status?: CommissionStatus) {
  return useQuery({
    queryKey: affiliateKeys.commissionsAdmin(id, status),
    queryFn: () => affiliatesApi.getCommissionsForAdmin(id, status),
    enabled: !!id,
  });
}

export function usePayoutsForAdmin(status?: PayoutRequestStatus) {
  return useQuery({
    queryKey: affiliateKeys.payoutsAdmin(status),
    queryFn: () => affiliatesApi.getAllPayoutsForAdmin(status),
  });
}

// Admin mutations
export function useApproveAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveAffiliateDto }) =>
      affiliatesApi.approveAffiliate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.listsAdmin() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.detailAdmin(data.id) });
      toast.success(data.isApproved ? 'Affiliate approved successfully' : 'Affiliate rejected');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to process affiliate application';
      toast.error(message);
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessPayoutDto }) =>
      affiliatesApi.processPayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.payoutsAdmin() });
      toast.success('Payout processed successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to process payout';
      toast.error(message);
    },
  });
}

export function useToggleAffiliateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => affiliatesApi.toggleAffiliateActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.listsAdmin() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.detailAdmin(data.id) });
      toast.success(data.isActive ? 'Affiliate enabled' : 'Affiliate disabled');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to toggle affiliate status';
      toast.error(message);
    },
  });
}

export function useUpdateCommissionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, commissionRate }: { id: string; commissionRate: number }) =>
      affiliatesApi.updateCommissionRate(id, commissionRate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.listsAdmin() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.detailAdmin(data.id) });
      toast.success(`Commission rate updated to ${data.commissionRate}%`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update commission rate';
      toast.error(message);
    },
  });
}
