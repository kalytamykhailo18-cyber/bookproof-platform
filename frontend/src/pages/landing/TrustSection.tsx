import { useTranslation } from 'react-i18next';
import { ShieldCheck, Globe, Lock, Award } from 'lucide-react';

const ITEM_ICONS = [
  { key: 'compliant', icon: ShieldCheck, color: '#34d399', animation: 'animate-fade-right-fast' },
  { key: 'global',    icon: Globe,       color: '#60a5fa', animation: 'animate-fade-up-fast'   },
  { key: 'secure',    icon: Lock,        color: '#a78bfa', animation: 'animate-fade-left-fast' },
  { key: 'retention', icon: Award,       color: '#fbbf24', animation: 'animate-zoom-in-fast'   },
];

export function TrustSection() {
  const { t } = useTranslation('trust');
  const badges = t('badges', { returnObjects: true }) as Array<{ label: string; desc: string }>;

  return (
    <section
      className="py-24 sm:py-32 relative"
      style={{ background: 'linear-gradient(180deg, #080d1a 0%, #0a1020 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 animate-fade-up-fast">
            {t('title')}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {ITEM_ICONS.map(({ key, icon: Icon, color, animation }) => (
            <div key={key} className={`card-golden-hover landing-card landing-card-hover rounded-md p-7 group ${animation}`}>
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-md mb-5 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2.5 group-hover:text-blue-300 transition-colors duration-200">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t(`items.${key}.description`)}</p>
            </div>
          ))}
        </div>

        {/* Format/feature badges */}
        <div className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-4 animate-fade-up-slow">
          {Array.isArray(badges) && badges.map((badge, bi) => (
            <div
              key={badge.label}
              className={`card-golden-hover flex flex-col items-center text-center px-5 py-3.5 rounded-md border ${bi % 2 === 0 ? 'animate-fade-up-fast' : 'animate-zoom-in-fast'}`}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(71,85,105,0.3)' }}
            >
              <span className="text-sm font-bold text-white">{badge.label}</span>
              <span className="text-xs text-slate-600 mt-0.5">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />
    </section>
  );
}
