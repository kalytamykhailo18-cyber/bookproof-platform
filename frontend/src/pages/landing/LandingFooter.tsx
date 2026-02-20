import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import i18n from '../../lib/i18n';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
];

export function LandingFooter() {
  const { t } = useTranslation('footer');

  const navGroups = [
    {
      title: t('links.product.title', 'Product'),
      links: [
        { label: t('links.product.features',    'Features'),     href: '#features'    },
        { label: t('links.product.pricing',     'Pricing'),      href: '#pricing'     },
        { label: t('links.product.faq',         'FAQ'),          href: '#faq'         },
        { label: t('links.product.howItWorks',  'How It Works'), href: '#how-it-works'},
      ],
    },
    {
      title: t('links.company.title', 'Company'),
      links: [
        { label: t('links.company.about',   'About'),   href: '#'        },
        { label: t('links.company.contact', 'Contact'), href: '#contact' },
        { label: t('links.company.blog',    'Blog'),    href: '#'        },
      ],
    },
    {
      title: t('links.legal.title', 'Legal'),
      links: [
        { label: t('links.legal.privacy', 'Privacy Policy'),   href: '/privacy'  },
        { label: t('links.legal.terms',   'Terms of Service'), href: '/terms'    },
        { label: t('links.legal.cookies', 'Cookie Policy'),    href: '/cookies'  },
      ],
    },
  ];

  return (
    <footer
      className="relative"
      style={{ background: '#050a14', borderTop: '1px solid rgba(71,85,105,0.3)' }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-6 animate-fade-right-fast">
            <div
              className="flex items-center shrink-0 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="/logo.png" alt="BookProof" className="h-[90px] w-auto px-1" />
            </div>

            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              {t('tagline', 'Authentic Amazon reviews, delivered by real readers who love books.')}
            </p>

            {/* Social */}
            <div className="flex gap-2.5 animate-fade-up-fast">
              {[
                { Icon: Twitter,   href: '#', label: 'Twitter'   },
                { Icon: Linkedin,  href: '#', label: 'LinkedIn'  },
                { Icon: Instagram, href: '#', label: 'Instagram' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Language */}
            <div className="flex gap-1.5 animate-fade-up">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-200 border ${
                    i18n.language === code
                      ? 'text-blue-400 bg-blue-500/15 border-blue-500/30'
                      : 'text-slate-500 hover:text-slate-300 border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {navGroups.map((group, gi) => (
            <div key={group.title} className={gi === 0 ? 'animate-fade-up-fast' : gi === 1 ? 'animate-fade-up' : 'animate-fade-up-light-slow'}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link to={link.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-px mb-7 animate-fade-up-slow"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(71,85,105,0.4), transparent)' }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-up-slow">
          <p className="text-xs text-slate-600">
            {t('copyright', '© 2025 BookProof. All rights reserved.')}
          </p>
          <div className="flex items-center gap-5">
            <Link to="/terms"   className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-200">{t('bottomBar.terms')}</Link>
            <Link to="/privacy" className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-200">{t('bottomBar.privacy')}</Link>
            <Link to="/cookies" className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-200">{t('bottomBar.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
