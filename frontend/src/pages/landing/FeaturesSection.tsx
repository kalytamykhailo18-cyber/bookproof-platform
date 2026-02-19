import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, BarChart3, LineChart, Headphones,
  RefreshCw, Headset, FileText, Search,
  Lock, Zap,
} from 'lucide-react';

const FEATURE_ICONS = [ShieldCheck, BarChart3, LineChart, Headphones, RefreshCw, Headset, FileText, Search];
const FEATURE_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa', '#34d399'];
const FEATURE_KEYS = [
  'authentic', 'distributed', 'tracking', 'flexible',
  'guarantee', 'support', 'report', 'keywords',
] as const;

const CARD_ANIMATIONS = [
  'animate-fade-up-fast',
  'animate-fade-up',
  'animate-zoom-in-fast',
  'animate-fade-up-light-slow',
  'animate-fade-right-fast',
  'animate-zoom-in',
  'animate-fade-left-fast',
  'animate-zoom-in-light-slow',
];

export function FeaturesSection() {
  const { t } = useTranslation('features');

  return (
    <section id="features" className="py-24 sm:py-32 relative" style={{ background: '#080d1a' }}>
      <div className="absolute inset-0 landing-dot-grid opacity-25" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            {t('badge', 'Platform Features')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 animate-fade-up-fast">
            {t('title', "Everything Built for Your Book's Success")}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Features grid — 2 rows of 4, each with its own connecting line */}
        <div className="flex flex-col gap-5 sm:gap-6">
          {[0, 4].map(rowStart => (
            <div key={rowStart} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 relative">
              {/* Connecting line at bottom of icons for this row */}
              <div
                className="hidden lg:block absolute left-[12.5%] right-[12.5%] h-px"
                style={{
                  top: '52px',
                  background: `linear-gradient(90deg, ${FEATURE_COLORS.slice(rowStart, rowStart + 4).map(c => `${c}66`).join(', ')})`,
                }}
              />
              {FEATURE_KEYS.slice(rowStart, rowStart + 4).map((key, localI) => {
                const i = rowStart + localI;
                const Icon = FEATURE_ICONS[i];
                const color = FEATURE_COLORS[i];
                return (
                  <div key={key} className={`group ${CARD_ANIMATIONS[i]}`}>
                    {/* Icon above */}
                    <div className="flex flex-col items-center mb-3">
                      <div
                        className="w-[52px] h-[52px] rounded-md flex items-center justify-center relative z-10 mb-3 transition-transform duration-200 group-hover:scale-110"
                        style={{
                          color,
                          background: `${color}18`,
                          border: `1.5px solid ${color}50`,
                          boxShadow: `0 0 20px ${color}4d`,
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color }} />
                      </div>
                      {/* Title under icon, outside card */}
                      <h3 className="text-sm font-semibold text-white text-center">
                        {t(`items.${key}.title`)}
                      </h3>
                    </div>

                    {/* Card — description only */}
                    <div
                      className="landing-card rounded-md p-5 border transition-transform duration-300 hover:scale-105"
                      style={{
                        borderColor: `${color}25`,
                        borderTopColor: color,
                        borderTopWidth: '2px',
                      }}
                    >
                      <p className="text-sm text-slate-500 leading-relaxed text-center">
                        {t(`items.${key}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-16 sm:mt-20 grid sm:grid-cols-3 gap-5 sm:gap-6">
          {[
            { Icon: Lock,       color: '#60a5fa', label: 'Amazon Policy Compliant', desc: 'Progressive delivery mimics organic review growth',        anim: 'animate-fade-right-light-slow' },
            { Icon: Zap,        color: '#fbbf24', label: 'Fast Campaign Start',     desc: 'First readers assigned within days of campaign creation',  anim: 'animate-fade-up-light-slow'    },
            { Icon: BarChart3,  color: '#34d399', label: 'Full Transparency',       desc: 'Real-time dashboard with every review and status update',  anim: 'animate-fade-left-light-slow'  },
          ].map(({ Icon, color, label, desc, anim }) => (
            <div key={label} className={`card-golden-hover flex items-start gap-4 p-6 landing-card rounded-md ${anim}`}>
              <div
                className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-md mt-0.5"
                style={{ background: `${color}15`, border: `1px solid ${color}28` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1.5">{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
