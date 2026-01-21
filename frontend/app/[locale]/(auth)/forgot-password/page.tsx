'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
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
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const { requestPasswordResetAsync, isRequestingReset } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();
    try {
      await requestPasswordResetAsync(data);
      setEmailSent(true);
      toast.success(t('success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('error');
      toast.error(errorMessage);
    }
  };

  if (emailSent) {
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/${locale}/login`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLogin')}
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
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isRequestingReset}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </CardContent>

      <CardFooter className="flex animate-fade-up-light-slow flex-col space-y-2">
        <Button
          type="button"
          className="w-full animate-zoom-in-light-slow"
          disabled={isRequestingReset}
          onClick={handleSubmit}
        >
          {isRequestingReset ? t('submitting') : t('submitButton')}
        </Button>

        <Button
          variant="ghost"
          className="w-full animate-fade-up-slow"
          type="button"
          onClick={() => router.push(`/${locale}/login`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToLogin')}
        </Button>
      </CardFooter>
    </Card>
  );
}
