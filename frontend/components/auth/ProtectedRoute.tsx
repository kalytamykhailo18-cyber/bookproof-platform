'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

  // Section 16.1: Unauthorized (401) - Preserve intended destination
  useEffect(() => {
    if (!isLoadingProfile && !isAuthenticated) {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      const returnUrl = encodeURIComponent(currentPath);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoadingProfile, router, pathname, searchParams]);

  // Section 16.1: Forbidden (403) - Redirect to forbidden page
  useEffect(() => {
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/forbidden');
    }
  }, [user, allowedRoles, router]);

  useEffect(() => {
    if (user && requireEmailVerified && !user.emailVerified) {
      router.push('/verify-email-required');
    }
  }, [user, requireEmailVerified, router]);

  // Check if author needs to accept terms of service
  useEffect(() => {
    if (user && requireTermsAccepted && user.role === 'AUTHOR' && user.termsAccepted === false) {
      router.push('/accept-terms');
    }
  }, [user, requireTermsAccepted, router]);

  if (isLoadingProfile) {
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
