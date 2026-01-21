'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';

export default function CloserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoadingProfile: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login');
      } else if (user.role !== UserRole.CLOSER) {
        // Authenticated but not a closer - redirect to appropriate dashboard
        if (user.role === UserRole.ADMIN) {
          router.push(`/${locale}/admin/dashboard`);
        } else if (user.role === UserRole.AFFILIATE) {
          router.push(`/${locale}/affiliate/dashboard`);
        } else if (user.role === UserRole.AUTHOR) {
          router.push(`/${locale}/author`);
        } else if (user.role === UserRole.READER) {
          router.push(`/${locale}/reader`);
        } else {
          router.push(`/${locale}`);
        }
      }
    }
  }, [user, isLoading, router, locale]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading state while redirecting
  if (!user || user.role !== UserRole.CLOSER) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
