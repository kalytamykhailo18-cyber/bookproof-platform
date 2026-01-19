'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingProfile: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login');
      } else if (user.role !== UserRole.ADMIN) {
        // Authenticated but not an admin - redirect to appropriate dashboard
        if (user.role === UserRole.AFFILIATE) {
          router.push('/affiliate/dashboard');
        } else if (user.role === UserRole.AUTHOR) {
          router.push('/author/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading state while redirecting
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
