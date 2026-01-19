'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardsApi } from '@/lib/api/dashboards';

export function useDashboards() {
  // ============================================
  // ADMIN DASHBOARD
  // ============================================

  /**
   * Get admin dashboard with platform overview
   */
  const useAdminDashboard = () =>
    useQuery({
      queryKey: ['admin-dashboard'],
      queryFn: () => dashboardsApi.getAdminDashboard(),
      staleTime: 30000,
      refetchInterval: 60000, // Refresh every minute
    });

  /**
   * Get admin revenue analytics
   */
  const useAdminRevenueAnalytics = () =>
    useQuery({
      queryKey: ['admin-revenue-analytics'],
      queryFn: () => dashboardsApi.getAdminRevenueAnalytics(),
      staleTime: 60000,
    });

  /**
   * Get author transaction history for admin
   */
  const useAuthorTransactionsForAdmin = (authorProfileId: string) =>
    useQuery({
      queryKey: ['admin-author-transactions', authorProfileId],
      queryFn: () => dashboardsApi.getAuthorTransactionsForAdmin(authorProfileId),
      enabled: !!authorProfileId,
      staleTime: 30000,
    });

  /**
   * Get reader performance stats for admin
   */
  const useReaderStatsForAdmin = (readerProfileId: string) =>
    useQuery({
      queryKey: ['admin-reader-stats', readerProfileId],
      queryFn: () => dashboardsApi.getReaderStatsForAdmin(readerProfileId),
      enabled: !!readerProfileId,
      staleTime: 30000,
    });

  /**
   * Get campaign tracking for admin
   */
  const useCampaignTrackingForAdmin = (bookId: string) =>
    useQuery({
      queryKey: ['admin-campaign-tracking', bookId],
      queryFn: () => dashboardsApi.getCampaignTrackingForAdmin(bookId),
      enabled: !!bookId,
      staleTime: 30000,
    });

  // ============================================
  // AUTHOR DASHBOARD
  // ============================================

  /**
   * Get campaign tracking for author
   */
  const useCampaignTracking = (bookId: string) =>
    useQuery({
      queryKey: ['campaign-tracking', bookId],
      queryFn: () => dashboardsApi.getCampaignTracking(bookId),
      enabled: !!bookId,
      staleTime: 30000,
      refetchInterval: 60000, // Refresh every minute
    });

  /**
   * Get transaction history for author
   */
  const useTransactionHistory = () =>
    useQuery({
      queryKey: ['transaction-history'],
      queryFn: () => dashboardsApi.getTransactionHistory(),
      staleTime: 30000,
    });

  // ============================================
  // READER DASHBOARD
  // ============================================

  /**
   * Get reader performance stats
   */
  const useReaderStats = () =>
    useQuery({
      queryKey: ['reader-stats'],
      queryFn: () => dashboardsApi.getReaderStats(),
      staleTime: 30000,
      refetchInterval: 60000, // Refresh every minute
    });

  return {
    // Admin
    useAdminDashboard,
    useAdminRevenueAnalytics,
    useAuthorTransactionsForAdmin,
    useReaderStatsForAdmin,
    useCampaignTrackingForAdmin,
    // Author
    useCampaignTracking,
    useTransactionHistory,
    // Reader
    useReaderStats,
  };
}
