import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, BookOpen, ShieldCheck, Star, Rocket } from 'lucide-react';

const ICONS = [TrendingUp, Users, BookOpen, ShieldCheck, Star, Rocket];
const ANIMATIONS = [
  'animate-fade-up-fast',
  'animate-zoom-in-fast',
  'animate-fade-up',
  'animate-zoom-in',
  'animate-fade-up-light-slow',
  'animate-zoom-in-light-slow',
];

const ITEMS = [
  { key: 'reviews',      color: '#3b82f6' },
  { key: 'authors',      color: '#8b5cf6' },
  { key: 'readers',      color: '#10b981' },
  { key: 'retention',    color: '#f59e0b' },
  { key: 'satisfaction', color: '#ec4899' },
  { key: 'books',        color: '#3b82f6' },
];

export function StatsSection() {
  const { t } = useTranslation('stats');

  return (
    <section
      className="py-24 sm:py-32 relative"
      style={{ background: '#ffffff' }}
    >
      <div className="absolute inset-0 landing-dot-grid-light opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {t('badge', 'Platform Results')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'Numbers That Speak for Themselves')}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {ITEMS.map(({ key, color }, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={key}
                className={`landing-card-light landing-card-light-hover rounded-md p-7 sm:p-8 text-center ${ANIMATIONS[i]}`}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-md mb-5"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color }}>
                  {t(`items.${key}.value`)}
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-1.5">
                  {t(`items.${key}.label`)}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">
                  {t(`items.${key}.description`)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="mt-20 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(203,213,225,0.8), transparent)' }}
        />
      </div>
    </section>
  );
}
