import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileBarChart2, Target, Layers, MessageSquare, Search, ArrowRight } from 'lucide-react';

const ICONS = [LayoutDashboard, FileBarChart2, Target, Layers, MessageSquare, Search];
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
const KEYS = ['dashboard', 'reports', 'genreMatch', 'formats', 'feedback', 'keywordResearch'] as const;

const CARD_ANIMATIONS = [
  'animate-fade-right-fast',
  'animate-fade-up-fast',
  'animate-fade-left-fast',
  'animate-fade-right',
  'animate-fade-up',
  'animate-fade-left',
];

export function ForAuthorsSection() {
  const { t } = useTranslation('forAuthors');

  return (
    <section
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg-4.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Top mask — blends into FeaturesSection (#080d1a) */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, #080d1a 0%, transparent 100%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#ffffff', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {t('badge', 'For Authors')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 animate-fade-up-fast">
            {t('title', 'Everything an Author Needs to Launch Successfully')}
          </h2>
          <p className="text-white text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Benefit cards */}
        {/* lg+: overlapping row with rotateY 3D effect */}
        <div className="hidden lg:flex items-stretch justify-center mb-14 sm:mb-16">
          {KEYS.map((key, i) => {
            const Icon = ICONS[i];
            const color = COLORS[i];
            const n = KEYS.length;
            const overlap = 150;
            const totalOverlap = overlap * (n - 1);
            return (
              <div
                key={key}
                className={`relative flex-shrink-0 landing-card-light rounded-md p-6 group flex flex-col ${CARD_ANIMATIONS[i]}`}
                style={{
                  width: `calc((100% + ${totalOverlap}px) / ${n})`,
                  marginLeft: i === 0 ? 0 : -overlap,
                  zIndex: i + 1,
                  transform: 'perspective(600px) rotateY(45deg)',
                  transformOrigin: 'center center',
                  boxShadow: '-6px 0 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.3s ease',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.zIndex = '50';
                  el.style.transform = 'perspective(600px) rotateY(0deg) scale(1.2) translateY(-6px)';
                  el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08)';
                  el.style.background = '#ffffff';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.zIndex = String(i + 1);
                  el.style.transform = 'perspective(600px) rotateY(45deg) scale(1)';
                  el.style.boxShadow = '-6px 0 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)';
                  el.style.background = 'transparent';
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <h3 className="text-md font-semibold text-white group-hover:text-black mb-2 transition-colors duration-200">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm text-white group-hover:text-black leading-relaxed flex-1 transition-colors duration-200">
                  {t(`items.${key}.description`)}
                </p>
                <div
                  className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded-sm"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                />
              </div>
            );
          })}
        </div>

        {/* below lg: normal grid */}
        <div className="grid sm:grid-cols-2 lg:hidden gap-5 sm:gap-6 mb-14 sm:mb-16">
          {KEYS.map((key, i) => {
            const Icon = ICONS[i];
            const color = COLORS[i];
            return (
              <div
                key={key}
                className={`landing-card-light landing-card-light-hover rounded-md p-7 group ${CARD_ANIMATIONS[i]}`}
                style={{ background: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#ffffff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-md mt-0.5 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-black mb-2 transition-colors duration-200">
                      {t(`items.${key}.title`)}
                    </h3>
                    <p className="text-sm text-white group-hover:text-black leading-relaxed transition-colors duration-200">
                      {t(`items.${key}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overlapping book covers */}
        <div className="flex flex-col items-center mb-10 animate-fade-up">
          {(() => {
            const configs: [number[], number, number, number][] = [
              [[0,2,4,6,8],          56,  88,  16],
              [[0,1,3,5,7,8,10],     70, 110,  20],
              [[0,1,2,3,4,5,6,7,8,9,10], 100, 160, 22],
            ];
            return configs.map(([books, w, h, overlap], ci) => {
              const cls = ci === 0 ? 'flex sm:hidden' : ci === 1 ? 'hidden sm:flex lg:hidden' : 'hidden lg:flex';
              const arr = books;
              const mid = Math.floor(arr.length / 2);
              return (
                <div key={ci} className={`${cls} items-end overflow-visible mb-5`}>
                  {arr.map((n, i) => {
                    const angle = (i - mid) * 3;
                    return (
                      <img
                        key={n}
                        src={`/images/${n}.jpg`}
                        alt={`Book ${n}`}
                        style={{
                          width: w,
                          height: h,
                          objectFit: 'cover',
                          borderRadius: 4,
                          marginLeft: i === 0 ? 0 : -overlap,
                          zIndex: i <= mid ? i : arr.length - i,
                          position: 'relative',
                          boxShadow: '-3px 4px 10px rgba(0,0,0,0.22)',
                          transform: `rotate(${angle}deg)`,
                          transformOrigin: 'bottom center',
                          border: '1px solid rgba(255,255,255,0.6)',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease, z-index 0s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.transform = `rotate(${angle}deg) scale(1.3)`;
                          el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.45)';
                          el.style.zIndex = '99';
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.transform = `rotate(${angle}deg)`;
                          el.style.boxShadow = '-3px 4px 10px rgba(0,0,0,0.22)';
                          el.style.zIndex = String(i <= mid ? i : arr.length - i);
                        }}
                      />
                    );
                  })}
                </div>
              );
            });
          })()}
          <p className="text-xs text-white font-medium tracking-wide uppercase">
            {t('socialProof')}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-up-slow">
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md text-base font-semibold text-white landing-btn-primary"
          >
            {t('cta', 'Start Your Campaign')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-white mt-3">{t('noSubscription')}</p>
        </div>
      </div>
    </section>
  );
}
