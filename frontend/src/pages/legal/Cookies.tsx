import { useState } from 'react';
import { useNavigate,  useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Cookie Policy Page
 */
export function CookiePolicyPage() {
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 21, 2026</p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience.
              </p>
              <p className="text-gray-700">
                BookProof uses cookies and similar technologies to provide, protect, and improve our platform.
              </p>
            </section>

            {/* Types of Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Essential Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are necessary for the website to function properly. They cannot be disabled.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Authentication Token:</strong> Keeps you logged in securely</li>
                <li><strong>Session ID:</strong> Maintains your session state</li>
                <li><strong>CSRF Token:</strong> Protects against cross-site request forgery attacks</li>
                <li><strong>Security Cookies:</strong> Help detect and prevent malicious activity</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Functional Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Language Preference:</strong> Remembers your selected language (en, pt, es)</li>
                <li><strong>Currency Preference:</strong> Remembers your preferred currency</li>
                <li><strong>Theme Preference:</strong> Stores your light/dark mode preference</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Affiliate Tracking Cookies</h3>
              <p className="text-gray-700 mb-4">
                Used to track referrals for our affiliate program.
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>bp_aff_ref:</strong> Stores affiliate referral code (30-day expiration)</li>
                <li><strong>Conversion Tracking:</strong> Attributes sign-ups to referring affiliates</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Analytics Cookies (Optional)</h3>
              <p className="text-gray-700 mb-4">
                These cookies help us understand how visitors use our website. They are only set with your consent.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> Tracks page views, session duration, and user behavior</li>
                <li><strong>Performance Monitoring:</strong> Helps us identify and fix technical issues</li>
              </ul>
            </section>

            {/* Cookie Duration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookie Duration</h2>
              <p className="text-gray-700 mb-4">
                Cookies have different lifespans depending on their purpose:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Authentication Cookies:</strong> 7 days (or until you log out)</li>
                <li><strong>Preference Cookies:</strong> 1 year</li>
                <li><strong>Affiliate Cookies:</strong> 30 days</li>
                <li><strong>Analytics Cookies:</strong> Up to 2 years</li>
              </ul>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Some cookies are set by third-party services we use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
                <li><strong>Google reCAPTCHA:</strong> Bot protection on forms</li>
                <li><strong>Google Analytics:</strong> Website analytics (if enabled)</li>
              </ul>
            </section>

            {/* Managing Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 mb-4">
                You can control cookies in several ways:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Browser Settings</h3>
              <p className="text-gray-700 mb-4">
                Most browsers allow you to block or delete cookies through their settings. Note that blocking essential cookies may prevent you from using certain features of our platform.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Cookie Consent Banner</h3>
              <p className="text-gray-700 mb-4">
                When you first visit our website, you can choose which optional cookies to accept through our consent banner.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Account Settings</h3>
              <p className="text-gray-700">
                Logged-in users can manage their cookie preferences in their account settings.
              </p>
            </section>

            {/* Do Not Track */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Do Not Track Signals</h2>
              <p className="text-gray-700">
                We respect Do Not Track (DNT) signals from your browser. When DNT is enabled, we will not set optional analytics cookies.
              </p>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> privacy@bookproof.app
              </p>
            </section>

            {/* Related Links */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Documents</h2>
              <div className="flex flex-col gap-3">
                <span
                  onClick={() => {
                    if (isPrivacyLoading) return;
                    setIsPrivacyLoading(true);
                    navigate(`/${locale}/privacy`);
                  }}
                  className={`text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer flex items-center gap-2 ${isPrivacyLoading ? 'opacity-70' : ''}`}
                >
                  {isPrivacyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Privacy Policy
                </span>
                <span
                  onClick={() => {
                    if (isTermsLoading) return;
                    setIsTermsLoading(true);
                    navigate(`/${locale}/terms`);
                  }}
                  className={`text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer flex items-center gap-2 ${isTermsLoading ? 'opacity-70' : ''}`}
                >
                  {isTermsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Terms of Service
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
