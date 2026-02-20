import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const STEP_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24'];
const STEP_KEYS = ['purchase', 'submit', 'distribute', 'reviews'] as const;
const STEP_IMAGES = [
  '/images/cut-1.png',
  '/images/cut-5.png',
  '/images/cut-3.png',
  '/images/cut-6.png',
];

const STEP_ANIMS = [
  { text: 'animate-fade-right', card: 'animate-fade-left-fast' },
  { text: 'animate-fade-left', card: 'animate-fade-right-fast' },
  { text: 'animate-fade-right-light-slow', card: 'animate-fade-left-light-slow' },
  { text: 'animate-fade-left-light-slow', card: 'animate-fade-right-light-slow' },
];

export function HowItWorksSection() {
  const { t } = useTranslation('howItWorks');

  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 relative"
      style={{ background: 'linear-gradient(180deg, #0a1020 0%, #080d1a 100%)' }}
    >
      <div className="absolute inset-0 landing-dot-grid opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            {t('badge', 'Simple Process')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 animate-fade-up-fast">
            {t('title', 'From Zero Reviews to Bestseller in 4 Steps')}
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps — alternate left/right */}
        <div className="space-y-20 sm:space-y-28">
          {STEP_KEYS.map((key, i) => {
            const color = STEP_COLORS[i];
            const anim = STEP_ANIMS[i];
            const isEven = i % 2 === 0;
            const details: string[] = t(`steps.${key}.details`, { returnObjects: true }) as string[];

            return (
              <div key={key} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Text side */}
                <div className={`space-y-7 ${!isEven ? 'lg:order-2' : ''} ${anim.text}`}>
                  <div className="flex items-center gap-5">
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-md text-xl font-extrabold"
                      style={{
                        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                        border: `1px solid ${color}45`,
                        color,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white animate-fade-up-fast">
                      {t(`steps.${key}.title`)}
                    </h3>
                    <p className="text-slate-400 text-base leading-relaxed animate-fade-up">
                      {t(`steps.${key}.description`)}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {Array.isArray(details) && details.map((detail, di) => (
                      <li key={di} className="flex items-start gap-3 animate-fade-right-fast">
                        <span
                          className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-sm"
                          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                        >
                          <Check className="h-3 w-3" style={{ color }} />
                        </span>
                        <span className="text-sm text-slate-300 leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual image side */}
                <div className={`${!isEven ? 'lg:order-1' : ''} ${anim.card}`}>
                  <img
                    src={STEP_IMAGES[i]}
                    alt={t(`steps.${key}.title`)}
                    className="w-full object-cover"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                      WebkitMaskComposite: 'source-in',
                      maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                      maskComposite: 'intersect',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20 sm:mt-28 animate-fade-up-slow">
          <a
            href="/register"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md text-base font-semibold text-white landing-btn-primary"
          >
            {t('startCta')}
          </a>
        </div>
      </div>
    </section>
  );
}
