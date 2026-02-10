import { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
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
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Section 16.1: Unauthorized (401) - Preserve intended destination
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      const [params] = searchParams;
      const currentPath = pathname + (params.toString() ? `?${params.toString()}` : '');
      const returnUrl = encodeURIComponent(currentPath);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, _hasHydrated, navigate, pathname, searchParams, locale]);

  // Section 16.1: Forbidden (403) - Redirect to forbidden page
  useEffect(() => {
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate(`/forbidden`);
    }
  }, [user, allowedRoles, navigate, locale]);

  useEffect(() => {
    if (user && requireEmailVerified && !user.emailVerified) {
      navigate(`/verify-email-required`);
    }
  }, [user, requireEmailVerified, navigate, locale]);

  // Check if author needs to accept terms of service
  useEffect(() => {
    if (user && requireTermsAccepted && user.role === 'AUTHOR' && user.termsAccepted === false) {
      navigate(`/accept-terms`);
    }
  }, [user, requireTermsAccepted, navigate, locale]);

  // Only show loading spinner if store hasn't hydrated yet
  // This prevents the loading spinner on every navigation when user is already loaded
  if (!_hasHydrated) {
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
