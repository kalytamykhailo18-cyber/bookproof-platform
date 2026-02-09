import { useQuery } from '@tanstack/react-query';
import { dashboardsApi } from '@/lib/api/dashboards';
import { useAuth } from './useAuth';

export function useDashboards() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const userId = user?.id;

  // ============================================
  // ADMIN DASHBOARD
  // ============================================

  /**
   * Get admin dashboard with platform overview
   */
  const useAdminDashboard = () =>
    useQuery({
      // Include userId in key to prevent cross-user cache issues
      queryKey: ['admin-dashboard', userId],
      queryFn: () => dashboardsApi.getAdminDashboard(),
      enabled: isAdmin && !!userId, // Only fetch when user is admin AND we have userId
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    });

  /**
   * Get admin revenue analytics
   */
  const useAdminRevenueAnalytics = () =>
    useQuery({
      queryKey: ['admin-revenue-analytics', userId],
      queryFn: () => dashboardsApi.getAdminRevenueAnalytics(),
      enabled: isAdmin && !!userId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    });

  /**
   * Get author transaction history for admin
   */
  const useAuthorTransactionsForAdmin = (authorProfileId: string) =>
    useQuery({
      queryKey: ['admin-author-transactions', userId, authorProfileId],
      queryFn: () => dashboardsApi.getAuthorTransactionsForAdmin(authorProfileId),
      enabled: isAdmin && !!userId && !!authorProfileId,
      staleTime: 30000,
      retry: false,
    });

  /**
   * Get reader performance stats for admin
   */
  const useReaderStatsForAdmin = (readerProfileId: string) =>
    useQuery({
      queryKey: ['admin-reader-stats', userId, readerProfileId],
      queryFn: () => dashboardsApi.getReaderStatsForAdmin(readerProfileId),
      enabled: isAdmin && !!userId && !!readerProfileId,
      staleTime: 30000,
      retry: false,
    });

  /**
   * Get campaign tracking for admin
   */
  const useCampaignTrackingForAdmin = (bookId: string) =>
    useQuery({
      queryKey: ['admin-campaign-tracking', userId, bookId],
      queryFn: () => dashboardsApi.getCampaignTrackingForAdmin(bookId),
      enabled: isAdmin && !!userId && !!bookId,
      staleTime: 30000,
      retry: false,
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
