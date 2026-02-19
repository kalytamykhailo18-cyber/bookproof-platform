import { ShieldCheck, Globe, Lock, Award } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    color: '#34d399',
    title: 'Amazon Policy Compliant',
    description: 'Our progressive delivery mimics natural, organic review growth. All readers genuinely read before reviewing.',
    animation: 'animate-fade-right-fast',
  },
  {
    icon: Globe,
    color: '#60a5fa',
    title: 'Global Reader Network',
    description: 'Verified readers across English, Portuguese, and Spanish markets. Available for books in all three languages.',
    animation: 'animate-fade-up-fast',
  },
  {
    icon: Lock,
    color: '#a78bfa',
    title: 'Secure & Private',
    description: 'Book files are stored with encrypted access. Readers cannot download audiobooks, and file access expires automatically.',
    animation: 'animate-fade-left-fast',
  },
  {
    icon: Award,
    color: '#fbbf24',
    title: '94% Review Retention Rate',
    description: 'With a 94% long-term retention rate, your Amazon listing keeps growing long after the campaign ends.',
    animation: 'animate-zoom-in-fast',
  },
];

export function TrustSection() {
  return (
    <section
      className="py-24 sm:py-32 relative"
      style={{ background: 'linear-gradient(180deg, #080d1a 0%, #0a1020 100%)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 animate-fade-up-fast">
            Built for Authors Who Take Their Career Seriously
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto animate-fade-up">
            Every decision we made was based on what's best for your Amazon ranking, your readers, and your long-term success.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, color, title, description, animation }) => (
            <div key={title} className={`landing-card landing-card-hover rounded-md p-7 group ${animation}`}>
              <div
                className="inline-flex items-center justify-center w-11 h-11 rounded-md mb-5 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2.5 group-hover:text-blue-300 transition-colors duration-200">
                {title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Format/feature badges */}
        <div className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-4 animate-fade-up-slow">
          {[
            { label: 'EPUB / PDF / MOBI', desc: 'Ebook formats' },
            { label: 'MP3 Streaming',     desc: 'Audiobook delivery' },
            { label: 'Stripe Payments',   desc: 'Secure checkout' },
            { label: '72-Hour Window',    desc: 'Reader deadline' },
            { label: 'Weekly Batches',    desc: 'Natural distribution' },
          ].map((badge, bi) => (
            <div
              key={badge.label}
              className={`flex flex-col items-center text-center px-5 py-3.5 rounded-md border ${bi % 2 === 0 ? 'animate-fade-up-fast' : 'animate-zoom-in-fast'}`}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(71,85,105,0.3)' }}
            >
              <span className="text-sm font-bold text-white">{badge.label}</span>
              <span className="text-xs text-slate-600 mt-0.5">{badge.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }}
      />
    </section>
  );
}
