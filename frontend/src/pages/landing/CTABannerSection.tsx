import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';

export function CTABannerSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden" style={{ background: '#080d1a' }}>
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div
          className="w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.13) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-md px-8 py-16 sm:px-16 sm:py-20 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.11) 0%, rgba(99,102,241,0.11) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          {/* Corner decorations */}
          <div
            className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
            style={{ background: 'radial-gradient(circle at bottom left, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
          />

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-up-fast">
            Ready to Launch Your Book{' '}
            <span className="landing-gradient-text">to the Top?</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-12 animate-fade-up">
            Join 500+ authors who trust BookProof for authentic, lasting Amazon reviews.
            Start your first campaign today and watch your rankings grow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up-light-slow">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-md text-base font-semibold text-white landing-btn-primary"
            >
              <BookOpen className="h-4 w-4" />
              Start as an Author
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-md text-base font-medium text-slate-300 border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <Users className="h-4 w-4" />
              Join as a Reader
            </Link>
          </div>

          {/* Micro-stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 animate-fade-up-slow">
            {[
              { value: '10,000+', label: 'Reviews Delivered' },
              { value: '500+',    label: 'Happy Authors'     },
              { value: '94%',     label: 'Review Retention'  },
              { value: '$0',      label: 'Setup Fee'         },
            ].map((s, i) => (
              <div key={i} className="text-center animate-zoom-in-fast">
                <div className="text-2xl font-bold landing-gradient-text mb-1">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
