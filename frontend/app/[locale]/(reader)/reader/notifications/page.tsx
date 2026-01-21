'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationList } from '@/components/shared/NotificationList';
import { Settings, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { NotificationType } from '@/lib/api/notifications';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL');

  // Get notifications
  const { data: notificationData, isLoading } = useNotifications({
    page: 1,
    limit: 50,
    unreadOnly: filter === 'unread',
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
  });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markAsRead([notificationId]);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex animate-fade-up items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated with your campaign activity and system messages
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="animate-fade-left" onClick={() => router.push(`/${locale}/reader/notifications/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          {notificationData && notificationData.unreadCount > 0 && (
            <Button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="animate-fade-left-fast"
            >
              {isMarkingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark All Read ({notificationData.unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4 animate-fade-up-fast">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notificationData && notificationData.unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {notificationData.unreadCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Type Filter */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={typeFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('ALL')}
              >
                All Types
              </Button>
              <Button
                type="button"
                variant={typeFilter === NotificationType.CAMPAIGN ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(NotificationType.CAMPAIGN)}
              >
                Campaigns
              </Button>
              <Button
                type="button"
                variant={typeFilter === NotificationType.REVIEW ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(NotificationType.REVIEW)}
              >
                Reviews
              </Button>
              <Button
                type="button"
                variant={typeFilter === NotificationType.PAYMENT ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(NotificationType.PAYMENT)}
              >
                Payments
              </Button>
            </div>
          </div>
        </Tabs>
      </Card>

      {/* Notification List */}
      <Card className="animate-fade-up-normal">
        <NotificationList
          notifications={notificationData?.notifications || []}
          isLoading={isLoading}
          onNotificationClick={handleNotificationClick}
        />
      </Card>

      {/* Pagination Info */}
      {notificationData && notificationData.total > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground animate-fade-up-slow">
          Showing {notificationData.notifications.length} of {notificationData.total} notifications
        </div>
      )}
    </div>
  );
}
