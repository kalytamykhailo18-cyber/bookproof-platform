'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Terms of Service Page
 */
export default function TermsOfServicePage() {
  const router = useRouter();
  const [isBackLoading, setIsBackLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 21, 2026</p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using BookProof (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                BookProof is a platform that connects Authors with Readers for the purpose of generating authentic book reviews on Amazon. Our services include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Credit-based review campaign management for Authors</li>
                <li>Book distribution to qualified Readers</li>
                <li>Review tracking and verification</li>
                <li>Affiliate program for marketing partners</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To use our Platform, you must create an account and provide accurate information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Author Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Author Terms</h2>
              <p className="text-gray-700 mb-4">As an Author, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Only submit books that you own or have rights to distribute</li>
                <li>Provide accurate book information and Amazon links</li>
                <li>Purchase credits through our official payment system</li>
                <li>Not attempt to manipulate or incentivize specific review content</li>
                <li>Accept that reviews are honest opinions of Readers</li>
              </ul>
            </section>

            {/* Reader Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Reader Terms</h2>
              <p className="text-gray-700 mb-4">As a Reader, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Read assigned books completely before reviewing</li>
                <li>Submit honest, unbiased reviews based on your experience</li>
                <li>Post reviews on Amazon within the specified deadline</li>
                <li>Not accept payment from Authors outside the Platform</li>
                <li>Maintain a valid Amazon account in good standing</li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                <strong>Credits:</strong> Authors purchase credits to fund review campaigns. Credits are non-refundable except as specified in our refund policy.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Reader Payments:</strong> Readers are compensated for verified reviews according to the current payment rates displayed on the Platform.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Affiliate Commissions:</strong> Affiliates earn commissions based on qualified referrals as outlined in the Affiliate Program terms.
              </p>
            </section>

            {/* Prohibited Activities */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">Users may not:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Submit fake reviews or manipulate review content</li>
                <li>Create multiple accounts for fraudulent purposes</li>
                <li>Share account credentials with others</li>
                <li>Attempt to circumvent Platform security measures</li>
                <li>Violate Amazon&apos;s Terms of Service</li>
                <li>Engage in harassment or abusive behavior</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Unused credits may be forfeited</li>
                <li>Pending payouts may be withheld pending investigation</li>
                <li>Access to the Platform will be revoked</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                BookProof is provided &quot;as is&quot; without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Reviews posted or removed by Amazon</li>
                <li>Actions taken by Amazon regarding user accounts</li>
                <li>Loss of data or service interruptions</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> support@bookproof.app
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => {
                setIsBackLoading(true);
                router.back();
              }}
              disabled={isBackLoading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isBackLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
