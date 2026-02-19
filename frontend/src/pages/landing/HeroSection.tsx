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

      {/* Main content — top padding accounts for fixed 64px nav */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-24 sm:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">

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
          </div>

          {/* ── Right: hero image ── */}
          <div className="relative flex items-center justify-center animate-zoom-in-light-slow">
            <div className="relative w-full">
              <img
                src="/hero.png"
                alt="BookProof platform"
                className="w-full rounded-md object-cover"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, black 60%, transparent 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'destination-in',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
