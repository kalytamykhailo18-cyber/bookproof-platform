import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api/auth';
import { useLoading } from '@/components/providers/LoadingProvider';
import { Button } from '@/components/ui/button';
import { BookOpen, Mail, ShieldCheck, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const { t } = useTranslation('auth.verifyEmail');
  const { t: tAuth } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavLoading, setIsNavLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage(t('errorInvalidToken'));
      return;
    }
    const verify = async () => {
      try {
        startLoading('Verifying your email...');
        await authApi.verifyEmail(token);
        setStatus('success');
      } catch (error: unknown) {
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const message = err?.response?.data?.message || err?.message;
        if (message?.includes('already used')) setErrorMessage(t('errorAlreadyUsed'));
        else if (message?.includes('expired')) setErrorMessage(t('errorExpired'));
        else setErrorMessage(t('errorInvalidToken'));
      } finally {
        stopLoading();
      }
    };
    verify();
  }, [searchParams, startLoading, stopLoading, t]);

  const leftPointsData = t('leftPoints', { returnObjects: true }) as { title: string; desc: string }[];
  const leftPoints = [
    { icon: Mail,        color: '#3b82f6', ...leftPointsData[0] },
    { icon: Clock,       color: '#f59e0b', ...leftPointsData[1] },
    { icon: ShieldCheck, color: '#10b981', ...leftPointsData[2] },
  ];

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
          {t('leftBottomNote')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-up">

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            {/* Stripe color based on status */}
            <div className={`h-1 w-full ${
              status === 'success' ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400' :
              status === 'error'   ? 'bg-gradient-to-r from-red-500 via-orange-400 to-red-400' :
              'bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400'
            }`} />

            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

              {/* Verifying */}
              {status === 'verifying' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                  </div>
                  <p className="text-gray-500 text-sm">{t('verifying')}</p>
                </>
              )}

              {/* Success */}
              {status === 'success' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">{t('success')}</h3>
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
                </>
              )}

              {/* Error */}
              {status === 'error' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">{t('error')}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">{errorMessage}</p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isNavLoading}
                    className="w-full"
                    onClick={() => { setIsNavLoading(true); navigate('/register'); }}
                  >
                    {isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('resendButton')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Trust signals */}
          {status !== 'verifying' && (
            <div className="mt-5 flex flex-wrap justify-center gap-4">
              {(t('trustSignals', { returnObjects: true }) as string[]).map((label) => (
                <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {label}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
