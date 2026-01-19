'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creditsApi, PurchaseCreditRequest } from '@/lib/api/credits';
import { useLoading } from '@/components/providers/LoadingProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useCredits() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();

  // Get all package tiers
  const { data: packageTiers, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['package-tiers'],
    queryFn: creditsApi.getPackageTiers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get credit balance
  const {
    data: creditBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: creditsApi.getCreditBalance,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Get purchase history
  const {
    data: purchaseHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['purchase-history'],
    queryFn: creditsApi.getPurchaseHistory,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create checkout session mutation
  const createCheckoutMutation = useMutation({
    mutationFn: (data: PurchaseCreditRequest) => {
      startLoading('Creating checkout session...');
      return creditsApi.createCheckoutSession(data);
    },
    onSuccess: (response) => {
      stopLoading();
      // Redirect to Stripe checkout
      if (typeof window !== 'undefined' && response.url) {
        window.location.href = response.url;
      }
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to create checkout session';
      toast.error(message);
    },
  });

  // Function to initiate purchase
  const purchaseCredits = (
    packageTierId: string,
    couponCode?: string,
    includeKeywordResearch?: boolean
  ) => {
    const successUrl = `${window.location.origin}/author/credits/success`;
    const cancelUrl = `${window.location.origin}/author/credits/cancel`;

    createCheckoutMutation.mutate({
      packageTierId,
      couponCode,
      includeKeywordResearch,
      successUrl,
      cancelUrl,
    });
  };

  return {
    packageTiers,
    isLoadingPackages,
    creditBalance,
    isLoadingBalance,
    purchaseHistory,
    isLoadingHistory,
    purchaseCredits,
    isPurchasing: createCheckoutMutation.isPending,
    refetchBalance,
    refetchHistory,
  };
}
