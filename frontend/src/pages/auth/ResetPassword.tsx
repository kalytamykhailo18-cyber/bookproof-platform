import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api/auth';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, KeyRound, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character',
  );

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { t } = useTranslation('auth.resetPassword');
  const { t: tAuth } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
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
    if (!token) { toast.error(t('errorInvalidToken')); return; }
    const isValid = await trigger();
    if (!isValid) return;
    const data = getValues();
    try {
      setIsResettingPassword(true);
      startLoading('Resetting your password...');
      await authApi.resetPassword({ token, newPassword: data.password });
      setResetSuccess(true);
      toast.success(t('success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err?.response?.data?.message || err?.message;
      if (message?.includes('already used')) toast.error(t('errorAlreadyUsed'));
      else if (message?.includes('expired')) toast.error(t('errorExpired'));
      else toast.error(t('error'));
    } finally {
      setIsResettingPassword(false);
      stopLoading();
    }
  };

  const requirements = t('requirements', { returnObjects: true }) as string[];

  const LeftPanel = () => (
    <div
      className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 60%)' }} />

      {/* Logo */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>BookProof</span>
        </div>
        <p className="text-slate-500 text-xs">{tAuth('common.tagline')}</p>
      </div>

      {/* Main */}
      <div className="relative space-y-10">
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            {t('leftHeading')}<br />
            <span className="text-blue-400">{t('leftHeadingHighlight')}</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('leftSubtitle')}
          </p>
        </div>

        {/* Password requirements */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('requirementsTitle')}</p>
          <div className="space-y-2.5">
            {requirements.map((req) => (
              <div key={req} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <p className="text-sm text-slate-400">{req}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 pt-2 border-t border-slate-800">
          {(t('leftStats', { returnObjects: true }) as { value: string; label: string }[]).map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="relative">
        <p className="text-xs text-slate-600">
          {t('sessionNote')}
        </p>
      </div>
    </div>
  );

  // No token state
  if (!token) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel />
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md animate-fade-up">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-400 to-red-400" />
              <div className="px-8 py-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('error')}</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">{t('errorInvalidToken')}</p>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isNavLoading}
                  onClick={() => { setIsNavLoading(true); navigate('/forgot-password'); }}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('requestNewLink')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel />
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md animate-fade-up">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400" />
              <div className="px-8 py-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success')}</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">{t('successMessage')}</p>
                <Button
                  type="button"
                  className="w-full"
                  disabled={isNavLoading}
                  onClick={() => { setIsNavLoading(true); navigate('/login'); }}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('loginButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />
            <div className="px-8 py-8">

              {/* Header */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mb-3">
                  <KeyRound className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500 text-sm mt-1 text-center">{t('subtitle')}</p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-5">
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('confirmPasswordPlaceholder')}
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    disabled={isResettingPassword}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button
                  type="button"
                  className="w-full mt-1"
                  disabled={isResettingPassword}
                  onClick={handleResetPassword}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isResettingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitButton')}
                </Button>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {(t('trustSignals', { returnObjects: true }) as string[]).map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
