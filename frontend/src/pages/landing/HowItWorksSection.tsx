import { useTranslation } from 'react-i18next';
import { CreditCard, BookOpen, Users, Star, Check } from 'lucide-react';

const STEP_ICONS = [CreditCard, BookOpen, Users, Star];
const STEP_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
const STEP_KEYS = ['purchase', 'submit', 'distribute', 'reviews'] as const;

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
      style={{ background: '#f1f5f9' }}
    >
      <div className="absolute inset-0 landing-dot-grid-light opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {t('badge', 'Simple Process')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'From Zero Reviews to Bestseller in 4 Steps')}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps — alternate left/right */}
        <div className="space-y-20 sm:space-y-28">
          {STEP_KEYS.map((key, i) => {
            const Icon = STEP_ICONS[i];
            const color = STEP_COLORS[i];
            const anim = STEP_ANIMS[i];
            const isEven = i % 2 === 0;
            const details: string[] = t(`steps.${key}.details`, { returnObjects: true }) as string[];

            return (
              <div key={key} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Text side */}
                <div className={`space-y-7 ${!isEven ? 'lg:order-2' : ''} ${anim.text}`}>
                  {/* Step number row */}
                  <div className="flex items-center gap-5">
                    <div
                      className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-md text-xl font-extrabold"
                      style={{
                        background: `linear-gradient(135deg, ${color}22, ${color}0e)`,
                        border: `1px solid ${color}38`,
                        color,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}35, transparent)` }} />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 animate-fade-up-fast">
                      {t(`steps.${key}.title`)}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed animate-fade-up">
                      {t(`steps.${key}.description`)}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {Array.isArray(details) && details.map((detail, di) => (
                      <li key={di} className="flex items-start gap-3 animate-fade-right-fast">
                        <span
                          className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-sm"
                          style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                        >
                          <Check className="h-3 w-3" style={{ color }} />
                        </span>
                        <span className="text-sm text-slate-600 leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual card side */}
                <div className={`${!isEven ? 'lg:order-1' : ''} ${anim.card}`}>
                  <div
                    className="landing-card-light rounded-md p-8 sm:p-10 space-y-6 relative overflow-hidden"
                    style={{ border: `1px solid ${color}20`, boxShadow: `0 4px 24px ${color}10` }}
                  >
                    {/* Corner glow */}
                    <div
                      className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                      style={{ background: `radial-gradient(circle, ${color}10 0%, transparent 70%)` }}
                    />

                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-md"
                      style={{ background: `linear-gradient(135deg, ${color}20, ${color}0a)`, border: `1px solid ${color}28` }}
                    >
                      <Icon className="h-7 w-7" style={{ color }} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Step {i + 1}</p>
                      <h4 className="text-lg font-semibold text-slate-900">{t(`steps.${key}.title`)}</h4>
                    </div>

                    {/* Per-step UI preview */}
                    <div className="pt-2">
                      {key === 'purchase' && (
                        <div className="grid grid-cols-2 gap-3">
                          {['25 Credits', '50 Credits', '100 Credits', '200 Credits'].map((pkg, pi) => (
                            <div
                              key={pi}
                              className="rounded-md p-3 text-center text-xs font-medium"
                              style={
                                pi === 1
                                  ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb' }
                                  : { background: '#f8fafc', border: '1px solid rgba(203,213,225,0.8)', color: '#94a3b8' }
                              }
                            >
                              {pkg}
                              {pi === 1 && <div className="text-xs text-blue-500 mt-1">Most Popular</div>}
                            </div>
                          ))}
                        </div>
                      )}
                      {key === 'submit' && (
                        <div className="space-y-2.5">
                          {['Book title: My Debut Novel', 'Genre: Romance', 'Format: Ebook + Audiobook', 'Credits: 50'].map((field, fi) => (
                            <div key={fi} className="flex items-center gap-2.5 text-sm text-slate-500">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                              {field}
                            </div>
                          ))}
                        </div>
                      )}
                      {key === 'distribute' && (
                        <div className="space-y-3">
                          {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, wi) => (
                            <div key={wi} className="flex items-center gap-3 text-xs">
                              <span className="text-slate-400 w-12 flex-shrink-0">{week}</span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-sm overflow-hidden">
                                <div className="h-full rounded-sm" style={{ width: `${[80, 95, 85, 72][wi]}%`, background: color }} />
                              </div>
                              <span className="text-slate-400 w-8 text-right">{[12, 14, 13, 11][wi]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {key === 'reviews' && (
                        <div className="space-y-3">
                          {[5, 4, 3].map((stars, si) => (
                            <div key={si} className="flex items-center gap-3">
                              <div className="flex gap-0.5 flex-shrink-0">
                                {Array(stars).fill(0).map((_, k) => (
                                  <svg key={k} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <div className="flex-1 h-2 bg-slate-200 rounded-sm overflow-hidden">
                                <div className="h-full rounded-sm" style={{ width: `${[70, 20, 10][si]}%`, background: color }} />
                              </div>
                              <span className="text-xs text-slate-400 w-8 text-right">{[70, 20, 10][si]}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
            Start Your Campaign Today
          </a>
        </div>
      </div>
    </section>
  );
}
