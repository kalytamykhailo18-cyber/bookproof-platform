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
      style={{ background: '#ffffff' }}
    >
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(59,130,246,0.05) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom left, rgba(99,102,241,0.04) 0%, transparent 60%)' }}
      />

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-14 sm:mb-16">
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
            <span className="ml-3 text-xs text-slate-400">Author Dashboard — My Campaigns</span>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            {[
              { label: 'Available Credits', value: '150', color: '#3b82f6' },
              { label: 'Active Campaigns', value: '3',   color: '#10b981' },
              { label: 'Reviews Delivered', value: '287', color: '#8b5cf6' },
              { label: 'Completion Rate',   value: '94%', color: '#f59e0b' },
            ].map((card, ci) => (
              <div
                key={ci}
                className="rounded-md p-4 text-center animate-zoom-in-fast"
                style={{ background: '#f8fafc', border: '1px solid rgba(203,213,225,0.8)' }}
              >
                <div className="text-2xl font-bold mb-1.5" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs text-slate-500">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Campaign rows */}
          <div className="space-y-2.5">
            {[
              { title: 'The Last Horizon',    progress: 72,  status: 'Active',   reviews: '72/100' },
              { title: 'Voices in the Dark',  progress: 100, status: 'Complete', reviews: '50/50'  },
              { title: 'Chronicles of Ember', progress: 28,  status: 'Active',   reviews: '28/100' },
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
                      style={{ width: `${camp.progress}%`, background: camp.status === 'Complete' ? '#10b981' : '#3b82f6' }}
                    />
                  </div>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">{camp.reviews}</div>
                <span
                  className="text-xs px-2.5 py-1 rounded-sm font-medium whitespace-nowrap"
                  style={camp.status === 'Complete'
                    ? { background: 'rgba(16,185,129,0.12)', color: '#059669' }
                    : { background: 'rgba(59,130,246,0.12)', color: '#2563eb' }}
                >
                  {camp.status}
                </span>
              </div>
            ))}
          </div>
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
          <p className="text-xs text-slate-400 mt-3">No subscription required. Pay per credit package.</p>
        </div>
      </div>
    </section>
  );
}
