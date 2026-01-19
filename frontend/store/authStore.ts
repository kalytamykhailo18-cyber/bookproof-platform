import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserData } from '@/lib/api/auth';

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'bookproof-auth',
    }
  )
);
