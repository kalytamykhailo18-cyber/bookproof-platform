import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, Loader2, FileText, ExternalLink } from 'lucide-react';

export function TermsOfServicePage() {
  const { t } = useTranslation('legalTerms');
  const navigate = useNavigate();
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isCookiesLoading, setIsCookiesLoading] = useState(false);

  const sections = t('sections', { returnObjects: true }) as string[];

  function BulletList({ items, red }: { items: string[]; red?: boolean }) {
    return (
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`w-1 h-1 rounded-full ${red ? 'bg-red-400' : 'bg-blue-400'} mt-2 flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  function SectionBlock({ id, title, children }: { id: number; title: string; children: React.ReactNode }) {
    return (
      <section id={`section-${id}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-6 rounded-full bg-blue-500 flex-shrink-0" />
          <h2 className="text-lg font-bold text-slate-900">{id}. {title}</h2>
        </div>
        <div className="pl-4 text-slate-600 text-sm leading-relaxed">{children}</div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ── */}
      <div
        className="relative overflow-hidden py-14 px-6"
        style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <span
              className="text-white font-bold text-lg tracking-tight cursor-pointer"
              onClick={() => navigate('/')}
            >
              BookProof
            </span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <FileText className="h-3 w-3" />
            {t('badge')}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('title')}</h1>
          <p className="text-slate-400 text-sm">{t('lastUpdated')}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="lg:flex gap-8">

          {/* Sticky TOC */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-md border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('toc')}</p>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <a
                    key={i}
                    href={`#section-${i + 1}`}
                    className="block text-xs text-gray-500 hover:text-blue-600 py-1 leading-snug transition-colors"
                  >
                    {i + 1}. {s}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />
            <div className="p-8 space-y-10">

              <SectionBlock id={1} title={t('s1.title')}>
                <p>{t('s1.body')}</p>
              </SectionBlock>

              <SectionBlock id={2} title={t('s2.title')}>
                <p className="mb-3">{t('s2.intro')}</p>
                <BulletList items={t('s2.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={3} title={t('s3.title')}>
                <p className="mb-3">{t('s3.intro')}</p>
                <BulletList items={t('s3.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={4} title={t('s4.title')}>
                <p className="mb-3">{t('s4.intro')}</p>
                <BulletList items={t('s4.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={5} title={t('s5.title')}>
                <p className="mb-3">{t('s5.intro')}</p>
                <BulletList items={t('s5.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={6} title={t('s6.title')}>
                <div className="space-y-3">
                  {(t('s6.items', { returnObjects: true }) as { label: string; text: string }[]).map(({ label, text }, i) => (
                    <p key={i}>
                      <strong className="text-slate-700">{label}:</strong> {text}
                    </p>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock id={7} title={t('s7.title')}>
                <p className="mb-3">{t('s7.intro')}</p>
                <BulletList items={t('s7.items', { returnObjects: true }) as string[]} red />
              </SectionBlock>

              <SectionBlock id={8} title={t('s8.title')}>
                <p className="mb-3">{t('s8.intro')}</p>
                <BulletList items={t('s8.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={9} title={t('s9.title')}>
                <p className="mb-3">{t('s9.intro')}</p>
                <BulletList items={t('s9.items', { returnObjects: true }) as string[]} />
              </SectionBlock>

              <SectionBlock id={10} title={t('s10.title')}>
                <p>{t('s10.body')}</p>
              </SectionBlock>

              <SectionBlock id={11} title={t('s11.title')}>
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4 space-y-1">
                  <p><strong className="text-slate-700">Email:</strong> <a href="mailto:support@bookproof.app" className="text-blue-600 hover:underline">support@bookproof.app</a></p>
                </div>
              </SectionBlock>

              {/* Footer */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                  onClick={() => { setIsBackLoading(true); navigate(-1); }}
                  disabled={isBackLoading}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-60"
                >
                  {isBackLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
                  {t('goBack')}
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { if (!isPrivacyLoading) { setIsPrivacyLoading(true); navigate('/privacy'); } }}
                    disabled={isPrivacyLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isPrivacyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    {t('footer.privacyPolicy')}
                  </button>
                  <button
                    onClick={() => { if (!isCookiesLoading) { setIsCookiesLoading(true); navigate('/cookies'); } }}
                    disabled={isCookiesLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isCookiesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    {t('footer.cookiePolicy')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
