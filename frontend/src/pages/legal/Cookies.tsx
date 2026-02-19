import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Loader2, Cookie, ExternalLink } from 'lucide-react';

const SECTIONS = [
  'What Are Cookies', 'Types of Cookies We Use', 'Cookie Duration',
  'Third-Party Cookies', 'Managing Your Cookie Preferences',
  'Do Not Track Signals', 'Updates to This Policy', 'Contact Us',
];

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

export function CookiePolicyPage() {
  const navigate = useNavigate();
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);

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
            Legal
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Cookie Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: January 21, 2026</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="lg:flex gap-8">

          {/* Sticky TOC */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-md border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s}
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

              <Section id={1} title="What Are Cookies">
                <div className="space-y-3">
                  <p>Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.</p>
                  <p>BookProof uses cookies and similar technologies to provide, protect, and improve our platform.</p>
                </div>
              </Section>

              <Section id={2} title="Types of Cookies We Use">
                <Sub title="2.1 Essential Cookies">
                  <p className="mb-2">These cookies are necessary for the website to function properly. They cannot be disabled.</p>
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Authentication Token:</strong> Keeps you logged in securely</span>,
                    <span key="b"><strong className="text-slate-700">Session ID:</strong> Maintains your session state</span>,
                    <span key="c"><strong className="text-slate-700">CSRF Token:</strong> Protects against cross-site request forgery attacks</span>,
                    <span key="d"><strong className="text-slate-700">Security Cookies:</strong> Help detect and prevent malicious activity</span>,
                  ]} />
                </Sub>
                <Sub title="2.2 Functional Cookies">
                  <p className="mb-2">These cookies enable enhanced functionality and personalization.</p>
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Language Preference:</strong> Remembers your selected language (en, pt, es)</span>,
                    <span key="b"><strong className="text-slate-700">Currency Preference:</strong> Remembers your preferred currency</span>,
                    <span key="c"><strong className="text-slate-700">Theme Preference:</strong> Stores your light/dark mode preference</span>,
                  ]} />
                </Sub>
                <Sub title="2.3 Affiliate Tracking Cookies">
                  <p className="mb-2">Used to track referrals for our affiliate program.</p>
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">bp_aff_ref:</strong> Stores affiliate referral code (30-day expiration)</span>,
                    <span key="b"><strong className="text-slate-700">Conversion Tracking:</strong> Attributes sign-ups to referring affiliates</span>,
                  ]} />
                </Sub>
                <Sub title="2.4 Analytics Cookies (Optional)">
                  <p className="mb-2">These cookies help us understand how visitors use our website. They are only set with your consent.</p>
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Google Analytics:</strong> Tracks page views, session duration, and user behavior</span>,
                    <span key="b"><strong className="text-slate-700">Performance Monitoring:</strong> Helps us identify and fix technical issues</span>,
                  ]} />
                </Sub>
              </Section>

              <Section id={3} title="Cookie Duration">
                <p className="mb-3">Cookies have different lifespans depending on their purpose:</p>
                <div className="rounded-md border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Cookie Type</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        ['Session Cookies', 'Deleted when you close your browser'],
                        ['Authentication Cookies', '7 days (or until you log out)'],
                        ['Preference Cookies', '1 year'],
                        ['Affiliate Cookies', '30 days'],
                        ['Analytics Cookies', 'Up to 2 years'],
                      ].map(([type, duration]) => (
                        <tr key={type} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-slate-700">{type}</td>
                          <td className="px-4 py-2.5 text-slate-500">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id={4} title="Third-Party Cookies">
                <p className="mb-3">Some cookies are set by third-party services we use:</p>
                <Bullets items={[
                  <span key="a"><strong className="text-slate-700">Stripe:</strong> Payment processing and fraud prevention</span>,
                  <span key="b"><strong className="text-slate-700">Google reCAPTCHA:</strong> Bot protection on forms</span>,
                  <span key="c"><strong className="text-slate-700">Google Analytics:</strong> Website analytics (if enabled)</span>,
                ]} />
              </Section>

              <Section id={5} title="Managing Your Cookie Preferences">
                <p className="mb-4">You can control cookies in several ways:</p>
                <Sub title="5.1 Browser Settings">
                  <p>Most browsers allow you to block or delete cookies through their settings. Note that blocking essential cookies may prevent you from using certain features of our platform.</p>
                </Sub>
                <Sub title="5.2 Cookie Consent Banner">
                  <p>When you first visit our website, you can choose which optional cookies to accept through our consent banner.</p>
                </Sub>
                <Sub title="5.3 Account Settings">
                  <p>Logged-in users can manage their cookie preferences in their account settings.</p>
                </Sub>
              </Section>

              <Section id={6} title="Do Not Track Signals">
                <p>We respect Do Not Track (DNT) signals from your browser. When DNT is enabled, we will not set optional analytics cookies.</p>
              </Section>

              <Section id={7} title="Updates to This Policy">
                <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
              </Section>

              <Section id={8} title="Contact Us">
                <p className="mb-3">If you have questions about our use of cookies, please contact us:</p>
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
                  Go Back
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { if (!isPrivacyLoading) { setIsPrivacyLoading(true); navigate('/privacy'); } }}
                    disabled={isPrivacyLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isPrivacyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => { if (!isTermsLoading) { setIsTermsLoading(true); navigate('/terms'); } }}
                    disabled={isTermsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isTermsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    Terms of Service
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
