import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Loader2, Shield, ExternalLink } from 'lucide-react';

const SECTIONS = [
  'Introduction', 'Information We Collect', 'How We Use Your Information',
  'How We Share Your Information', 'Data Security', 'Cookies and Tracking',
  'Data Retention', 'Your Rights (GDPR)', 'International Data Transfers',
  "Children's Privacy", 'Changes to This Policy', 'Contact Us', 'EU Supervisory Authority',
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

export function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [isCookiesLoading, setIsCookiesLoading] = useState(false);

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
            style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            <Shield className="h-3 w-3" />
            Legal
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
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
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-blue-400 to-teal-400" />
            <div className="p-8 space-y-10">

              <Section id={1} title="Introduction">
                <div className="space-y-3">
                  <p>BookProof (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
                  <p>This policy applies to all users of the BookProof platform, including Authors, Readers, Affiliates, and Administrators.</p>
                  <div className="rounded-md bg-purple-50 border border-purple-100 p-3">
                    <p><strong className="text-purple-700">GDPR Compliance:</strong> <span className="text-purple-600">For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have specific rights regarding your personal data as outlined in Section 8.</span></p>
                  </div>
                </div>
              </Section>

              <Section id={2} title="Information We Collect">
                <Sub title="2.1 Information You Provide">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Account Information:</strong> Email, name, password, company name, phone number, country, preferred language</span>,
                    <span key="b"><strong className="text-slate-700">Profile Information:</strong> Bio, profile photo, content preferences</span>,
                    <span key="c"><strong className="text-slate-700">Payment Information:</strong> Credit card details (processed securely by Stripe), PayPal email for payouts</span>,
                    <span key="d"><strong className="text-slate-700">Campaign Data:</strong> Book titles, descriptions, cover images, ebook/audiobook files, synopsis documents</span>,
                    <span key="e"><strong className="text-slate-700">Review Data:</strong> Amazon profile links, review submissions, ratings</span>,
                    <span key="f"><strong className="text-slate-700">Communication:</strong> Messages, support requests, feedback</span>,
                  ]} />
                </Sub>
                <Sub title="2.2 Automatically Collected Information">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Usage Data:</strong> Pages visited, features used, time spent on platform</span>,
                    <span key="b"><strong className="text-slate-700">Device Information:</strong> IP address, browser type, operating system, device identifiers</span>,
                    <span key="c"><strong className="text-slate-700">Cookies and Tracking:</strong> Session cookies, authentication tokens, analytics data</span>,
                    <span key="d"><strong className="text-slate-700">Security Logs:</strong> Login attempts, account actions, API requests</span>,
                  ]} />
                </Sub>
                <Sub title="2.3 Third-Party Information">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Payment Processors:</strong> Transaction data from Stripe</span>,
                    <span key="b"><strong className="text-slate-700">Amazon:</strong> Publicly available review data for verification</span>,
                    <span key="c"><strong className="text-slate-700">Analytics:</strong> Usage statistics from Google Analytics (if enabled)</span>,
                  ]} />
                </Sub>
              </Section>

              <Section id={3} title="How We Use Your Information">
                <Sub title="3.1 Service Delivery">
                  <Bullets items={['Create and manage your account', 'Process credit purchases and payments', 'Match authors with readers for campaigns', 'Deliver ebooks and audiobooks to readers', 'Process review submissions and verification', 'Handle payouts to readers and affiliates']} />
                </Sub>
                <Sub title="3.2 Communication">
                  <Bullets items={['Send transactional emails (account verification, password resets, receipts)', 'Notify you of campaign updates, review deadlines, and important account changes', 'Respond to support requests and inquiries', 'Send marketing communications (only with your consent)']} />
                </Sub>
                <Sub title="3.3 Platform Improvement">
                  <Bullets items={['Analyze usage patterns to improve user experience', 'Develop new features and services', 'Monitor platform performance and troubleshoot issues', 'Conduct research and analytics']} />
                </Sub>
                <Sub title="3.4 Security and Compliance">
                  <Bullets items={['Prevent fraud, spam, and abuse', 'Enforce our Terms of Service', 'Comply with legal obligations', 'Protect the rights and safety of our users']} />
                </Sub>
              </Section>

              <Section id={4} title="How We Share Your Information">
                <p className="mb-4">We do not sell your personal information. We may share your data in the following circumstances:</p>
                <Sub title="4.1 Service Providers">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Stripe:</strong> Payment processing</span>,
                    <span key="b"><strong className="text-slate-700">Cloudflare R2:</strong> File storage and delivery</span>,
                    <span key="c"><strong className="text-slate-700">Resend:</strong> Email delivery</span>,
                    <span key="d"><strong className="text-slate-700">Upstash Redis:</strong> Session management and caching</span>,
                    <span key="e"><strong className="text-slate-700">Neon PostgreSQL:</strong> Database hosting</span>,
                    <span key="f"><strong className="text-slate-700">Sentry:</strong> Error monitoring</span>,
                  ]} />
                </Sub>
                <Sub title="4.2 Business Partners">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Authors and Readers:</strong> Limited information shared to facilitate campaigns (book details, content preferences)</span>,
                    <span key="b"><strong className="text-slate-700">Affiliates:</strong> Commission data and conversion statistics</span>,
                  ]} />
                </Sub>
                <Sub title="4.3 Legal Requirements">
                  <p>We may disclose your information if required by law or in response to valid legal requests (subpoenas, court orders).</p>
                </Sub>
                <Sub title="4.4 Business Transfers">
                  <p>If BookProof is acquired or merged with another company, your information may be transferred to the new owner.</p>
                </Sub>
              </Section>

              <Section id={5} title="Data Security">
                <p className="mb-4">We implement industry-standard security measures to protect your data:</p>
                <Sub title="5.1 Technical Security">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Encryption in Transit:</strong> All data transmitted via HTTPS/TLS 1.2+</span>,
                    <span key="b"><strong className="text-slate-700">Password Security:</strong> Passwords hashed using bcrypt with salt</span>,
                    <span key="c"><strong className="text-slate-700">Session Management:</strong> Secure JWT tokens with 24-hour expiration</span>,
                    <span key="d"><strong className="text-slate-700">CAPTCHA Protection:</strong> Google reCAPTCHA v3 on sensitive forms</span>,
                    <span key="e"><strong className="text-slate-700">Account Lockout:</strong> Automatic lockout after failed login attempts</span>,
                    <span key="f"><strong className="text-slate-700">Security Headers:</strong> HSTS, CSP, X-Frame-Options, and other protective headers</span>,
                  ]} />
                </Sub>
                <Sub title="5.2 Access Controls">
                  <Bullets items={['Role-based access control (RBAC)', 'Multi-factor authentication for sensitive actions', 'Regular security audits and penetration testing', 'Employee access limited to necessary data only']} />
                </Sub>
                <Sub title="5.3 Data Breach Response">
                  <p>In the event of a data breach, we will notify affected users within 72 hours as required by GDPR and applicable laws.</p>
                </Sub>
              </Section>

              <Section id={6} title="Cookies and Tracking Technologies">
                <p className="mb-4">We use cookies and similar technologies to enhance your experience:</p>
                <Sub title="6.1 Essential Cookies">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Authentication:</strong> Keep you logged in (JWT tokens)</span>,
                    <span key="b"><strong className="text-slate-700">Session Management:</strong> Maintain your session state</span>,
                    <span key="c"><strong className="text-slate-700">Security:</strong> Prevent CSRF attacks and fraud</span>,
                  ]} />
                </Sub>
                <Sub title="6.2 Functional Cookies">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Preferences:</strong> Remember your language and currency settings</span>,
                    <span key="b"><strong className="text-slate-700">Affiliate Tracking:</strong> Track referrals for commission attribution (30-day cookie)</span>,
                  ]} />
                </Sub>
                <Sub title="6.3 Analytics Cookies (Optional)">
                  <Bullets items={[
                    <span key="a"><strong className="text-slate-700">Google Analytics:</strong> Track usage statistics (requires consent)</span>,
                    <span key="b"><strong className="text-slate-700">Performance Monitoring:</strong> Measure page load times and errors</span>,
                  ]} />
                  <p>You can manage cookie preferences in your browser settings or through our cookie consent banner.</p>
                </Sub>
              </Section>

              <Section id={7} title="Data Retention">
                <p className="mb-3">We retain your data for as long as necessary to provide our services:</p>
                <Bullets items={[
                  <span key="a"><strong className="text-slate-700">Active Accounts:</strong> Data retained while account is active</span>,
                  <span key="b"><strong className="text-slate-700">Inactive Accounts:</strong> Deleted after 3 years of inactivity (or upon request)</span>,
                  <span key="c"><strong className="text-slate-700">Transaction Records:</strong> Retained for 7 years for tax and accounting purposes</span>,
                  <span key="d"><strong className="text-slate-700">Security Logs:</strong> Retained for 90 days</span>,
                  <span key="e"><strong className="text-slate-700">Marketing Data:</strong> Deleted immediately upon consent withdrawal</span>,
                ]} />
                <p>When you request account deletion, we provide a 30-day grace period during which you can cancel the request.</p>
              </Section>

              <Section id={8} title="Your Rights (GDPR)">
                <p className="mb-4">If you are in the European Union, you have the following rights under GDPR:</p>
                <div className="space-y-3">
                  {[
                    { title: '8.1 Right to Access', body: 'You can request a copy of all personal data we hold about you. Use the Export Data feature in your account settings to download your data package.' },
                    { title: '8.2 Right to Rectification', body: 'You can update inaccurate or incomplete data through your account settings or by contacting support.' },
                    { title: '8.3 Right to Erasure ("Right to be Forgotten")', body: 'You can request deletion of your account and all associated data. Use the Delete Account feature in your account settings. We provide a 30-day grace period before permanent deletion.' },
                    { title: '8.4 Right to Data Portability', body: 'You can export your data in a machine-readable format (JSON) for transfer to another service.' },
                    { title: '8.5 Right to Object', body: 'You can object to processing of your data for marketing purposes or based on legitimate interests.' },
                    { title: '8.6 Right to Restrict Processing', body: 'You can request that we limit how we use your data in certain circumstances.' },
                    { title: '8.7 Right to Withdraw Consent', body: 'You can withdraw consent for marketing communications or analytics tracking at any time through your account settings.' },
                  ].map(({ title, body }) => (
                    <div key={title} className="rounded-md bg-slate-50 border border-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-700 mb-1">{title}</p>
                      <p className="text-xs text-slate-500">{body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 font-medium text-slate-700">
                  To exercise any of these rights, please visit your account settings or contact us at <a href="mailto:privacy@bookproof.app" className="text-blue-600 hover:underline">privacy@bookproof.app</a>. We will respond within 30 days.
                </p>
              </Section>

              <Section id={9} title="International Data Transfers">
                <p className="mb-3">BookProof operates globally, and your data may be transferred to and processed in countries outside your region. We ensure adequate protection through:</p>
                <Bullets items={['Standard Contractual Clauses (SCCs) approved by the European Commission', 'Adequate safeguards as required by GDPR', 'Compliance with Privacy Shield principles where applicable']} />
              </Section>

              <Section id={10} title="Children's Privacy">
                <p>BookProof is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it immediately.</p>
              </Section>

              <Section id={11} title="Changes to This Privacy Policy">
                <p className="mb-3">We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
                <Bullets items={['Posting the new policy on this page with an updated "Last Updated" date', 'Sending an email to your registered email address', 'Displaying a prominent notice on our platform']} />
                <p>Your continued use of BookProof after the changes take effect constitutes acceptance of the revised policy.</p>
              </Section>

              <Section id={12} title="Contact Us">
                <p className="mb-3">If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
                <div className="rounded-md bg-slate-50 border border-slate-200 p-4 space-y-1.5">
                  <p><strong className="text-slate-700">Email:</strong> <a href="mailto:privacy@bookproof.app" className="text-blue-600 hover:underline">privacy@bookproof.app</a></p>
                  <p><strong className="text-slate-700">Support:</strong> <a href="mailto:support@bookproof.app" className="text-blue-600 hover:underline">support@bookproof.app</a></p>
                  <p><strong className="text-slate-700">Data Protection Officer:</strong> <a href="mailto:dpo@bookproof.app" className="text-blue-600 hover:underline">dpo@bookproof.app</a></p>
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <p className="text-slate-600">BookProof Data Protection Team<br />[Company Address]<br />[City, State, ZIP]<br />[Country]</p>
                  </div>
                </div>
              </Section>

              <Section id={13} title="EU Supervisory Authority">
                <p>If you are in the European Union and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.</p>
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
                    onClick={() => { if (!isTermsLoading) { setIsTermsLoading(true); navigate('/terms'); } }}
                    disabled={isTermsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isTermsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    Terms of Service
                  </button>
                  <button
                    onClick={() => { if (!isCookiesLoading) { setIsCookiesLoading(true); navigate('/cookies'); } }}
                    disabled={isCookiesLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors disabled:opacity-60"
                  >
                    {isCookiesLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                    Cookie Policy
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
