'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/api/auth';
import { Loader2 } from 'lucide-react';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { CloserSidebar } from '@/components/closer/CloserSidebar';

export default function CloserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, isLoadingProfile: isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push(`/${locale}/login`);
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

  // Only show loading state if we don't have user data yet
  if (isLoading && !user) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <CloserSidebar />

      {/* Main Content */}
      <div className="pl-64 transition-all duration-300">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
