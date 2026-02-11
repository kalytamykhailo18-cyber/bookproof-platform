import { create } from 'zustand';

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: (amount?: number) => void;
  clearUnreadCount: () => void;
}

/**
 * Notification State Store
 *
 * Shared state for notification count across all components.
 * Ensures NotificationBell header updates when notifications are marked as read
 * from any component (Notifications page, Bell dropdown, etc.)
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  decrementUnreadCount: (amount = 1) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - amount) })),

  clearUnreadCount: () => set({ unreadCount: 0 }),
}));
