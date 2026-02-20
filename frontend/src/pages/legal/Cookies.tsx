import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, ArrowLeft, Loader2, Cookie, ExternalLink } from 'lucide-react';

function Section({ id, title, children }: { id: number; title: string; children: React.ReactNode }) {
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

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 mb-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LabeledBullets({ items }: { items: { label: string; desc: string }[] }) {
  return (
    <Bullets
      items={items.map(({ label, desc }, i) => (
        <span key={i}><strong className="text-slate-700">{label}:</strong> {desc}</span>
      ))}
    />
  );
}

export function CookiePolicyPage() {
  const { t } = useTranslation('legalCookies');
  const navigate = useNavigate();
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);

  const sections = t('sections', { returnObjects: true }) as string[];
  const tableHeader = t('s3.tableHeader', { returnObjects: true }) as { type: string; duration: string };
  const tableRows = t('s3.rows', { returnObjects: true }) as { type: string; duration: string }[];

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
            style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <Cookie className="h-3 w-3" />
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
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-400" />
            <div className="p-8 space-y-10">

              <Section id={1} title={t('s1.title')}>
                <div className="space-y-3">
                  <p>{t('s1.p1')}</p>
                  <p>{t('s1.p2')}</p>
                </div>
              </Section>

              <Section id={2} title={t('s2.title')}>
                <Sub title={t('s2.sub1.title')}>
                  <p className="mb-2">{t('s2.sub1.intro')}</p>
                  <LabeledBullets items={t('s2.sub1.items', { returnObjects: true }) as { label: string; desc: string }[]} />
                </Sub>
                <Sub title={t('s2.sub2.title')}>
                  <p className="mb-2">{t('s2.sub2.intro')}</p>
                  <LabeledBullets items={t('s2.sub2.items', { returnObjects: true }) as { label: string; desc: string }[]} />
                </Sub>
                <Sub title={t('s2.sub3.title')}>
                  <p className="mb-2">{t('s2.sub3.intro')}</p>
                  <LabeledBullets items={t('s2.sub3.items', { returnObjects: true }) as { label: string; desc: string }[]} />
                </Sub>
                <Sub title={t('s2.sub4.title')}>
                  <p className="mb-2">{t('s2.sub4.intro')}</p>
                  <LabeledBullets items={t('s2.sub4.items', { returnObjects: true }) as { label: string; desc: string }[]} />
                </Sub>
              </Section>

              <Section id={3} title={t('s3.title')}>
                <p className="mb-3">{t('s3.intro')}</p>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700">{tableHeader.type}</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700">{tableHeader.duration}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableRows.map(({ type, duration }) => (
                        <tr key={type} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{type}</td>
                          <td className="px-4 py-2.5 text-slate-500">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id={4} title={t('s4.title')}>
                <p className="mb-3">{t('s4.intro')}</p>
                <LabeledBullets items={t('s4.items', { returnObjects: true }) as { label: string; desc: string }[]} />
              </Section>

              <Section id={5} title={t('s5.title')}>
                <p className="mb-4">{t('s5.intro')}</p>
                <Sub title={t('s5.sub1.title')}>
                  <p>{t('s5.sub1.body')}</p>
                </Sub>
                <Sub title={t('s5.sub2.title')}>
                  <p>{t('s5.sub2.body')}</p>
                </Sub>
                <Sub title={t('s5.sub3.title')}>
                  <p>{t('s5.sub3.body')}</p>
                </Sub>
              </Section>

              <Section id={6} title={t('s6.title')}>
                <p>{t('s6.body')}</p>
              </Section>

              <Section id={7} title={t('s7.title')}>
                <p>{t('s7.body')}</p>
              </Section>

              <Section id={8} title={t('s8.title')}>
                <p className="mb-3">{t('s8.intro')}</p>
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4">
                  <p><strong className="text-slate-700">Email:</strong> <a href="mailto:privacy@bookproof.app" className="text-blue-600 hover:underline">privacy@bookproof.app</a></p>
                </div>
              </Section>

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
                    onClick={() => { if (!isTermsLoading) { setIsTermsLoading(true); navigate('/terms'); } }}
                    disabled={isTermsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isTermsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    {t('footer.termsOfService')}
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
