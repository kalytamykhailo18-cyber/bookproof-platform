import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getNotifications, getUnreadCount, markNotificationsAsRead, markAllNotificationsAsRead } from '@/lib/api/notifications';
import { toast } from 'sonner';
import { NotificationList } from './NotificationList';
import { useRealtimeUpdates, RealtimeEventType } from '@/hooks/useRealtimeUpdates';
import { useAuthStore } from '@/stores/authStore';

/**
 * Notification Bell Component
 *
 * Displays a bell icon with unread count badge in the header.
 * Shows a dropdown with recent notifications when clicked.
 * Requirement 13.1: Bell icon in header with unread count badge
 */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { user } = useAuthStore();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationData, setNotificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unread count and notifications - memoized to prevent recreation
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [countData, notifData] = await Promise.all([
        getUnreadCount(),
        getNotifications({ page: 1, limit: 10 })
      ]);
      setUnreadCount(countData);
      setNotificationData(notifData);
    } catch (error: any) {
      console.error('Notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Memoize onEvent to prevent SSE reconnection loop
  const realtimeEventHandlers = useMemo(() => ({
    [RealtimeEventType.NOTIFICATION]: () => {
      // Refetch notifications on new notification event
      fetchNotifications();
    },
  }), [fetchNotifications]);

  // Subscribe to real-time notification events
  useRealtimeUpdates({
    showNotifications: false, // We'll handle display manually
    onEvent: realtimeEventHandlers,
  });

  // Handle notification click
  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    try {
      // Mark as read
      await markNotificationsAsRead([notificationId]);
      // Refetch notifications
      await fetchNotifications();
    } catch (error: any) {
      console.error('Mark as read error:', error);
      toast.error('Failed to mark notifications as read');
    }

    // Navigate if actionUrl exists
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const data = await markAllNotificationsAsRead();
      if (data.updated > 0) {
        toast.success('All notifications marked as read', {
          description: `${data.updated} notification${data.updated > 1 ? 's' : ''} updated`,
        });
      }
      // Refetch notifications
      await fetchNotifications();
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Handle view all click - navigate based on user role (Requirement 13.1)
  const handleViewAll = () => {
    setIsOpen(false);
    // Navigate to role-specific notifications page
    let basePath = 'reader'; // Default
    if (user?.role) {
      switch (user.role) {
        case 'AUTHOR':
          basePath = 'author';
          break;
        case 'ADMIN':
          basePath = 'admin';
          break;
        case 'AFFILIATE':
          basePath = 'affiliate';
          break;
        case 'READER':
        default:
          basePath = 'reader';
          break;
      }
    }
    navigate(`/${basePath}/notifications`);
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
