import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Shield, Zap } from 'lucide-react';

export function HeroSection() {
  const { t } = useTranslation('hero');

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050d20 0%, #0a1628 35%, #0f1f42 65%, #0a1628 100%)' }}
    >
      <div className="absolute inset-0 landing-dot-grid opacity-40" />

      {/* Primary glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.16) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
      />

      {/* Floating accent badges — desktop only */}
      <div className="absolute top-28 left-10 hidden xl:flex animate-fade-right-light-slow">
        <div className="landing-card rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-slate-300 font-medium">4.9/5 Author Rating</span>
        </div>
      </div>
      <div className="absolute top-44 right-10 hidden xl:flex animate-fade-left-slow">
        <div className="landing-card rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs text-slate-300 font-medium">14-Day Guarantee</span>
        </div>
      </div>
      <div className="absolute bottom-36 left-14 hidden xl:flex animate-fade-right-slow">
        <div className="landing-card rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs text-slate-300 font-medium">Progressive Delivery</span>
        </div>
      </div>

      {/* Main content — top padding accounts for fixed 64px nav */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-24 sm:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Left: text ── */}
          <div className="space-y-8">
            <div className="animate-fade-up-fast">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium border"
                style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.35)', color: '#93c5fd' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Trusted by 500+ Authors Worldwide
              </span>
            </div>

            <div className="animate-fade-up">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                {t('title', 'Get Authentic Amazon Reviews That Last').split('Amazon').map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>{part}<span className="landing-gradient-text">Amazon</span></span>
                  ) : <span key={i}>{part}</span>
                )}
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg animate-fade-up-light-slow">
              {t('subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up-slow">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md text-base font-semibold text-white landing-btn-primary"
              >
                {t('cta.primary', 'Start Getting Reviews')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md text-base font-medium text-slate-300 border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <Play className="h-4 w-4 fill-current" />
                {t('cta.secondary', 'See How It Works')}
              </a>
            </div>

            {/* Inline stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 animate-fade-up-very-slow">
              {[
                { value: '10,000+', label: t('stats.reviews', 'Reviews Delivered') },
                { value: '500+', label: t('stats.authors', 'Happy Authors') },
                { value: '2,500+', label: t('stats.readers', 'Verified Readers') },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center px-3 py-4 rounded-md border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="text-2xl font-bold landing-gradient-text">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1.5 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: visual card ── */}
          <div className="relative hidden lg:flex items-center justify-center animate-zoom-in-light-slow">
            {/* Glow ring */}
            <div
              className="absolute w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)' }}
            />

            {/* Dashboard card */}
            <div className="relative landing-card rounded-md p-8 w-80 text-center space-y-6 z-10 border border-blue-500/20">
              {/* Book icon */}
              <div
                className="mx-auto w-16 h-16 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3730a3)' }}
              >
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Campaign Progress</p>
                <p className="text-white font-semibold">My Debut Novel</p>
                <div className="h-2 bg-slate-700/80 rounded-sm overflow-hidden mt-3">
                  <div className="h-full rounded-sm" style={{ width: '72%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>72 reviews</span>
                  <span>100 total</span>
                </div>
              </div>

              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-xs text-slate-400">Avg. internal rating: 4.8</p>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Campaign Active
              </span>
            </div>

            {/* Floating mini-cards */}
            <div className="absolute -top-5 -right-5 landing-card rounded-md px-3.5 py-2.5 text-xs animate-fade-left-fast">
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 font-bold">+3</span>
                <span className="text-slate-400">reviews today</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 landing-card rounded-md px-3.5 py-2.5 text-xs animate-fade-right-fast">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-blue-400" />
                <span className="text-slate-400">All reviews active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #1f2434ff)' }}
      />
    </section>
  );
}
