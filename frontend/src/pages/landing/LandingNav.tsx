import { useState, useEffect, useRef } from 'react';
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
  const langRef = useRef<HTMLDivElement>(null);

  // Close lang dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [langOpen]);

  function handleLangChange(code: string) {
    i18n.changeLanguage(code);
    setLangOpen(false);
    setMobileOpen(false);
  }

  const navLinks = [
    { href: '#features', label: t('nav.features') },
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#pricing', label: t('nav.pricing') },
    { href: '#faq', label: t('nav.faq') },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ background: 'rgba(8, 13, 26, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* ── Desktop / tablet bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Book<span className="landing-gradient-text">Proof</span>
            </span>
          </div>

          {/* Nav links — lg+ */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right actions — lg+ */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>{currentLang.label}</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-md border border-white/10 py-1 shadow-xl min-w-max z-10"
                  style={{ background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(12px)' }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
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
              className="select-none px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 visited:text-slate-300 focus:outline-none transition-all duration-200 whitespace-nowrap"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="select-none px-3 py-1.5 rounded-md text-sm font-medium text-white visited:text-white focus:outline-none landing-btn-primary whitespace-nowrap"
            >
              {t('nav.signup')}
            </Link>
          </div>

          {/* Hamburger — below lg */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden shrink-0 text-slate-300 hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* ── Mobile menu — below lg ── */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-white/10"
          style={{ background: 'rgba(8, 13, 26, 0.98)' }}
        >
          {/* Same container as the bar above */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Nav links */}
            <div className="py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Language row */}
            <div className="py-3 border-t border-white/10 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
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

            {/* CTA buttons */}
            <div className="pb-4 flex flex-col gap-2">
              <Link
                to="/login"
                className="select-none text-center py-2.5 rounded-md text-sm font-medium text-slate-300 visited:text-slate-300 border border-white/20 hover:bg-white/10 focus:outline-none transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="select-none text-center py-2.5 rounded-md text-sm font-medium text-white visited:text-white focus:outline-none landing-btn-primary"
                onClick={() => setMobileOpen(false)}
              >
                {t('nav.signup')}
              </Link>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
