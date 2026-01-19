'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { stripeApi } from '@/lib/api/stripe';
import type {
  CreateCheckoutSessionDto,
  CreateSubscriptionPlanDto,
  CreateSubscriptionCheckoutDto,
  CancelSubscriptionDto,
} from '@/lib/api/stripe';

export function useStripePayments() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // ============================================
  // ONE-TIME PAYMENTS
  // ============================================

  // Get payment transactions
  const useTransactions = () =>
    useQuery({
      queryKey: ['payment-transactions'],
      queryFn: () => stripeApi.payments.getTransactions(),
      staleTime: 30000,
    });

  // Get single transaction
  const useTransaction = (transactionId: string) =>
    useQuery({
      queryKey: ['payment-transaction', transactionId],
      queryFn: () => stripeApi.payments.getTransaction(transactionId),
      enabled: !!transactionId,
      staleTime: 30000,
    });

  // Get invoice
  const useInvoice = (creditPurchaseId: string) =>
    useQuery({
      queryKey: ['invoice', creditPurchaseId],
      queryFn: () => stripeApi.payments.getInvoice(creditPurchaseId),
      enabled: !!creditPurchaseId,
      staleTime: 60000,
    });

  // Create checkout session mutation
  const createCheckout = useMutation({
    mutationFn: (data: CreateCheckoutSessionDto) => stripeApi.payments.createCheckout(data),
    onSuccess: (response) => {
      // Redirect to Stripe checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    },
  });

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  // Get my subscription
  const useMySubscription = () =>
    useQuery({
      queryKey: ['my-subscription'],
      queryFn: () => stripeApi.subscriptions.getMySubscription(),
      staleTime: 30000,
      retry: 1, // Don't retry too many times if no subscription exists
    });

  // Get subscription details
  const useSubscriptionDetails = (subscriptionId: string) =>
    useQuery({
      queryKey: ['subscription-details', subscriptionId],
      queryFn: () => stripeApi.subscriptions.getSubscriptionDetails(subscriptionId),
      enabled: !!subscriptionId,
      staleTime: 30000,
    });

  // Get subscription management
  const useSubscriptionManagement = (subscriptionId: string) =>
    useQuery({
      queryKey: ['subscription-management', subscriptionId],
      queryFn: () => stripeApi.subscriptions.getSubscriptionManagement(subscriptionId),
      enabled: !!subscriptionId,
      staleTime: 30000,
    });

  // Create subscription plan (Admin only)
  const createPlan = useMutation({
    mutationFn: (data: CreateSubscriptionPlanDto) => stripeApi.subscriptions.createPlan(data),
    onSuccess: () => {
      toast.success('Subscription plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subscription plan');
    },
  });

  // Create subscription checkout
  const createSubscriptionCheckout = useMutation({
    mutationFn: (data: CreateSubscriptionCheckoutDto) =>
      stripeApi.subscriptions.createCheckout(data),
    onSuccess: (response) => {
      // Redirect to Stripe checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subscription checkout');
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: ({
      subscriptionId,
      data,
    }: {
      subscriptionId: string;
      data: CancelSubscriptionDto;
    }) => stripeApi.subscriptions.cancelSubscription(subscriptionId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-details'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-management'] });
      toast.success(response.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    },
  });

  return {
    // One-time payments
    useTransactions,
    useTransaction,
    useInvoice,
    createCheckout,
    // Subscriptions
    useMySubscription,
    useSubscriptionDetails,
    useSubscriptionManagement,
    createPlan,
    createSubscriptionCheckout,
    cancelSubscription,
  };
}
