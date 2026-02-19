import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIAL_KEYS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'] as const;

const AVATAR_GRADIENTS = [
  ['#3b82f6', '#6366f1'], ['#a78bfa', '#ec4899'], ['#34d399', '#60a5fa'],
  ['#fbbf24', '#f97316'], ['#f472b6', '#a78bfa'], ['#60a5fa', '#34d399'],
  ['#6366f1', '#3b82f6'], ['#ec4899', '#f97316'], ['#34d399', '#a78bfa'],
];

const CARD_ANIMATIONS = [
  'animate-fade-up-fast',   'animate-zoom-in-fast',      'animate-fade-up',
  'animate-fade-right-fast','animate-zoom-in',            'animate-fade-left-fast',
  'animate-fade-up-light-slow','animate-zoom-in-light-slow','animate-fade-up-slow',
];

export function TestimonialsSection() {
  const { t } = useTranslation('testimonials');
  const [featured, setFeatured] = useState(0);

  const prev = () => setFeatured((p) => (p === 0 ? TESTIMONIAL_KEYS.length - 1 : p - 1));
  const next = () => setFeatured((p) => (p === TESTIMONIAL_KEYS.length - 1 ? 0 : p + 1));

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ background: '#080d1a' }}>
      <div className="absolute inset-0 landing-dot-grid opacity-20" />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            {t('badge', 'Success Stories')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 animate-fade-up-fast">
            {t('title', 'Authors Who Transformed Their Amazon Presence')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="mb-12 sm:mb-14 animate-zoom-in-fast">
          <div
            className="relative landing-card rounded-md p-8 sm:p-12 max-w-3xl mx-auto"
            style={{ border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <Quote className="absolute top-8 left-8 h-10 w-10 text-blue-500/15" />

            <div className="text-center space-y-7">
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
              </div>

              <blockquote className="text-base sm:text-lg text-slate-300 leading-relaxed italic">
                "{t(`items.${TESTIMONIAL_KEYS[featured]}.quote`)}"
              </blockquote>

              <div className="flex items-center justify-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${AVATAR_GRADIENTS[featured][0]}, ${AVATAR_GRADIENTS[featured][1]})` }}
                >
                  {t(`items.${TESTIMONIAL_KEYS[featured]}.author`).charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{t(`items.${TESTIMONIAL_KEYS[featured]}.author`)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t(`items.${TESTIMONIAL_KEYS[featured]}.title`)}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {TESTIMONIAL_KEYS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeatured(i)}
                    className="h-1.5 rounded-sm transition-all duration-200"
                    style={{ width: i === featured ? '20px' : '6px', background: i === featured ? '#3b82f6' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini testimonial grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIAL_KEYS.map((key, i) => (
            <button
              key={key}
              onClick={() => setFeatured(i)}
              className={`landing-card landing-card-hover rounded-md p-6 text-left group transition-all duration-200 ${CARD_ANIMATIONS[i]} ${i === featured ? 'ring-1 ring-blue-500/40' : ''}`}
            >
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-5 group-hover:text-slate-300 transition-colors duration-200">
                "{t(`items.${key}.quote`)}"
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${AVATAR_GRADIENTS[i][0]}, ${AVATAR_GRADIENTS[i][1]})` }}
                >
                  {t(`items.${key}.author`).charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{t(`items.${key}.author`)}</p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{t(`items.${key}.title`)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
