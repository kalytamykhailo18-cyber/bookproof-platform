import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const tKeys = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'] as const;
const N = tKeys.length;

const meta = [
  { accent: '#60a5fa', industry: 'Romance',     avatar: 'https://i.pravatar.cc/40?img=1'  },
  { accent: '#a78bfa', industry: 'Thriller',    avatar: 'https://i.pravatar.cc/40?img=5'  },
  { accent: '#34d399', industry: 'Sci-Fi',      avatar: 'https://i.pravatar.cc/40?img=11' },
  { accent: '#fbbf24', industry: 'Non-Fiction', avatar: 'https://i.pravatar.cc/40?img=15' },
  { accent: '#f472b6', industry: 'Mystery',     avatar: 'https://i.pravatar.cc/40?img=20' },
  { accent: '#38bdf8', industry: 'Fantasy',     avatar: 'https://i.pravatar.cc/40?img=25' },
  { accent: '#f87171', industry: 'Business',    avatar: 'https://i.pravatar.cc/40?img=32' },
  { accent: '#818cf8', industry: 'Audiobook',   avatar: 'https://i.pravatar.cc/40?img=44' },
  { accent: '#2dd4bf', industry: "Children's",  avatar: 'https://i.pravatar.cc/40?img=47' },
];

function QuoteIcon({ color }: { color: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={color} opacity={0.3}>
      <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
    </svg>
  );
}

export function TestimonialsSection() {
  const { t } = useTranslation('testimonials');
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlide = N - visibleCount;

  // Autoplay — resets when user interacts
  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c >= maxSlide ? 0 : c + 1));
    }, 5000);
  }, [maxSlide]);

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoplay]);

  const go = (dir: number) => {
    setCurrent(c => Math.max(0, Math.min(maxSlide, c + dir)));
    startAutoplay();
  };

  const goTo = (i: number) => {
    setCurrent(i);
    startAutoplay();
  };

  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#080d1a' }}
    >
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
          <div className="animate-fade-up-fast inline-flex mb-4">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-widest"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              {t('badge', 'Success Stories')}
            </span>
          </div>
          <h2 className="animate-fade-up text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title', 'Authors Who Transformed Their Amazon Presence')}
          </h2>
          <p className="animate-fade-up-light-slow text-slate-400 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="animate-fade-up-slow flex items-center justify-center gap-1 mt-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-slate-400 text-sm ml-2">4.9/5 from 500+ authors</span>
          </div>
        </div>

        {/* Carousel viewport */}
        <div className="overflow-hidden mb-8">
          {/* Sliding track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${(N / visibleCount) * 100}%`,
              transform: `translateX(calc(-${current} * 100% / ${N}))`,
            }}
          >
            {tKeys.map((key, i) => {
              const m = meta[i];
              const authorName = t(`items.${key}.author`);
              return (
                <div
                  key={key}
                  className="px-2.5"
                  style={{ width: `${100 / N}%` }}
                >
                  <div
                    className="group relative rounded-md p-6 h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: 'rgba(15,23,42,0.85)',
                      border: '1px solid rgba(71,85,105,0.45)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = `${m.accent}45`;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${m.accent}14`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(71,85,105,0.45)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(to bottom, ${m.accent}, ${m.accent}44)` }}
                    />

                    {/* Quote icon */}
                    <div className="mb-3 pl-2">
                      <QuoteIcon color={m.accent} />
                    </div>

                    {/* Industry tag */}
                    <span
                      className="self-start ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-4"
                      style={{
                        color: m.accent,
                        background: `${m.accent}15`,
                        border: `1px solid ${m.accent}30`,
                      }}
                    >
                      {m.industry}
                    </span>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3 pl-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5 italic pl-2">
                      &ldquo;{t(`items.${key}.quote`)}&rdquo;
                    </p>

                    {/* Author */}
                    <div
                      className="flex items-center gap-3 pt-4 pl-2"
                      style={{ borderTop: '1px solid rgba(71,85,105,0.3)' }}
                    >
                      <img
                        src={m.avatar}
                        alt={authorName}
                        className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                        style={{ border: `2px solid ${m.accent}55` }}
                      />
                      <div>
                        <p className="text-white text-sm font-semibold">{authorName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{t(`items.${key}.title`)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            disabled={current === 0}
            className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(71,85,105,0.5)' }}
            onMouseEnter={e => current !== 0 && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(96,165,250,0.5)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71,85,105,0.5)')}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            {[...Array(maxSlide + 1)].map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '24px' : '6px',
                  background: i === current ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            disabled={current === maxSlide}
            className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(71,85,105,0.5)' }}
            onMouseEnter={e => current !== maxSlide && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(96,165,250,0.5)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71,85,105,0.5)')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
