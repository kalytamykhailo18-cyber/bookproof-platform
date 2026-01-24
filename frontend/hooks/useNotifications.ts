'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  type GetNotificationsParams,
  type UpdateNotificationSettingsDto,
} from '@/lib/api/notifications';
import { toast } from 'sonner';

/**
 * Hook to get notifications with pagination and filtering
 */
export function useNotifications(params?: GetNotificationsParams) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to mark notifications as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Failed to mark notifications as read', {
        description: error.message || 'An error occurred',
      });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (data) => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (data.updated > 0) {
        toast.success('All notifications marked as read', {
          description: `${data.updated} notification${data.updated > 1 ? 's' : ''} updated`,
        });
      }
    },
    onError: (error: any) => {
      toast.error('Failed to mark all notifications as read', {
        description: error.message || 'An error occurred',
      });
    },
  });
}

/**
 * Hook to get notification settings
 */
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: getNotificationSettings,
  });
}

/**
 * Hook to update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] });
      toast.success('Notification settings updated', {
        description: 'Your preferences have been saved',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update settings', {
        description: error.message || 'An error occurred',
      });
    },
  });
}
