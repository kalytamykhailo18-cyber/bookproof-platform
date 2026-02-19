import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle, Loader2, User, Mail, UserCheck } from 'lucide-react';

type UserType = 'author' | 'reader' | 'both' | '';

export function LeadCaptureSection() {
  const { t } = useTranslation('leadForm');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [userType, setUserType]   = useState<UserType>('');
  const [consent, setConsent]     = useState(false);
  const [status, setStatus]       = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, userType: userType || undefined, marketingConsent: consent }),
      });
      if (!res.ok && res.status !== 409) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t('error', 'Something went wrong. Please try again.'));
    }
  }

  const userTypeOptions: { value: UserType; key: string }[] = [
    { value: 'author', key: 'author' },
    { value: 'reader', key: 'reader' },
    { value: 'both',   key: 'both'   },
  ];

  return (
    <section
      id="get-started"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#080d1a' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 landing-dot-grid opacity-25" />

      <div className="relative max-w-xl mx-auto px-4 sm:px-6">
        {status === 'success' ? (
          <div
            className="text-center landing-card rounded-md p-14 animate-zoom-in-fast"
            style={{ border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-7"
              style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.4)' }}
            >
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">You're In!</h3>
            <p className="text-slate-400">{t('success')}</p>
          </div>
        ) : (
          <div
            className="landing-card rounded-md p-8 sm:p-10"
            style={{ border: '1px solid rgba(59,130,246,0.2)' }}
          >
            {/* Header */}
            <div className="text-center mb-9">
              <span
                className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                Early Access
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 animate-fade-up-fast">
                {t('title', 'Get Early Access')}
              </h2>
              <p className="text-slate-400 text-sm animate-fade-up">
                {t('subtitle')}
              </p>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div className="animate-fade-right-fast">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  {t('fields.name.label', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('fields.name.placeholder', 'John Doe')}
                    className="w-full pl-10 pr-4 py-3 rounded-md text-sm text-white placeholder-slate-600 border outline-none focus:border-blue-500/60 transition-colors duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(71,85,105,0.5)' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="animate-fade-left-fast">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  {t('fields.email.label', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('fields.email.placeholder', 'john@example.com')}
                    className="w-full pl-10 pr-4 py-3 rounded-md text-sm text-white placeholder-slate-600 border outline-none focus:border-blue-500/60 transition-colors duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(71,85,105,0.5)' }}
                  />
                </div>
              </div>

              {/* User type */}
              <div className="animate-fade-up">
                <label className="block text-xs font-medium text-slate-400 mb-2.5">
                  {t('fields.userType.label', 'I am a...')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {userTypeOptions.map(({ value, key }) => (
                    <button
                      key={key}
                      onClick={() => setUserType(value)}
                      className="flex items-center gap-2 px-3.5 py-3 rounded-md text-xs font-medium transition-all duration-200 border text-left"
                      style={userType === value
                        ? { background: 'rgba(59,130,246,0.2)', borderColor: 'rgba(59,130,246,0.5)', color: '#93c5fd' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(71,85,105,0.5)', color: '#64748b' }}
                    >
                      <UserCheck className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{t(`fields.userType.options.${key}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3 animate-fade-right">
                <button
                  onClick={() => setConsent(!consent)}
                  className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200 border"
                  style={consent
                    ? { background: '#3b82f6', borderColor: '#3b82f6' }
                    : { background: 'transparent', borderColor: 'rgba(71,85,105,0.7)' }}
                >
                  {consent && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-xs text-slate-500 leading-relaxed cursor-pointer" onClick={() => setConsent(!consent)}>
                  {t('fields.marketingConsent.label')}
                </span>
              </div>

              {status === 'error' && errorMsg && (
                <p className="text-xs text-red-400 animate-fade-down-fast">{errorMsg}</p>
              )}

              {/* Submit */}
              <div className="pt-2 animate-fade-up-slow">
                <button
                  onClick={handleSubmit}
                  disabled={status === 'submitting' || !name.trim() || !email.trim()}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-md text-sm font-semibold text-white landing-btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t('submitting', 'Joining...')}</>
                  ) : (
                    <><Send className="h-4 w-4" />{t('cta', 'Get Early Access')}</>
                  )}
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-slate-600 mt-5">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
