'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import { type Notification, NotificationType } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onNotificationClick?: (notificationId: string, actionUrl?: string) => void;
  compact?: boolean;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.PAYMENT:
      return <DollarSign className="h-5 w-5 text-green-600" />;
    case NotificationType.REVIEW:
      return <BookOpen className="h-5 w-5 text-blue-600" />;
    case NotificationType.CAMPAIGN:
      return <FileText className="h-5 w-5 text-purple-600" />;
    case NotificationType.ADMIN:
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    case NotificationType.SYSTEM:
      return <Info className="h-5 w-5 text-gray-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
}

/**
 * NotificationList Component
 *
 * Displays a list of notifications with icons, titles, and timestamps
 */
export function NotificationList({
  notifications,
  isLoading,
  onNotificationClick,
  compact = false,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-md border animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4 animate-zoom-in-fast">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="font-medium text-sm mb-1 animate-fade-up-fast">No notifications</h3>
        <p className="text-xs text-muted-foreground animate-fade-up-normal">
          You're all caught up!
        </p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y', compact ? 'space-y-0' : 'space-y-1 p-2')}>
      {notifications.map((notification, index) => {
        const animationClass = [
          'animate-fade-up-fast',
          'animate-fade-up-normal',
          'animate-fade-left-fast',
        ][index % 3];

        return (
          <div
            key={notification.id}
            onClick={() =>
              onNotificationClick?.(notification.id, notification.actionUrl)
            }
            className={cn(
              'flex items-start gap-3 transition-colors cursor-pointer',
              compact ? 'p-3 hover:bg-muted/50' : 'p-4 rounded-md hover:bg-muted/80',
              !notification.isRead && 'bg-blue-50/50',
              animationClass,
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 rounded-full p-2',
                !notification.isRead ? 'bg-background' : 'bg-muted',
              )}
            >
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4
                  className={cn(
                    'text-sm leading-tight',
                    !notification.isRead ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 mt-1 animate-zoom-in-fast" />
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                {notification.message}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {notification.actionUrl && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 hover:underline">View</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
