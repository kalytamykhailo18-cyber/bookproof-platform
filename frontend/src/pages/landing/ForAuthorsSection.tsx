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
      style={{ background: '#f1f5f9' }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {t('badge', 'For Authors')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'Everything an Author Needs to Launch Successfully')}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
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
            const totalOverlap = overlap * (n - 1); // 150 × 5 = 750
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
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.zIndex = '50';
                  el.style.transform = 'perspective(600px) rotateY(0deg) translateY(-12px)';
                  el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.zIndex = String(i + 1);
                  el.style.transform = 'perspective(600px) rotateY(45deg)';
                  el.style.boxShadow = '-6px 0 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)';
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <h3 className="text-md font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">
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
              <div key={key} className={`landing-card-light landing-card-light-hover rounded-md p-7 group ${CARD_ANIMATIONS[i]}`}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-md mt-0.5 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {t(`items.${key}.title`)}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {t(`items.${key}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashboard mockup */}
        <div
          className="landing-card-light rounded-md p-6 sm:p-8 mb-14 sm:mb-16 animate-zoom-in-light-slow"
          style={{ border: '1px solid rgba(59,130,246,0.18)', boxShadow: '0 4px 24px rgba(59,130,246,0.07)' }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 mb-7">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-slate-400">{t('dashboardMock.title')}</span>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            {[
              { labelKey: 'dashboardMock.stats.credits',    value: '150', color: '#3b82f6' },
              { labelKey: 'dashboardMock.stats.campaigns',  value: '3',   color: '#10b981' },
              { labelKey: 'dashboardMock.stats.reviews',    value: '287', color: '#8b5cf6' },
              { labelKey: 'dashboardMock.stats.completion', value: '94%', color: '#f59e0b' },
            ].map((card, ci) => (
              <div
                key={ci}
                className="rounded-md p-4 text-center animate-zoom-in-fast"
                style={{ background: '#f8fafc', border: '1px solid rgba(203,213,225,0.8)' }}
              >
                <div className="text-2xl font-bold mb-1.5" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-slate-500">{t(card.labelKey)}</div>
              </div>
            ))}
          </div>

          {/* Campaign rows */}
          <div className="space-y-2.5">
            {[
              { title: 'The Last Horizon',    progress: 72,  statusKey: 'dashboardMock.status.active',   reviews: '72/100' },
              { title: 'Voices in the Dark',  progress: 100, statusKey: 'dashboardMock.status.complete', reviews: '50/50'  },
              { title: 'Chronicles of Ember', progress: 28,  statusKey: 'dashboardMock.status.active',   reviews: '28/100' },
            ].map((camp, ci) => (
              <div
                key={ci}
                className="flex items-center gap-5 p-4 rounded-md animate-fade-right-fast"
                style={{ background: '#f8fafc', border: '1px solid rgba(203,213,225,0.6)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-900 font-medium truncate mb-2">{camp.title}</div>
                  <div className="h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{ width: `${camp.progress}%`, background: camp.statusKey.includes('complete') ? '#10b981' : '#3b82f6' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{camp.reviews}</div>
                <span
                  className="text-xs px-2.5 py-1 rounded-sm font-medium whitespace-nowrap"
                  style={camp.statusKey.includes('complete')
                    ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                    : { background: 'rgba(59,130,246,0.12)', color: '#2563eb' }}
                >
                  {t(camp.statusKey)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overlapping book covers */}
        <div className="flex flex-col items-center mb-10 animate-fade-up">
          {/* xs–sm: 5 books at 56×88 */}
          {(() => {
            const configs: [number[], number, number, number][] = [
              [[0,2,4,6,8],          56,  88,  16],  // < sm
              [[0,1,3,5,7,8,10],     70, 110,  20],  // sm – lg
              [[0,1,2,3,4,5,6,7,8,9,10], 100, 160, 22],  // lg+
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
                        }}
                      />
                    );
                  })}
                </div>
              );
            });
          })()}
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
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
          <p className="text-xs text-slate-400 mt-3">{t('noSubscription')}</p>
        </div>
      </div>
    </section>
  );
}
