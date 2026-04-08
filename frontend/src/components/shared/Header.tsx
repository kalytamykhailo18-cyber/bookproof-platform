import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':     return '/admin/dashboard';
    case 'AUTHOR':    return '/author';
    case 'READER':    return '/reader';
    case 'AFFILIATE': return '/affiliate/dashboard';
    case 'CLOSER':    return '/closer';
    default:          return '/';
  }
}

export function Header() {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location.pathname === '/';

  // Anchor nav links — only shown on landing page
  const navLinks = [
    { href: '#features',     label: t('nav.features')   },
    { href: '#how-it-works', label: t('nav.howItWorks') },
    { href: '#pricing',      label: t('nav.pricing')    },
    { href: '#faq',          label: t('nav.faq')        },
  ];

  const dashboardPath = user ? getDashboardPath(user.role) : '/';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{ background: 'rgba(8, 13, 26, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      {/* ── Desktop bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div
            className="flex items-center shrink-0 cursor-pointer"
            onClick={() => isLanding ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/')}
          >
            <img src="/logo.png" alt="BookProof" className="h-14 w-auto px-1" />
          </div>

          {/* Nav links — lg+, landing page only */}
          {isLanding && (
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#ddd] hover:text-white transition-colors duration-200 font-medium whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Right actions — lg+ */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white landing-btn-primary whitespace-nowrap"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t('nav.dashboard', 'Dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="select-none px-3 py-1.5 rounded-md text-sm font-medium text-[#ddd] hover:text-white hover:bg-white/10 visited:text-[#ddd] focus:outline-none transition-all duration-200 whitespace-nowrap"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="select-none px-3 py-1.5 rounded-md text-sm font-medium text-white visited:text-white focus:outline-none landing-btn-primary whitespace-nowrap"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — below lg */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden shrink-0 text-[#ddd] hover:text-white transition-colors p-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-white/10"
          style={{ background: 'rgba(8, 13, 26, 0.98)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Nav links — landing page only */}
            {isLanding && (
              <div className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-[#ddd] hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="pb-4 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white landing-btn-primary"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {t('nav.dashboard', 'Dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="select-none text-center py-2.5 rounded-md text-sm font-medium text-[#ddd] visited:text-[#ddd] border border-white/20 hover:bg-white/10 focus:outline-none transition-all duration-200"
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
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
