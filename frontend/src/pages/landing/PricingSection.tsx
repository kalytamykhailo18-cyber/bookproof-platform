import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Crown, Building2 } from 'lucide-react';

type PackageKey = 'starter' | 'growth' | 'professional' | 'enterprise';

const PACKAGES: { key: PackageKey; icon: typeof Zap; color: string; animation: string }[] = [
  { key: 'starter',      icon: Zap,       color: '#3b82f6', animation: 'animate-fade-up-fast' },
  { key: 'growth',       icon: Star,      color: '#8b5cf6', animation: 'animate-fade-up' },
  { key: 'professional', icon: Crown,     color: '#f59e0b', animation: 'animate-fade-up-light-slow' },
  { key: 'enterprise',   icon: Building2, color: '#10b981', animation: 'animate-fade-up-slow' },
];

export function PricingSection() {
  const { t } = useTranslation('pricing');

  return (
    <section
      id="pricing"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#f1f5f9' }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[800px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            {t('badge', 'Pricing')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'Simple, Transparent Pricing')}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {PACKAGES.map(({ key, icon: Icon, color, animation }) => {
            const isPopular = key === 'growth';
            const isEnterprise = key === 'enterprise';
            const features: string[] = t(`packages.${key}.features`, { returnObjects: true }) as string[];

            return (
              <div
                key={key}
                className={`relative landing-card-light rounded-md p-7 flex flex-col ${animation} ${isPopular ? 'ring-2 ring-violet-400/40' : ''}`}
                style={isPopular ? { boxShadow: `0 8px 32px ${color}18` } : undefined}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 animate-fade-down-fast">
                    <span
                      className="px-4 py-1 rounded-md text-xs font-bold text-white whitespace-nowrap"
                      style={{ background: `linear-gradient(135deg, ${color}, #6366f1)` }}
                    >
                      {t('popular', 'Most Popular')}
                    </span>
                  </div>
                )}

                {/* Icon + name */}
                <div className="mb-6">
                  <div
                    className="inline-flex items-center justify-center w-11 h-11 rounded-md mb-5"
                    style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{t(`packages.${key}.name`)}</h3>
                  <p className="text-sm font-semibold mt-1" style={{ color }}>
                    {t(`packages.${key}.credits`)}
                  </p>
                </div>

                {/* Key info */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                  {[
                    ['Reviews', t(`packages.${key}.reviews`)],
                    ['Duration', t(`packages.${key}.duration`)],
                    ['Validity', t(`packages.${key}.validity`)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-medium text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {Array.isArray(features) && features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 animate-fade-right-fast">
                      <span
                        className="flex-shrink-0 mt-0.5 flex items-center justify-center w-4 h-4 rounded-sm"
                        style={{ background: `${color}18` }}
                      >
                        <Check className="h-2.5 w-2.5" style={{ color }} />
                      </span>
                      <span className="text-xs text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isEnterprise ? (
                  <a
                    href="#contact"
                    className="block text-center px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 border"
                    style={{ color, borderColor: `${color}35`, background: `${color}0a` }}
                  >
                    {t('enterpriseCta', 'Contact Sales')}
                  </a>
                ) : (
                  <Link
                    to="/register"
                    className="block text-center px-4 py-3 rounded-md text-sm font-semibold text-white transition-all duration-200"
                    style={isPopular
                      ? { background: `linear-gradient(135deg, ${color}, #6366f1)`, boxShadow: `0 4px 16px ${color}28` }
                      : { background: `${color}18`, border: `1px solid ${color}28`, color }}
                  >
                    {t('cta', 'Get Started')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 animate-fade-up-very-slow">
          {t('note', 'Prices set by admin. Contact us for current package pricing.')}
        </p>

        {/* All plans include strip */}
        <div className="mt-16 sm:mt-20 landing-card-light rounded-md p-7 sm:p-8 animate-zoom-in-slow">
          <h4 className="text-sm font-semibold text-slate-900 text-center mb-7">All Packages Include</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🛡️', label: '14-Day Replacement Guarantee', anim: 'animate-fade-up-fast' },
              { icon: '📊', label: 'Real-Time Campaign Dashboard',  anim: 'animate-fade-up' },
              { icon: '📧', label: 'Email Notifications & Updates', anim: 'animate-fade-up-light-slow' },
              { icon: '📄', label: 'PDF Report on Completion',      anim: 'animate-fade-up-slow' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3.5 ${item.anim}`}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-xs text-slate-600 leading-relaxed">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
