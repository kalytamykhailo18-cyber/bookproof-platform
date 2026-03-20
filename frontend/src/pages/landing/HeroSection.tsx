import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useHeroContent } from '@/hooks/useLandingContent';

export function HeroSection() {
  const content = useHeroContent();

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050d20 0%, #0a1628 35%, #0f1f42 65%, #0a1628 100%)' }}
    >
      <div className="absolute inset-0 landing-dot-grid opacity-40" />
      {/* Bottom mask — blends into StatsSection video (#0a1628) */}
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to top, #0a1628 0%, transparent 100%)' }} />

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
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-center">

          {/* ── Left: text ── */}
          <div className="relative space-y-8">

            {/* Floating glow orbs */}
            <div className="absolute -left-10 top-0 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)', animation: 'float-y 7s ease-in-out infinite' }} />
            <div className="absolute right-4 bottom-8 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'float-y 9s ease-in-out infinite reverse' }} />

            {/* Title */}
            <div className="animate-fade-up relative z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold leading-[1.08] tracking-tight">
                <span className="text-white block">{content.titleLine1}</span>
                <span className="animate-text-shimmer block my-1">{content.titleLine2}</span>
                <span className="text-white block font-semibold text-2xl sm:text-3xl lg:text-[2rem] mt-2">{content.titleLine3}</span>
              </h1>
              {/* Accent line */}
              <div className="mt-5 h-px w-32"
                style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6, transparent)' }} />
            </div>

            {/* Subtitle */}
            <p className="text-lg text-white leading-relaxed max-w-md animate-fade-up-light-slow relative z-10">
              {content.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 animate-fade-up-slow relative z-10">
              <Link
                to="/register"
                className="animate-btn-shine relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md text-base font-semibold text-white landing-btn-primary"
                style={{ boxShadow: '0 0 32px rgba(59,130,246,0.45), 0 4px 20px rgba(59,130,246,0.3)' }}
              >
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-golden-flow inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md text-base font-medium text-white hover:text-white transition-colors duration-200"
              >
                <Play className="h-4 w-4 fill-current" />
                {content.ctaSecondary}
              </a>
            </div>

          </div>

          {/* ── Right: hero image ── */}
          <div className="relative flex items-center justify-center animate-zoom-in-light-slow mt-8 lg:mt-0">
            {/* Glow effect behind image */}
            <div
              className="absolute inset-0 rounded-2xl opacity-60"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.2) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Hero image with responsive sizing and smooth edge fade */}
            <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[500px] xl:max-w-[560px]">
              <img
                src="/hero.png"
                alt="BookProof platform"
                className="w-full h-auto object-cover"
                style={{
                  transform: 'scale(1.04)',
                  transformOrigin: 'top center',
                  maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, black 65%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%), linear-gradient(to right, black 65%, transparent 100%)',
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
