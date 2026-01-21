'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { loginAsync, isLoggingIn } = useAuth();
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();
  const [rememberMe, setRememberMe] = useState(false);

  // Section 16.1: Get return URL from query params
  const returnUrl = searchParams.get('returnUrl');

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

      await loginAsync({ ...data, captchaToken, rememberMe });
      toast.success(t('success'));

      // Section 16.1: Redirect to intended destination after successful login
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      }
      // Otherwise, useAuth hook will handle default redirect based on role
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('error');
      if (errorMessage.includes('CAPTCHA')) {
        toast.error('Security verification failed. Please try again.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card className="animate-fade-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription className="text-center">{t('subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoggingIn}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
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
              {t('rememberMe')}
            </Label>
          </div>
          <span
            className="cursor-pointer text-sm text-primary hover:underline"
            onClick={() => router.push(`/${locale}/forgot-password`)}
          >
            {t('forgotPassword')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button type="button" className="w-full" disabled={isLoggingIn} onClick={handleLogin}>
          {isLoggingIn ? t('submitting') : t('submitButton')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <span
            className="cursor-pointer font-medium text-primary hover:underline"
            onClick={() => router.push(`/${locale}/register`)}
          >
            {t('signUp')}
          </span>
        </p>
      </CardFooter>
    </Card>
  );
}
