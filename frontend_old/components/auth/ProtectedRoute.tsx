'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('AUTHOR' | 'READER' | 'ADMIN' | 'CLOSER' | 'AFFILIATE')[];
  requireEmailVerified?: boolean;
  requireTermsAccepted?: boolean; // For authors who need to accept terms
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireEmailVerified = false,
  requireTermsAccepted = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoadingProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Section 16.1: Unauthorized (401) - Preserve intended destination
  useEffect(() => {
    if (!isLoadingProfile && !isAuthenticated) {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      const returnUrl = encodeURIComponent(currentPath);
      router.push(`/${locale}/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoadingProfile, router, pathname, searchParams, locale]);

  // Section 16.1: Forbidden (403) - Redirect to forbidden page
  useEffect(() => {
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(`/${locale}/forbidden`);
    }
  }, [user, allowedRoles, router, locale]);

  useEffect(() => {
    if (user && requireEmailVerified && !user.emailVerified) {
      router.push(`/${locale}/verify-email-required`);
    }
  }, [user, requireEmailVerified, router, locale]);

  // Check if author needs to accept terms of service
  useEffect(() => {
    if (user && requireTermsAccepted && user.role === 'AUTHOR' && user.termsAccepted === false) {
      router.push(`/${locale}/accept-terms`);
    }
  }, [user, requireTermsAccepted, router, locale]);

  // Only show loading spinner if we don't have user data yet
  // This prevents the loading spinner on every navigation when user is already loaded
  if (isLoadingProfile && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  if (requireEmailVerified && user && !user.emailVerified) {
    return null;
  }

  // Block authors who haven't accepted terms
  if (requireTermsAccepted && user && user.role === 'AUTHOR' && user.termsAccepted === false) {
    return null;
  }

  return <>{children}</>;
}
