import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Crown, Building2, ShieldCheck, BarChart2, Bell, FileText } from 'lucide-react';
import { usePricingContent } from '@/hooks/useLandingContent';

// Visual styling per package index
const PACKAGE_STYLES = [
  { icon: Zap,       color: '#3b82f6', animation: 'animate-fade-up-fast' },
  { icon: Star,      color: '#8b5cf6', animation: 'animate-fade-up' },
  { icon: Crown,     color: '#f59e0b', animation: 'animate-fade-up-light-slow' },
  { icon: Building2, color: '#10b981', animation: 'animate-fade-up-slow' },
];

export function PricingSection() {
  const { t } = useTranslation('pricing');
  const content = usePricingContent();

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
            {content.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {content.title}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
            {content.subtitle}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {content.packages.map((pkg, index) => {
            const style = PACKAGE_STYLES[index % PACKAGE_STYLES.length];
            const Icon = style.icon;
            const color = style.color;
            const animation = style.animation;
            const isPopular = pkg.isPopular;
            const isEnterprise = pkg.isEnterprise;
            const features = Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <div
                key={pkg.key}
                className={`relative landing-card-light rounded-md p-7 flex flex-col transition-transform duration-300 hover:scale-105 hover:z-10 ${animation} ${isPopular ? 'ring-2 ring-violet-400/40' : ''}`}
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
                  <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-sm font-semibold mt-1" style={{ color }}>
                    {pkg.credits}
                  </p>
                </div>

                {/* Key info */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                  {[
                    [t('infoRow.reviews'), pkg.reviews],
                    [t('infoRow.duration'), pkg.duration],
                    [t('infoRow.validity'), pkg.validity],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-medium text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((feature, fi) => (
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
                    {content.enterpriseCta}
                  </a>
                ) : (
                  <Link
                    to="/register"
                    className="block text-center px-4 py-3 rounded-md text-sm font-semibold text-white transition-all duration-200"
                    style={isPopular
                      ? { background: `linear-gradient(135deg, ${color}, #6366f1)`, boxShadow: `0 4px 16px ${color}28` }
                      : { background: `${color}18`, border: `1px solid ${color}28`, color }}
                  >
                    {content.ctaText}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 animate-fade-up-very-slow">
          {content.note}
        </p>

        {/* All plans include strip */}
        {content.allInclude && content.allInclude.length > 0 && (
          <div className="mt-16 sm:mt-20 landing-card-light rounded-md p-7 sm:p-8 animate-zoom-in-slow">
            <h4 className="text-sm font-semibold text-slate-900 text-center mb-7">{t('allInclude.title')}</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {content.allInclude.map((label, idx) => {
                const iconData = [
                  { Icon: ShieldCheck, color: '#3b82f6', anim: 'animate-fade-up-fast' },
                  { Icon: BarChart2,   color: '#8b5cf6', anim: 'animate-fade-up' },
                  { Icon: Bell,        color: '#f59e0b', anim: 'animate-fade-up-light-slow' },
                  { Icon: FileText,    color: '#10b981', anim: 'animate-fade-up-slow' },
                ][idx % 4];
                const { Icon, color, anim } = iconData;
                return (
                <div key={idx} className={`flex items-center gap-3.5 ${anim}`}>
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </span>
                  <span className="text-xs text-slate-600 leading-relaxed">{label}</span>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
