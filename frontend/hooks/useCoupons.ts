import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  couponsApi,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  CouponResponseDto,
  CouponValidationResponseDto,
  CouponUsageStatsDto,
  ManualApplyCouponDto,
  CouponAppliesTo,
} from '@/lib/api/coupons';

// Query keys
export const couponKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters?: { isActive?: boolean; appliesTo?: CouponAppliesTo }) =>
    [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, 'detail'] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
  usage: (id: string) => [...couponKeys.all, 'usage', id] as const,
  validation: (code: string) => [...couponKeys.all, 'validate', code] as const,
};

/**
 * Hook to get all coupons (Admin only)
 */
export function useCoupons(filters?: {
  isActive?: boolean;
  appliesTo?: CouponAppliesTo;
}) {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: () => couponsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get a single coupon by ID (Admin only)
 */
export function useCoupon(id: string) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get coupon usage statistics (Admin only)
 */
export function useCouponUsageStats(id: string) {
  return useQuery({
    queryKey: couponKeys.usage(id),
    queryFn: () => couponsApi.getUsageStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to validate a coupon
 */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: ValidateCouponDto) => couponsApi.validate(data),
  });
}

/**
 * Hook to create a coupon (Admin only)
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponDto) => couponsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      toast.success('Coupon created successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create coupon';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a coupon (Admin only)
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) =>
      couponsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(data.id) });
      toast.success('Coupon updated successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to update coupon';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a coupon (Admin only)
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      toast.success('Coupon deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete coupon';
      toast.error(message);
    },
  });
}

/**
 * Hook to manually apply a coupon (Admin only)
 */
export function useManualApplyCoupon() {
  return useMutation({
    mutationFn: (data: ManualApplyCouponDto) => couponsApi.manualApply(data),
    onSuccess: () => {
      toast.success('Coupon applied successfully');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to apply coupon';
      toast.error(message);
    },
  });
}
