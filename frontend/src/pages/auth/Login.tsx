import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/lib/api/client';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, BookOpen, ShieldCheck, Star, Clock, BarChart2, Users, RefreshCw, CheckCircle2 } from 'lucide-react';
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

  const leftFeatures = [
    { icon: ShieldCheck, color: '#34d399', title: 'Amazon Policy Compliant',    desc: 'Progressive delivery mimics organic review growth' },
    { icon: BarChart2,   color: '#60a5fa', title: 'Real-Time Dashboard',        desc: 'Track every review and campaign status live' },
    { icon: Users,       color: '#a78bfa', title: 'Global Reader Network',      desc: 'Verified readers across English, Portuguese & Spanish' },
    { icon: RefreshCw,   color: '#fbbf24', title: '14-Day Replacement Guarantee', desc: 'Removed reviews replaced at no extra cost' },
  ];

  const leftStats = [
    { value: '500+', label: 'Authors' },
    { value: '94%',  label: 'Retention Rate' },
    { value: '48h',  label: 'Campaign Start' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — dark branded ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Glow orb */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(59,130,246,0.08) 0%, transparent 60%)' }}
        />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>BookProof</span>
          </div>
          <p className="text-slate-500 text-xs">The Amazon Review Platform for Authors</p>
        </div>

        {/* Main content */}
        <div className="relative space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Launch your book with<br />
              <span className="text-blue-400">verified reviews</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Connect with real readers who genuinely read your book and leave authentic Amazon reviews — safely and at scale.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {leftFeatures.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center mt-0.5"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-2 border-t border-slate-800">
            {leftStats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <div className="rounded-md p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(71,85,105,0.3)' }}>
            <p className="text-sm text-slate-400 italic leading-relaxed">
              "BookProof helped me go from zero reviews to a bestseller ranking in just 4 weeks."
            </p>
            <p className="text-xs text-slate-600 mt-2">— Sarah M., Romance Author</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">

          {/* Card */}
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            {/* Top stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />

            <div className="px-8 py-8">
              {/* Header */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
                <p className="text-gray-500 text-sm mt-1 text-center">{t('login.subtitle')}</p>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-5">
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
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
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                    onClick={() => { setIsForgotLoading(true); navigate('/forgot-password'); }}
                  >
                    {isForgotLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('login.forgotPassword')}
                  </span>
                </div>

                {showVerificationNeeded && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium text-amber-800">
                          {t('login.emailNotVerified') || 'Email not verified'}
                        </p>
                        <p className="text-sm text-amber-700">
                          {t('login.emailNotVerifiedDesc') || 'Please verify your email address before logging in.'}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                          className="mt-2"
                        >
                          {isResendingVerification ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                          {t('login.resendVerification') || 'Resend verification email'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full mt-1"
                  disabled={isLoggingIn}
                  onClick={handleLogin}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : t('login.submitButton')}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-xs">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-500">
                {t('login.noAccount')}{' '}
                <span
                  className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  onClick={() => { setIsSignupLoading(true); navigate('/register'); }}
                >
                  {isSignupLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : t('login.signUp')}
                </span>
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {[
              { icon: ShieldCheck, label: 'Secure & Encrypted' },
              { icon: Star,        label: '94% Review Retention' },
              { icon: Clock,       label: 'Campaign Live in 48h' },
            ].map(({ icon: Icon, label }) => (
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
