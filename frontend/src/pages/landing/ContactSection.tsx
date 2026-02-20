import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';

export function ContactSection() {
  const { t } = useTranslation('contact');

  const channels = [
    {
      image: '/images/cut-1.png',
      key: 'email',
      color: '#3b82f6',
      href: 'mailto:support@bookproof.app',
      animation: 'animate-fade-right-fast',
      hours: true,
    },
    {
      image: '/images/cut-6.png',
      key: 'sales',
      color: '#8b5cf6',
      href: 'mailto:sales@bookproof.app',
      animation: 'animate-fade-left-fast',
    },
  ];

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#f1f5f9' }}
    >
      <div
        className="absolute top-0 left-0 w-[350px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(59,130,246,0.05) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[350px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom right, rgba(16,185,129,0.05) 0%, transparent 60%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', "Have Questions? We're Here.")}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Contact channels */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 mb-14 sm:mb-16">
          {channels.map(({ image, key, color, href, animation, hours }) => (
            <div key={key} className={`rounded-md overflow-hidden group ${animation}`}>
              <img
                src={image}
                alt={key}
                width={600}
                height={400}
                className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
                style={{
                  WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 50%)',
                  maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 50%)',
                }}
              />
              <div className="px-7 pt-6 pb-7 sm:px-8 sm:pt-8 sm:pb-8">
                <h3 className="text-base font-semibold text-slate-900 mb-2.5">{t(`${key}.title`)}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{t(`${key}.description`)}</p>
                {hours && (
                  <p className="text-xs text-slate-400 mb-4">
                    {t(`${key}.hours`, 'Monday – Friday, 9AM – 6PM EST')}
                  </p>
                )}
                <a
                  href={href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 hover:underline"
                  style={{ color }}
                >
                  {t(`${key}.actionLabel`)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Extra info row */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="landing-card-light rounded-md p-7 space-y-5 animate-fade-right-light-slow">
            <h4 className="text-sm font-semibold text-slate-900">{t('responsePromise.title')}</h4>
            <div className="space-y-3.5">
              {(t('responsePromise.items', { returnObjects: true }) as Array<{ label: string; time: string }>).map((item, idx) => {
                const colors = ['#3b82f6', '#10b981', '#8b5cf6'];
                const color = colors[idx];
                return (
                <div key={idx} className="flex items-center justify-between animate-fade-right-fast">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-sm"
                    style={{ background: `${color}10`, color }}
                  >
                    {item.time}
                  </span>
                </div>
                );
              })}
            </div>
          </div>

          <div className="landing-card-light rounded-md p-7 space-y-5 animate-fade-left-light-slow">
            <h4 className="text-sm font-semibold text-slate-900">{t('languages.title')}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('languages.description')}
            </p>
            <div className="flex gap-2.5">
              {[
                { flag: '🇺🇸', label: 'English'   },
                { flag: '🇧🇷', label: 'Português' },
                { flag: '🇪🇸', label: 'Español'   },
              ].map((lang) => (
                <div
                  key={lang.label}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs animate-zoom-in-fast"
                  style={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.8)' }}
                >
                  <span>{lang.flag}</span>
                  <span className="text-slate-600">{lang.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
