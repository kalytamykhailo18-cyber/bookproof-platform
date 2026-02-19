import { useTranslation } from 'react-i18next';

const IMAGES = [
  '/images/nature-1.jpg',
  '/images/nature-2.jpg',
  '/images/nature-3.jpg',
  '/images/nature-4.jpg',
];
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
const KEYS = ['protected', 'monitored', 'automatic', 'transparent'] as const;

const CARD_ANIMATIONS = [
  'animate-fade-right-fast',
  'animate-fade-up-fast',
  'animate-fade-left-fast',
  'animate-zoom-in-fast',
];

export function GuaranteeSection() {
  const { t } = useTranslation('guarantee');

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ background: '#ffffff' }}>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            {t('badge', 'Our Promise')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'The BookProof 14-Day Replacement Guarantee')}
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* 14-day badge */}
        <div className="flex justify-center mb-16 sm:mb-20 animate-zoom-in">
          <div
            className="relative flex items-center justify-center w-40 h-40 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.12) 100%)',
              border: '2px solid rgba(16,185,129,0.35)',
              boxShadow: '0 0 48px rgba(16,185,129,0.1), inset 0 0 30px rgba(16,185,129,0.04)',
            }}
          >
            <div className="text-center">
              <div className="text-5xl font-black text-slate-900 leading-none">14</div>
              <div className="text-sm font-semibold text-emerald-600">Day</div>
              <div className="text-xs text-emerald-500 uppercase tracking-widest">Guarantee</div>
            </div>
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-5"
              style={{ border: '2px solid #10b981' }}
            />
          </div>
        </div>

        {/* 4 guarantee cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-14 sm:mb-16">
          {KEYS.map((key, i) => {
            const color = COLORS[i];
            return (
              <div key={key} className={`landing-card-light landing-card-light-hover rounded-md overflow-hidden group flex flex-col ${CARD_ANIMATIONS[i]}`}>
                <div className="overflow-hidden">
                  <img
                    src={IMAGES[i]}
                    alt={key}
                    className="w-full h-36 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ borderBottom: `1px solid ${color}20` }}
                  />
                </div>
                <div className="p-5 sm:p-6 flex-1">
                  <h3 className="text-base font-semibold text-slate-900 mb-2.5 group-hover:text-green-700 transition-colors duration-200">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process timeline */}
        <div className="landing-card-light rounded-md p-7 sm:p-8 mb-10 animate-fade-up-slow">
          <h4 className="text-sm font-semibold text-slate-900 mb-8 text-center">Replacement Process Timeline</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { step: '1', label: 'Review Removed', desc: 'Amazon removes a validated review',              color: '#ec4899' },
              { step: '2', label: 'Detected',        desc: 'Our team detects removal within 14 days',        color: '#f59e0b' },
              { step: '3', label: 'Initiated',       desc: 'Replacement assigned from your campaign queue',  color: '#3b82f6' },
              { step: '4', label: 'Complete',        desc: 'New review delivered at no extra cost',          color: '#10b981' },
            ].map((item, ti) => (
              <div key={ti} className="text-center animate-zoom-in-fast">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3"
                  style={{ background: `${item.color}14`, border: `2px solid ${item.color}35`, color: item.color }}
                >
                  {item.step}
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1.5">{item.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-up-very-slow">
          {t('note')}
        </p>
      </div>
    </section>
  );
}
