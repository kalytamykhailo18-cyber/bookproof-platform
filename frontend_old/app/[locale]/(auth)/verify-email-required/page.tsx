'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';

/**
 * Email Verification Required Page
 * Shows when a user tries to access a protected route without email verification
 */
export default function VerifyEmailRequiredPage() {
  const t = useTranslations('auth.verifyEmail');
  const params = useParams();
  // locale available if needed for future use
  const _locale = (params.locale as string) || 'en';
  void _locale; // silence unused variable warning
  const { user, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      await authApi.resendVerificationEmail(user.email);
      toast.success(t('resendSuccess') || 'Verification email sent! Please check your inbox.');
    } catch {
      toast.error(t('resendError') || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutLoading(true);
    logout();
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">{t('title')}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4 py-8">
        <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900">
          <Mail className="h-16 w-16 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Email Verification Required</h3>
          <p className="text-muted-foreground">
            Please verify your email address to continue. Check your inbox for the verification link.
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">
              Sent to: <strong>{user.email}</strong>
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <Button
          type="button"
          className="w-full"
          disabled={isResending}
          onClick={handleResendEmail}
        >
          {isResending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {isResending ? t('resending') : t('resendButton')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isLogoutLoading}
          onClick={handleLogout}
        >
          {isLogoutLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </Button>
      </CardFooter>
    </Card>
  );
}
