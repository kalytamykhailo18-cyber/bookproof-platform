import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserData } from '@/lib/api/auth';

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
  // Admin role helpers for role-based access control (Section 5.1, 5.5)
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
      // Check if user is a SUPER_ADMIN (full access to financial data)
      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN' && user?.adminRole === 'SUPER_ADMIN';
      },
      // Check if user is any type of admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },
      // Check if user has a specific permission
      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user || user.role !== 'ADMIN') return false;
        // Super admins have all permissions
        if (user.adminRole === 'SUPER_ADMIN') return true;
        return user.adminPermissions?.includes(permission) || false;
      },
    }),
    {
      name: 'bookproof-auth',
    }
  )
);
