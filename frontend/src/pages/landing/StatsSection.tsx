import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Star, TrendingUp, Award, Zap } from 'lucide-react';

const statConfig = [
  { key: 'reviews',      target: 10,   suffix: 'K+', isFloat: false, Icon: BookOpen,   color: '#60a5fa', glow: 'rgba(96,165,250,0.3)'  },
  { key: 'authors',      target: 500,  suffix: '+',  isFloat: false, Icon: Users,      color: '#34d399', glow: 'rgba(52,211,153,0.3)'  },
  { key: 'readers',      target: 2.5,  suffix: 'K+', isFloat: true,  Icon: Star,       color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
  { key: 'retention',    target: 94,   suffix: '%',  isFloat: false, Icon: TrendingUp, color: '#fbbf24', glow: 'rgba(251,191,36,0.3)'  },
  { key: 'satisfaction', target: 4.9,  suffix: '/5', isFloat: true,  Icon: Award,      color: '#f87171', glow: 'rgba(248,113,113,0.3)' },
  { key: 'books',        target: 100,  suffix: '+',  isFloat: false, Icon: Zap,        color: '#38bdf8', glow: 'rgba(56,189,248,0.3)'  },
] as const;

const animClasses = [
  'animate-fade-up-fast', 'animate-fade-up', 'animate-fade-up-light-slow',
  'animate-fade-down-fast', 'animate-fade-down', 'animate-fade-down-light-slow',
];

export function StatsSection() {
  const { t } = useTranslation('stats');
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(statConfig.map(() => 0));

  // Trigger when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!isVisible) return;
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      setCounts(
        statConfig.map(s => {
          const val = s.target * progress;
          return s.isFloat ? parseFloat(val.toFixed(1)) : Math.round(val);
        }),
      );
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1b2e 0%, #0a1628 100%)' }}
    >
      {/* Top / bottom separator lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <div className="animate-fade-up-fast inline-flex mb-4">
            <span
              className="text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-widest"
              style={{ background: 'rgba(71,85,105,0.5)', border: '1px solid rgba(71,85,105,0.7)' }}
            >
              {t('badge', 'Platform Results')}
            </span>
          </div>
          <h2 className="animate-fade-up text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title', 'Numbers That Speak for Themselves')}
          </h2>
          <p className="animate-fade-up-light-slow text-slate-400 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats grid — 2 cols → 3 cols → 6 cols */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statConfig.map((stat, i) => {
            const { Icon } = stat;
            return (
              <div
                key={stat.key}
                className={`${animClasses[i]} card-golden-hover group text-center rounded-md p-5 transition-all duration-300 hover:-translate-y-1`}
                style={{ background: 'rgba(15,30,55,0.6)', border: '1px solid rgba(71,85,105,0.4)' }}
              >
                {/* Glowing icon */}
                <div
                  className="mx-auto mb-3 w-11 h-11 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle, ${stat.glow} 0%, rgba(0,0,0,0) 70%)`,
                    border: `1px solid ${stat.color}33`,
                    boxShadow: `0 0 18px ${stat.glow}`,
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>

                {/* Animated count */}
                <div
                  className="text-2xl font-extrabold mb-1 tabular-nums"
                  style={{ color: stat.color }}
                >
                  {counts[i]}{stat.suffix}
                </div>

                <div className="text-white text-xs font-semibold mb-1">
                  {t(`items.${stat.key}.label`)}
                </div>
                <div className="text-slate-500 text-[11px] leading-tight">
                  {t(`items.${stat.key}.description`)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust banner */}
        <div
          className="card-shine-hover animate-fade-up-very-slow mt-12 rounded-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, rgba(0,0,0,0) 70%)',
                border: '1px solid rgba(96,165,250,0.3)',
                boxShadow: '0 0 16px rgba(96,165,250,0.2)',
              }}
            >
              <Star size={17} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t('trustBanner.text')}</p>
              <p className="text-slate-400 text-xs">{t('trustBanner.subtext')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, j) => (
              <Star key={j} size={15} className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-slate-300 text-sm font-semibold ml-2">{t('trustBanner.rating')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
