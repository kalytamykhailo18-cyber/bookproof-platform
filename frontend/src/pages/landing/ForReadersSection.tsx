import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookMarked, DollarSign, Compass, Clock, UsersRound, Wallet, ArrowRight, Check } from 'lucide-react';

const ICONS = [BookMarked, DollarSign, Compass, Clock, UsersRound, Wallet];
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
const KEYS = ['freeBooks', 'earnMoney', 'discoverBooks', 'flexible', 'community', 'payout'] as const;

const CARD_ANIMATIONS = [
  'animate-fade-up-fast',
  'animate-fade-right-fast',
  'animate-zoom-in-fast',
  'animate-fade-up',
  'animate-fade-left-fast',
  'animate-zoom-in',
];

export function ForReadersSection() {
  const { t } = useTranslation('readerBenefits');

  return (
    <section
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(16,185,129,0.05) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom right, rgba(59,130,246,0.05) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            {t('badge', 'For Readers')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'Read Books You Love. Get Paid for Your Honest Opinion.')}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Benefits grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {KEYS.map((key, i) => {
              const Icon = ICONS[i];
              const color = COLORS[i];
              return (
                <div key={key} className={`landing-card-light landing-card-light-hover rounded-md p-6 group ${CARD_ANIMATIONS[i]}`}>
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 group-hover:text-green-700 transition-colors duration-200">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Earnings + steps panel */}
          <div className="space-y-6 animate-fade-left-light-slow">
            {/* Earnings card */}
            <div
              className="landing-card-light rounded-md p-7 sm:p-8 space-y-6"
              style={{ border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 4px 20px rgba(16,185,129,0.07)' }}
            >
              <h3 className="text-lg font-semibold text-slate-900">{t('howEarnings.title', 'How Earnings Work')}</h3>

              <div
                className="flex items-center justify-between p-4 rounded-md animate-fade-up-fast"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md" style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <BookMarked className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{t('howEarnings.ebookLabel')}</p>
                    <p className="text-sm font-semibold text-slate-800">{t('howEarnings.ebook', 'Per ebook review')}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-600">$5–15</span>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-md animate-fade-up"
                style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md" style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{t('howEarnings.audiobookLabel')}</p>
                    <p className="text-sm font-semibold text-slate-800">{t('howEarnings.audiobook', 'Per audiobook review')}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">$10–25</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between animate-fade-right-fast">
                  <span className="text-sm text-slate-600">{t('howEarnings.minimum', 'Minimum payout')}</span>
                  <span className="text-sm font-semibold text-slate-900">$50</span>
                </div>
                <div className="animate-fade-left-fast">
                  <p className="text-xs text-slate-500 mb-2.5">{t('howEarnings.paymentMethods')}</p>
                  <div className="flex flex-wrap gap-2">
                    {['PayPal', 'Bank Transfer', 'Wise', 'Crypto'].map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600"
                        style={{ background: '#f8fafc', border: '1px solid rgba(203,213,225,0.8)' }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Steps checklist */}
            <div className="landing-card-light rounded-md p-7 animate-zoom-in-light-slow">
              <p className="text-sm font-semibold text-slate-900 mb-5">{t('howToGet.title')}</p>
              <div className="space-y-3.5">
                {(t('howToGet.steps', { returnObjects: true }) as string[]).map((step, si) => (
                  <div key={si} className="flex items-center gap-3 animate-fade-right-fast">
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-sm"
                      style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fade-up-slow">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-md text-base font-semibold text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}
              >
                {t('cta', 'Join as a Reader')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-slate-400 mt-2.5 text-center">{t('freeToJoin')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
