import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, LogOut, BookOpen, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/lib/api/client';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';

export function VerifyEmailRequiredPage() {
  const { t } = useTranslation('auth.verifyEmail');
  const navigate = useNavigate();
  const { user, clearUser } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setIsResending(true);
    try {
      await authApi.resendVerificationEmail(user.email);
      toast.success(t('resendSuccess') || 'Verification email sent! Please check your inbox.');
      setResent(true);
    } catch {
      toast.error(t('resendError') || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutLoading(true);
    tokenManager.clearToken();
    clearUser();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const leftPoints = [
    { icon: Mail,        color: '#3b82f6', title: 'Check your inbox',     desc: 'We sent a verification link to your email address' },
    { icon: CheckCircle2, color: '#10b981', title: 'Click the link',      desc: 'One click activates your account instantly' },
    { icon: ShieldCheck, color: '#a78bfa', title: 'Stay secure',          desc: 'Verification prevents unauthorized access to your account' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
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
          <p className="text-slate-500 text-xs">The Amazon Review Platform for Authors</p>
        </div>

        {/* Main */}
        <div className="relative space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              One last step —<br />
              <span className="text-blue-400">check your inbox</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              We need to confirm your email before you can access your dashboard and launch campaigns.
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
          <p className="text-xs text-slate-600">
            Can't find the email? Check your spam folder or click Resend below.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${resent ? 'bg-green-50' : 'bg-amber-50'}`}>
                {resent
                  ? <CheckCircle2 className="h-10 w-10 text-green-500" />
                  : <Mail className="h-10 w-10 text-amber-500" />}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {resent ? 'Email Sent!' : 'Verify Your Email'}
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                {resent
                  ? 'A new verification link has been sent. Please check your inbox.'
                  : 'Please verify your email address to continue. Check your inbox for the verification link.'}
              </p>
              {user?.email && (
                <p className="text-sm text-gray-400 mb-8">
                  Sent to: <strong className="text-gray-600">{user.email}</strong>
                </p>
              )}
              {!user?.email && <div className="mb-8" />}

              <div className="w-full flex flex-col gap-3">
                <Button
                  type="button"
                  className="w-full"
                  disabled={isResending}
                  onClick={handleResendEmail}
                  style={{ backgroundColor: '#3b82f6', fontWeight: 600 }}
                >
                  {isResending
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <RefreshCw className="mr-2 h-4 w-4" />}
                  {isResending ? t('resending') : t('resendButton')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400"
                  disabled={isLogoutLoading}
                  onClick={handleLogout}
                >
                  {isLogoutLoading
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <LogOut className="mr-2 h-4 w-4" />}
                  Sign out
                </Button>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {['Secure Verification', 'Spam-Free', 'HTTPS Encrypted'].map((label) => (
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
