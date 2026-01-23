'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Privacy Policy Page
 *
 * Per requirements.md Section 15.3:
 * - GDPR compliance for EU users
 * - Privacy policy required
 *
 * Comprehensive privacy policy covering:
 * - Data collection and processing
 * - User rights (access, deletion, portability)
 * - Cookie usage
 * - Data security measures
 * - GDPR compliance
 */
export default function PrivacyPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [isCookiesLoading, setIsCookiesLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card shadow-xl rounded-2xl p-8 border border-border/50">
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              Legal
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: January 21, 2026</p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                BookProof (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-gray-700 mb-4">
                This policy applies to all users of the BookProof platform, including Authors, Readers, Affiliates, and Administrators.
              </p>
              <p className="text-gray-700">
                <strong>GDPR Compliance:</strong> For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have specific rights regarding your personal data as outlined in Section 8.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Email, name, password, company name, phone number, country, preferred language</li>
                <li><strong>Profile Information:</strong> Bio, profile photo, content preferences</li>
                <li><strong>Payment Information:</strong> Credit card details (processed securely by Stripe), PayPal email for payouts</li>
                <li><strong>Campaign Data:</strong> Book titles, descriptions, cover images, ebook/audiobook files, synopsis documents</li>
                <li><strong>Review Data:</strong> Amazon profile links, review submissions, ratings</li>
                <li><strong>Communication:</strong> Messages, support requests, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, analytics data</li>
                <li><strong>Security Logs:</strong> Login attempts, account actions, API requests</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Third-Party Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Payment Processors:</strong> Transaction data from Stripe</li>
                <li><strong>Amazon:</strong> Publicly available review data for verification</li>
                <li><strong>Analytics:</strong> Usage statistics from Google Analytics (if enabled)</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Service Delivery</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Create and manage your account</li>
                <li>Process credit purchases and payments</li>
                <li>Match authors with readers for campaigns</li>
                <li>Deliver ebooks and audiobooks to readers</li>
                <li>Process review submissions and verification</li>
                <li>Handle payouts to readers and affiliates</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Communication</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Send transactional emails (account verification, password resets, receipts)</li>
                <li>Notify you of campaign updates, review deadlines, and important account changes</li>
                <li>Respond to support requests and inquiries</li>
                <li>Send marketing communications (only with your consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Platform Improvement</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Analyze usage patterns to improve user experience</li>
                <li>Develop new features and services</li>
                <li>Monitor platform performance and troubleshoot issues</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.4 Security and Compliance</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Prevent fraud, spam, and abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Comply with legal obligations</li>
                <li>Protect the rights and safety of our users</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your data in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Service Providers</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Cloudflare R2:</strong> File storage and delivery</li>
                <li><strong>Resend:</strong> Email delivery</li>
                <li><strong>Upstash Redis:</strong> Session management and caching</li>
                <li><strong>Neon PostgreSQL:</strong> Database hosting</li>
                <li><strong>Sentry:</strong> Error monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Business Partners</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Authors and Readers:</strong> Limited information shared to facilitate campaigns (book details, content preferences)</li>
                <li><strong>Affiliates:</strong> Commission data and conversion statistics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose your information if required by law or in response to valid legal requests (subpoenas, court orders).</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Business Transfers</h3>
              <p className="text-gray-700">If BookProof is acquired or merged with another company, your information may be transferred to the new owner.</p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures to protect your data:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Technical Security</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Encryption in Transit:</strong> All data transmitted via HTTPS/TLS 1.2+</li>
                <li><strong>Password Security:</strong> Passwords hashed using bcrypt with salt</li>
                <li><strong>Session Management:</strong> Secure JWT tokens with 24-hour expiration</li>
                <li><strong>CAPTCHA Protection:</strong> Google reCAPTCHA v3 on sensitive forms</li>
                <li><strong>Account Lockout:</strong> Automatic lockout after failed login attempts</li>
                <li><strong>Security Headers:</strong> HSTS, CSP, X-Frame-Options, and other protective headers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Access Controls</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Role-based access control (RBAC)</li>
                <li>Multi-factor authentication for sensitive actions</li>
                <li>Regular security audits and penetration testing</li>
                <li>Employee access limited to necessary data only</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Data Breach Response</h3>
              <p className="text-gray-700">In the event of a data breach, we will notify affected users within 72 hours as required by GDPR and applicable laws.</p>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to enhance your experience:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Essential Cookies</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Authentication:</strong> Keep you logged in (JWT tokens)</li>
                <li><strong>Session Management:</strong> Maintain your session state</li>
                <li><strong>Security:</strong> Prevent CSRF attacks and fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Functional Cookies</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Preferences:</strong> Remember your language and currency settings</li>
                <li><strong>Affiliate Tracking:</strong> Track referrals for commission attribution (30-day cookie)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Analytics Cookies (Optional)</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> Track usage statistics (requires consent)</li>
                <li><strong>Performance Monitoring:</strong> Measure page load times and errors</li>
              </ul>

              <p className="text-gray-700">You can manage cookie preferences in your browser settings or through our cookie consent banner.</p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">We retain your data for as long as necessary to provide our services:</p>

              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Inactive Accounts:</strong> Deleted after 3 years of inactivity (or upon request)</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for tax and accounting purposes</li>
                <li><strong>Security Logs:</strong> Retained for 90 days</li>
                <li><strong>Marketing Data:</strong> Deleted immediately upon consent withdrawal</li>
              </ul>

              <p className="text-gray-700">When you request account deletion, we provide a 30-day grace period during which you can cancel the request.</p>
            </section>

            {/* Your Rights (GDPR) */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights (GDPR)</h2>
              <p className="text-gray-700 mb-4">If you are in the European Union, you have the following rights under GDPR:</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Right to Access</h3>
              <p className="text-gray-700 mb-4">
                You can request a copy of all personal data we hold about you. Use the <strong>Export Data</strong> feature in your account settings to download your data package.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Right to Rectification</h3>
              <p className="text-gray-700 mb-4">
                You can update inaccurate or incomplete data through your account settings or by contacting support.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Right to Erasure (&quot;Right to be Forgotten&quot;)</h3>
              <p className="text-gray-700 mb-4">
                You can request deletion of your account and all associated data. Use the <strong>Delete Account</strong> feature in your account settings. We provide a 30-day grace period before permanent deletion.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.4 Right to Data Portability</h3>
              <p className="text-gray-700 mb-4">
                You can export your data in a machine-readable format (JSON) for transfer to another service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.5 Right to Object</h3>
              <p className="text-gray-700 mb-4">
                You can object to processing of your data for marketing purposes or based on legitimate interests.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.6 Right to Restrict Processing</h3>
              <p className="text-gray-700 mb-4">
                You can request that we limit how we use your data in certain circumstances.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.7 Right to Withdraw Consent</h3>
              <p className="text-gray-700 mb-4">
                You can withdraw consent for marketing communications or analytics tracking at any time through your account settings.
              </p>

              <p className="text-gray-700 font-semibold">
                To exercise any of these rights, please visit your account settings or contact us at privacy@bookproof.com. We will respond within 30 days.
              </p>
            </section>

            {/* International Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                BookProof operates globally, and your data may be transferred to and processed in countries outside your region. We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequate safeguards as required by GDPR</li>
                <li>Compliance with Privacy Shield principles where applicable</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                BookProof is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it immediately.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Posting the new policy on this page with an updated &quot;Last Updated&quot; date</li>
                <li>Sending an email to your registered email address</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="text-gray-700">
                Your continued use of BookProof after the changes take effect constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@bookproof.com</p>
                <p className="text-gray-700 mb-2"><strong>Support:</strong> support@bookproof.com</p>
                <p className="text-gray-700 mb-4"><strong>Data Protection Officer:</strong> dpo@bookproof.com</p>

                <p className="text-gray-700 mb-2"><strong>Mailing Address:</strong></p>
                <p className="text-gray-700">
                  BookProof Data Protection Team<br />
                  [Company Address]<br />
                  [City, State, ZIP]<br />
                  [Country]
                </p>
              </div>
            </section>

            {/* EU Supervisory Authority */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. EU Supervisory Authority</h2>
              <p className="text-gray-700">
                If you are in the European Union and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.
              </p>
            </section>

            {/* Related Links */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Related Documents</h2>
              <div className="flex flex-col gap-3">
                <span
                  onClick={() => {
                    if (isTermsLoading) return;
                    setIsTermsLoading(true);
                    router.push(`/${locale}/terms`);
                  }}
                  className={`text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer flex items-center gap-2 ${isTermsLoading ? 'opacity-70' : ''}`}
                >
                  {isTermsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Terms of Service
                </span>
                <span
                  onClick={() => {
                    if (isCookiesLoading) return;
                    setIsCookiesLoading(true);
                    router.push(`/${locale}/cookies`);
                  }}
                  className={`text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer flex items-center gap-2 ${isCookiesLoading ? 'opacity-70' : ''}`}
                >
                  {isCookiesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Cookie Policy
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
