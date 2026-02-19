import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Loader2, FileText, ExternalLink } from 'lucide-react';

const SECTIONS = [
  'Acceptance of Terms', 'Service Description', 'User Accounts', 'Author Terms',
  'Reader Terms', 'Payment Terms', 'Prohibited Activities', 'Termination',
  'Limitation of Liability', 'Changes to Terms', 'Contact Us',
];

export function TermsOfServicePage() {
  const navigate = useNavigate();
  const [isBackLoading, setIsBackLoading] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
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
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <FileText className="h-3 w-3" />
            Legal
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
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
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />
            <div className="p-8 space-y-10">

              {/* Helper component inline */}
              {([
                {
                  id: 1, title: 'Acceptance of Terms',
                  body: <p>By accessing or using BookProof (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>,
                },
                {
                  id: 2, title: 'Service Description',
                  body: (
                    <>
                      <p className="mb-3">BookProof is a platform that connects Authors with Readers for the purpose of generating authentic book reviews on Amazon. Our services include:</p>
                      <ul className="space-y-1.5">
                        {['Credit-based review campaign management for Authors', 'Book distribution to qualified Readers', 'Review tracking and verification', 'Affiliate program for marketing partners'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 3, title: 'User Accounts',
                  body: (
                    <>
                      <p className="mb-3">To use our Platform, you must create an account and provide accurate information. You are responsible for:</p>
                      <ul className="space-y-1.5">
                        {['Maintaining the confidentiality of your account credentials', 'All activities that occur under your account', 'Notifying us immediately of any unauthorized use'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 4, title: 'Author Terms',
                  body: (
                    <>
                      <p className="mb-3">As an Author, you agree to:</p>
                      <ul className="space-y-1.5">
                        {['Only submit books that you own or have rights to distribute', 'Provide accurate book information and Amazon links', 'Purchase credits through our official payment system', 'Not attempt to manipulate or incentivize specific review content', 'Accept that reviews are honest opinions of Readers'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 5, title: 'Reader Terms',
                  body: (
                    <>
                      <p className="mb-3">As a Reader, you agree to:</p>
                      <ul className="space-y-1.5">
                        {['Read assigned books completely before reviewing', 'Submit honest, unbiased reviews based on your experience', 'Post reviews on Amazon within the specified deadline', 'Not accept payment from Authors outside the Platform', 'Maintain a valid Amazon account in good standing'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 6, title: 'Payment Terms',
                  body: (
                    <div className="space-y-3">
                      <p><strong className="text-slate-700">Credits:</strong> Authors purchase credits to fund review campaigns. Credits are non-refundable except as specified in our refund policy.</p>
                      <p><strong className="text-slate-700">Reader Payments:</strong> Readers are compensated for verified reviews according to the current payment rates displayed on the Platform.</p>
                      <p><strong className="text-slate-700">Affiliate Commissions:</strong> Affiliates earn commissions based on qualified referrals as outlined in the Affiliate Program terms.</p>
                    </div>
                  ),
                },
                {
                  id: 7, title: 'Prohibited Activities',
                  body: (
                    <>
                      <p className="mb-3">Users may not:</p>
                      <ul className="space-y-1.5">
                        {['Submit fake reviews or manipulate review content', 'Create multiple accounts for fraudulent purposes', 'Share account credentials with others', 'Attempt to circumvent Platform security measures', "Violate Amazon's Terms of Service", 'Engage in harassment or abusive behavior'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-red-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 8, title: 'Termination',
                  body: (
                    <>
                      <p className="mb-3">We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination:</p>
                      <ul className="space-y-1.5">
                        {['Unused credits may be forfeited', 'Pending payouts may be withheld pending investigation', 'Access to the Platform will be revoked'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 9, title: 'Limitation of Liability',
                  body: (
                    <>
                      <p className="mb-3">BookProof is provided &quot;as is&quot; without warranties of any kind. We are not liable for:</p>
                      <ul className="space-y-1.5">
                        {['Reviews posted or removed by Amazon', 'Actions taken by Amazon regarding user accounts', 'Loss of data or service interruptions', 'Indirect, incidental, or consequential damages'].map(i => <li key={i} className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0" />{i}</li>)}
                      </ul>
                    </>
                  ),
                },
                {
                  id: 10, title: 'Changes to Terms',
                  body: <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>,
                },
                {
                  id: 11, title: 'Contact Us',
                  body: (
                    <div className="rounded-md bg-slate-50 border border-slate-200 p-4 space-y-1">
                      <p><strong className="text-slate-700">Email:</strong> <a href="mailto:support@bookproof.app" className="text-blue-600 hover:underline">support@bookproof.app</a></p>
                    </div>
                  ),
                },
              ] as { id: number; title: string; body: React.ReactNode }[]).map(({ id, title, body }) => (
                <section key={id} id={`section-${id}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 rounded-full bg-blue-500 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-slate-900">{id}. {title}</h2>
                  </div>
                  <div className="pl-4 text-slate-600 text-sm leading-relaxed">{body}</div>
                </section>
              ))}

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
