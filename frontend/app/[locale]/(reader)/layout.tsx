'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoadingProfile: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push(`/${locale}/login`);
      } else if (user.role !== UserRole.READER) {
        // Authenticated but not a reader - redirect to appropriate dashboard
        if (user.role === UserRole.ADMIN) {
          router.push(`/${locale}/admin/dashboard`);
        } else if (user.role === UserRole.AFFILIATE) {
          router.push(`/${locale}/affiliate/dashboard`);
        } else if (user.role === UserRole.AUTHOR) {
          router.push(`/${locale}/author`);
        } else if (user.role === UserRole.CLOSER) {
          router.push(`/${locale}/closer`);
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
  if (!user || user.role !== UserRole.READER) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
