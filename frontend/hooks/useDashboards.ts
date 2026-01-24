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
      staleTime: 3 * 60 * 1000, // 3 minutes - use cached data
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });

  /**
   * Get admin revenue analytics
   */
  const useAdminRevenueAnalytics = () =>
    useQuery({
      queryKey: ['admin-revenue-analytics'],
      queryFn: () => dashboardsApi.getAdminRevenueAnalytics(),
      staleTime: 5 * 60 * 1000, // 5 minutes - use cached data
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
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

  /**
   * Get author activity feed (Section 2.1)
   */
  const useAuthorActivityFeed = () =>
    useQuery({
      queryKey: ['author-activity-feed'],
      queryFn: () => dashboardsApi.getAuthorActivityFeed(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
    });

  // ============================================
  // READER DASHBOARD
  // ============================================

  /**
   * Get reader performance stats (detailed dashboard stats)
   * Note: Uses different query key than useReaders.useReaderStats() which returns simple stats
   */
  const useReaderStats = () =>
    useQuery({
      queryKey: ['reader-performance-stats'],
      queryFn: () => dashboardsApi.getReaderStats(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
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
    useAuthorActivityFeed,
    // Reader
    useReaderStats,
  };
}
