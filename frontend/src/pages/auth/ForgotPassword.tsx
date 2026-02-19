import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api/auth';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, Lock, Clock, ShieldCheck, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth.forgotPassword');
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();
  const [emailSent, setEmailSent] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
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
      let captchaToken: string | undefined;
      if (isRecaptchaEnabled) captchaToken = await executeRecaptcha('password_reset');
      setIsRequestingReset(true);
      startLoading('Sending reset link...');
      await authApi.requestPasswordReset({ ...data, captchaToken });
      setEmailSent(true);
      toast.success(t('success'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || t('error');
      if (errorMessage.includes('CAPTCHA')) toast.error('Security verification failed. Please try again.');
      else toast.error(errorMessage);
    } finally {
      setIsRequestingReset(false);
      stopLoading();
    }
  };

  const leftPoints = [
    { icon: Mail,        color: '#3b82f6', title: 'Check your inbox',       desc: 'Reset link sent within seconds of submitting' },
    { icon: Clock,       color: '#f59e0b', title: 'Link expires in 1 hour', desc: 'Request a new one any time if it expires' },
    { icon: ShieldCheck, color: '#10b981', title: 'Secure process',         desc: 'Your account stays protected throughout the reset' },
  ];

  const LeftPanel = () => (
    <div
      className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(59,130,246,0.07) 0%, transparent 60%)' }} />

      {/* Logo */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">BookProof</span>
        </div>
        <p className="text-slate-500 text-xs">The Amazon Review Platform for Authors</p>
      </div>

      {/* Main */}
      <div className="relative space-y-10">
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Forgot your<br />
            <span className="text-blue-400">password?</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            No worries — it happens. Enter your email and we'll send you a secure reset link instantly.
          </p>
        </div>
        <div className="space-y-4">
          {leftPoints.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center mt-0.5"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="relative">
        <div className="rounded-md p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(71,85,105,0.3)' }}>
          <p className="text-sm text-slate-400 italic leading-relaxed">
            "Secure account recovery is a core part of how we protect our authors and readers."
          </p>
          <p className="text-xs text-slate-600 mt-2">— BookProof Security Team</p>
        </div>
      </div>
    </div>
  );

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        <LeftPanel />
        <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md animate-fade-up">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />
              <div className="px-8 py-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('success')}</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">{t('successMessage')}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isBackLoading}
                  onClick={() => { setIsBackLoading(true); navigate('/login'); }}
                >
                  {isBackLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><ArrowLeft className="mr-2 h-4 w-4" />{t('backToLogin')}</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Lock className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-500 text-sm mt-1 text-center">{t('subtitle')}</p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-5">
                <div className="space-y-1.5">
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

                <Button
                  type="button"
                  className="w-full"
                  disabled={isRequestingReset}
                  onClick={handleSubmit}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isRequestingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitButton')}
                </Button>

                <Button
                  variant="ghost"
                  type="button"
                  disabled={isBackLoading}
                  className="w-full text-gray-400"
                  onClick={() => { setIsBackLoading(true); navigate('/login'); }}
                >
                  {isBackLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><ArrowLeft className="mr-2 h-4 w-4" />{t('backToLogin')}</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {['Secure Reset', 'Expires in 1 Hour', 'HTTPS Encrypted'].map((label) => (
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
