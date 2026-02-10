import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate,  useSearchParams, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/lib/api/client';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail } from 'lucide-react';
import { authApi } from '@/lib/api/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required') });

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();
  const { startLoading, stopLoading } = useLoading();
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [showVerificationNeeded, setShowVerificationNeeded] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Section 16.1: Get return URL from query params
  const returnUrl = searchParams.get('returnUrl');

  const {
    register,
    trigger,
    getValues,
    formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) });

  const handleLogin = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    try {
      // Get reCAPTCHA token if enabled
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) {
        captchaToken = await executeRecaptcha('login');
      }

      setIsLoggingIn(true);
      startLoading('Signing you in...');
      const response = await authApi.login({ ...data, captchaToken, rememberMe });

      // Set token and user
      tokenManager.setToken(response.accessToken);
      setUser(response.user);

      toast.success(t('login.success'));

      // Section 16.1: Redirect to intended destination after successful login
      if (returnUrl) {
        navigate(decodeURIComponent(returnUrl));
      } else {
        // Redirect based on role
        switch (response.user.role) {
          case 'AUTHOR':
            navigate('/author');
            break;
          case 'READER':
            navigate('/reader');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'CLOSER':
            navigate('/closer');
            break;
          case 'AFFILIATE':
            navigate('/affiliate/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('login.error');
      if (errorMessage.includes('CAPTCHA')) {
        toast.error('Security verification failed. Please try again.');
      } else if (errorMessage.toLowerCase().includes('verify your email')) {
        // Show verification needed UI instead of just a toast
        setShowVerificationNeeded(true);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoggingIn(false);
      stopLoading();
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setIsResendingVerification(true);
    try {
      await authApi.resendVerificationEmail(email);
      toast.success(t('login.verificationSent') || 'Verification email sent! Please check your inbox.');
      setShowVerificationNeeded(false);
    } catch {
      toast.error(t('login.verificationError') || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-theme(spacing.16)-theme(spacing.32))] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <Card className="animate-fade-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">{t('login.title')}</CardTitle>
        <CardDescription className="text-center">{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('login.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('login.emailPlaceholder')}
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoggingIn}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('login.password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
            disabled={isLoggingIn}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoggingIn}
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
              {t('login.rememberMe')}
            </Label>
          </div>
          <span
            className="cursor-pointer text-sm text-primary hover:underline"
            onClick={() => {
              setIsForgotLoading(true);
              navigate(`/forgot-password`);
            }}
          >
            {isForgotLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('login.forgotPassword')}
          </span>
        </div>

        {showVerificationNeeded && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('login.emailNotVerified') || 'Email not verified'}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('login.emailNotVerifiedDesc') || 'Please verify your email address before logging in. Check your inbox for the verification link.'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="mt-2"
                >
                  {isResendingVerification ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {t('login.resendVerification') || 'Resend verification email'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button type="button" className="w-full" disabled={isLoggingIn} onClick={handleLogin}>
          {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : t('login.submitButton')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <span
            className="cursor-pointer font-medium text-primary hover:underline"
            onClick={() => {
              setIsSignupLoading(true);
              navigate(`/register`);
            }}
          >
            {isSignupLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('login.signUp')}
          </span>
        </p>
      </CardFooter>
        </Card>
      </div>
    </div>
  );
}
