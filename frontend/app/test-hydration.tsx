'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function TestHydration() {
  const { _hasHydrated, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.log('🔍 HYDRATION CHECK:', {
      _hasHydrated,
      isAuthenticated,
      hasUser: !!user,
      timestamp: new Date().toISOString(),
    });
  }, [_hasHydrated, isAuthenticated, user]);

  return null;
}
