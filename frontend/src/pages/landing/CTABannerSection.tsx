import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';

export function CTABannerSection() {
  const { t } = useTranslation('ctaBanner');
  const stats = t('stats', { returnObjects: true }) as Array<{ value: string; label: string }>;

  return (
    <section
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/bg-3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      {/* <div className="absolute inset-0 bg-black/60" /> */}
      {/* Top mask */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to bottom, #f1f5f9 0%, transparent 100%)' }} />
      {/* Bottom mask */}
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-10" style={{ background: 'linear-gradient(to top, #080d1a 0%, transparent 100%)' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-up-fast">
          {t('title')}{' '}
          <span className="landing-gradient-text">{t('titleHighlight')}</span>
        </h2>
        <p className="text-[#00f] text-lg max-w-xl mx-auto mb-12 animate-fade-up">
          {t('subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up-light-slow">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-md text-base font-semibold text-white landing-btn-primary"
          >
            <BookOpen className="h-4 w-4" />
            {t('cta.author')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-md text-base font-medium text-[#fff] border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            {t('cta.reader')}
          </Link>
        </div>

        {/* Micro-stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 animate-fade-up-slow">
          {Array.isArray(stats) && stats.map((s, i) => (
            <div key={i} className="text-center animate-zoom-in-fast">
              <div className="text-2xl font-bold landing-gradient-text mb-1">{s.value}</div>
              <div className="text-xs text-[#aaf]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
