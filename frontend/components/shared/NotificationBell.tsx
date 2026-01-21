'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { NotificationList } from './NotificationList';
import { useRealtimeUpdates, RealtimeEventType } from '@/hooks/useRealtimeUpdates';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Notification Bell Component
 *
 * Displays a bell icon with unread count badge in the header.
 * Shows a dropdown with recent notifications when clicked.
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  // Get unread count
  const { data: unreadCount = 0 } = useUnreadCount();

  // Get recent notifications (limit to 10 for dropdown)
  const { data: notificationData, isLoading } = useNotifications({
    page: 1,
    limit: 10,
  });

  // Mark as read mutation
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  // Subscribe to real-time notification events
  useRealtimeUpdates({
    showNotifications: false, // We'll handle display manually
    onEvent: {
      [RealtimeEventType.NOTIFICATION]: () => {
        // Invalidate queries to refetch notifications
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    },
  });

  // Handle notification click
  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    // Mark as read
    markAsRead([notificationId]);

    // Navigate if actionUrl exists
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Handle view all click
  const handleViewAll = () => {
    setIsOpen(false);
    router.push(`/${locale}/reader/notifications`); // Navigate to full notifications page
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative animate-fade-in-fast"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs animate-zoom-in-fast"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 max-h-[600px] overflow-hidden p-0 animate-fade-down-fast"
      >
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[480px]">
          <NotificationList
            notifications={notificationData?.notifications || []}
            isLoading={isLoading}
            onNotificationClick={handleNotificationClick}
            compact
          />
        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full text-sm h-10 rounded-none"
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
