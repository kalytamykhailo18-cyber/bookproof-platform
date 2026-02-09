import { client } from './client';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  CAMPAIGN = 'CAMPAIGN',
  REVIEW = 'REVIEW',
  PAYMENT = 'PAYMENT',
  ADMIN = 'ADMIN',
  GENERAL = 'GENERAL',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  disabledTypes?: NotificationType[];
}

export interface UpdateNotificationSettingsDto {
  emailEnabled?: boolean;
  emailFrequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  disabledTypes?: NotificationType[];
}

/**
 * Get notifications for the current user
 */
export const getNotifications = async (
  params?: GetNotificationsParams,
): Promise<NotificationListResponse> => {
  const { data } = await client.get('/notifications', { params });
  return data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const { data } = await client.get('/notifications/unread-count');
  return data.count;
};

/**
 * Mark specific notifications as read
 */
export const markNotificationsAsRead = async (
  notificationIds: string[],
): Promise<{ updated: number }> => {
  const { data } = await client.post('/notifications/mark-read', {
    notificationIds,
  });
  return data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ updated: number }> => {
  const { data } = await client.post('/notifications/mark-all-read');
  return data;
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const { data } = await client.get('/notifications/settings');
  return data;
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  settings: UpdateNotificationSettingsDto,
): Promise<NotificationSettings> => {
  const { data } = await client.patch('/notifications/settings', settings);
  return data;
};
