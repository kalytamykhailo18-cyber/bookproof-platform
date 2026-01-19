'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingProfile: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login');
      } else if (user.role !== UserRole.READER) {
        // Authenticated but not a reader - redirect to appropriate dashboard
        if (user.role === UserRole.ADMIN) {
          router.push('/admin/dashboard');
        } else if (user.role === UserRole.AFFILIATE) {
          router.push('/affiliate/dashboard');
        } else if (user.role === UserRole.AUTHOR) {
          router.push('/author');
        } else if (user.role === UserRole.CLOSER) {
          router.push('/closer');
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
  if (!user || user.role !== UserRole.READER) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
