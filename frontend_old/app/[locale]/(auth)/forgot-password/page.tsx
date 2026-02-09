'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useRecaptcha } from '@/hooks/useRecaptcha';
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
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

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
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();
  const [emailSent, setEmailSent] = useState(false);
  const [isBackLoading, setIsBackLoading] = useState(false);

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
      // Get reCAPTCHA token if enabled (Section 15.2)
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) {
        captchaToken = await executeRecaptcha('password_reset');
      }

      await requestPasswordResetAsync({ ...data, captchaToken });
      setEmailSent(true);
      toast.success(t('success'));
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
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBackLoading}
            onClick={() => {
              setIsBackLoading(true);
              router.push(`/${locale}/login`);
            }}
          >
            {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowLeft className="mr-2 h-4 w-4" />{t('backToLogin')}</>}
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
          {isRequestingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitButton')}
        </Button>

        <Button
          variant="ghost"
          className="w-full animate-fade-up-slow"
          type="button"
          disabled={isBackLoading}
          onClick={() => {
            setIsBackLoading(true);
            router.push(`/${locale}/login`);
          }}
        >
          {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowLeft className="mr-2 h-4 w-4" />{t('backToLogin')}</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
