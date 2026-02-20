import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Menu, X, ChevronDown } from 'lucide-react';
import i18n from '../../lib/i18n';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'pt', label: 'PT', name: 'Português' },
];

export function LandingNav() {
  const { t } = useTranslation('common');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  function handleLangChange(code: string) {
    i18n.changeLanguage(code);
    setLangOpen(false);
  }

  const navLinks = [
    { href: '#features', label: t('nav.features') },
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ background: 'rgba(8, 13, 26, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center gap-2 animate-fade-right-fast cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Book<span className="landing-gradient-text">Proof</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 animate-fade-down-fast">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3 animate-fade-left-fast">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang.label}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-white/10 py-1 shadow-xl"
                  style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)' }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${
                        lang.code === currentLang.code
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium">{lang.label}</span>
                      <span className="ml-2 text-slate-400 text-xs">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-md text-sm font-medium text-white landing-btn-primary"
            >
              {t('nav.signup')}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-300 hover:text-white transition-colors p-1 animate-zoom-in-fast"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 py-4 px-4 space-y-2 animate-fade-down-fast"
          style={{ background: 'rgba(8, 13, 26, 0.98)' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-3 border-t border-white/10">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  lang.code === currentLang.code
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Link
              to="/login"
              className="flex-1 text-center px-4 py-2 rounded-md text-sm font-medium text-slate-300 border border-white/20 hover:bg-white/10 transition-all duration-200"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center px-4 py-2 rounded-md text-sm font-medium text-white landing-btn-primary"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
