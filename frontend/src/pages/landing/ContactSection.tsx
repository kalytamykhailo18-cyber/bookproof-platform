import { useTranslation } from 'react-i18next';
import { Mail, MessageCircle, Briefcase, ExternalLink } from 'lucide-react';

export function ContactSection() {
  const { t } = useTranslation('contact');

  const channels = [
    {
      icon: Mail,
      key: 'email',
      color: '#3b82f6',
      actionLabel: 'Send Email',
      href: 'mailto:support@bookproof.app',
      animation: 'animate-fade-right-fast',
    },
    {
      icon: MessageCircle,
      key: 'support',
      color: '#10b981',
      actionLabel: 'Start Chat',
      href: '#',
      animation: 'animate-fade-up-fast',
      hours: true,
    },
    {
      icon: Briefcase,
      key: 'sales',
      color: '#8b5cf6',
      actionLabel: 'Contact Sales',
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
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-14 sm:mb-16">
          {channels.map(({ icon: Icon, key, color, actionLabel, href, animation, hours }) => (
            <div key={key} className={`landing-card-light landing-card-light-hover rounded-md p-7 sm:p-8 group ${animation}`}>
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-md mb-6 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}12`, border: `1px solid ${color}28` }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
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
                {actionLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Extra info row */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="landing-card-light rounded-md p-7 space-y-5 animate-fade-right-light-slow">
            <h4 className="text-sm font-semibold text-slate-900">Quick Response Promise</h4>
            <div className="space-y-3.5">
              {[
                { label: 'Email Support',        time: 'Within 24 hours',              color: '#3b82f6' },
                { label: 'Live Chat',            time: 'Under 5 min (business hours)', color: '#10b981' },
                { label: 'Enterprise Inquiries', time: 'Within 2 business days',       color: '#8b5cf6' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between animate-fade-right-fast">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-sm"
                    style={{ background: `${item.color}10`, color: item.color }}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-card-light rounded-md p-7 space-y-5 animate-fade-left-light-slow">
            <h4 className="text-sm font-semibold text-slate-900">Supported Languages</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our support team can assist you in English, Portuguese, and Spanish — matching your preferred language for a seamless experience.
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
