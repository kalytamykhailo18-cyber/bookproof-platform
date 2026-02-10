import { useAuthStore } from '@/stores/authStore';

/**
 * Simple auth hook that provides user and loading state from Zustand store
 * Replaces the old TanStack Query-based useAuth hook
 */
export function useAuth() {
  const { user, _hasHydrated } = useAuthStore();

  return {
    user,
    isLoadingProfile: !_hasHydrated, // Loading until Zustand has hydrated from localStorage
  };
}
