'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
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
import { CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPasswordAsync, isResettingPassword } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleResetPassword = async () => {
    if (!token) {
      toast.error(t('errorInvalidToken'));
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    try {
      await resetPasswordAsync({
        token,
        newPassword: data.password,
      });
      setResetSuccess(true);
      toast.success(t('success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err?.message;

      if (message?.includes('already used')) {
        toast.error(t('errorAlreadyUsed'));
      } else if (message?.includes('expired')) {
        toast.error(t('errorExpired'));
      } else {
        toast.error(t('error'));
      }
    }
  };

  if (!token) {
    return (
      <Card className="animate-zoom-in">
        <CardHeader className="space-y-1">
          <CardTitle className="animate-fade-down-fast text-center text-2xl font-bold">
            {t('error')}
          </CardTitle>
        </CardHeader>
        <CardContent className="animate-fade-up py-8 text-center">
          <p className="text-muted-foreground">{t('errorInvalidToken')}</p>
        </CardContent>
        <CardFooter className="animate-fade-up-slow">
          <Button type="button" onClick={() => router.push('/forgot-password')} className="w-full">
            Request New Link
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (resetSuccess) {
    return (
      <Card className="animate-zoom-in">
        <CardHeader className="space-y-1">
          <CardTitle className="animate-fade-down-fast text-center text-2xl font-bold">
            {t('success')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          <div className="animate-zoom-in rounded-full bg-green-100 p-4 dark:bg-green-900">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <p className="animate-fade-up text-center text-muted-foreground">{t('successMessage')}</p>
        </CardContent>
        <CardFooter className="animate-fade-up-slow">
          <Button type="button" onClick={() => router.push('/login')} className="w-full">
            {t('loginButton')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="animate-zoom-in">
      <CardHeader className="space-y-1">
        <CardTitle className="animate-fade-down-fast text-center text-2xl font-bold">
          {t('title')}
        </CardTitle>
        <CardDescription className="animate-fade-up-fast text-center">
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="animate-fade-up-very-fast space-y-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t('passwordPlaceholder')}
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
            disabled={isResettingPassword}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="animate-fade-left-fast space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('confirmPasswordPlaceholder')}
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-destructive' : ''}
            disabled={isResettingPassword}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="animate-fade-up-light-slow">
        <Button
          type="button"
          className="w-full animate-zoom-in-light-slow"
          disabled={isResettingPassword}
          onClick={handleResetPassword}
        >
          {isResettingPassword ? t('submitting') : t('submitButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
