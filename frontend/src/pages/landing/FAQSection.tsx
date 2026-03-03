import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11'] as const;

const ITEM_ANIMATIONS = [
  'animate-fade-right-fast', 'animate-fade-left-fast',
  'animate-fade-right',      'animate-fade-left',
  'animate-fade-right-light-slow', 'animate-fade-left-light-slow',
  'animate-fade-right-slow', 'animate-fade-left-slow',
  'animate-zoom-in-light-slow', 'animate-zoom-in-slow',
  'animate-fade-up-slow',
];

export function FAQSection() {
  const { t } = useTranslation('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      <div className="absolute inset-0 landing-dot-grid-light opacity-50" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider mb-5 animate-fade-down-fast"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            {t('badge', 'FAQ')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-5 animate-fade-up-fast">
            {t('title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto animate-fade-up">
            {t('subtitle')}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQ_KEYS.map((key, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={key}
                className={`rounded-md overflow-hidden transition-all duration-200 ${ITEM_ANIMATIONS[i]}`}
                style={{
                  background: isOpen ? 'rgba(59,130,246,0.05)' : '#ffffff',
                  border: `1px solid ${isOpen ? 'rgba(59,130,246,0.3)' : 'rgba(203,213,225,0.8)'}`,
                  boxShadow: isOpen ? '0 2px 12px rgba(59,130,246,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  className="w-full flex items-center gap-4 text-left px-6 py-5 hover:bg-slate-50 transition-colors duration-200"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <HelpCircle
                    className="h-4 w-4 flex-shrink-0 transition-colors duration-200"
                    style={{ color: isOpen ? '#3b82f6' : '#94a3b8' }}
                  />
                  <span className={`flex-1 text-sm font-medium transition-colors duration-200 ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>
                    {t(`items.${key}.question`)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 animate-fade-down-fast">
                    <div className="pl-8 border-l-2 border-blue-400/30">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {t(`items.${key}.answer`)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-14 sm:mt-16 text-center landing-card-light rounded-md p-8 sm:p-10 animate-zoom-in-slow">
          <h3 className="text-lg font-semibold text-slate-900 mb-2.5">{t('stillHave.title')}</h3>
          <p className="text-sm text-slate-600 mb-7">
            {t('stillHave.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@bookproof.app"
              className="px-6 py-3 rounded-md text-sm font-medium text-white landing-btn-primary"
            >
              {t('stillHave.email')}
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-md text-sm font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
            >
              {t('stillHave.contact')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
