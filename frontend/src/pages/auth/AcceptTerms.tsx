import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { tokenManager } from '@/lib/api/client';
import { useLoading } from '@/components/providers/LoadingProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BookOpen, FileText, Shield, Lock, CheckCircle2, Loader2, ShieldCheck, Star, LogOut } from 'lucide-react';

export function AcceptTermsPage() {
  const { t } = useTranslation('auth.acceptTerms');
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useAuthStore();
  const { startLoading, stopLoading } = useLoading();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptTerms = async () => {
    if (!termsAccepted) {
      toast.error(t('checkboxRequired') || 'You must accept the terms to continue');
      return;
    }
    try {
      setIsAccepting(true);
      startLoading('Accepting terms...');
      await authApi.acceptTerms();
      if (user) setUser({ ...user, termsAccepted: true });
      toast.success(t('success') || 'Terms accepted successfully!');
      navigate('/author');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || 'Failed to accept terms');
    } finally {
      setIsAccepting(false);
      stopLoading();
    }
  };

  const handleDecline = () => {
    tokenManager.clearToken();
    clearUser();
    navigate('/login');
  };

  if (user?.termsAccepted) {
    navigate('/author');
    return null;
  }

  const leftPoints = [
    { icon: FileText,    color: '#3b82f6', title: 'Transparent Rules',    desc: 'Clear and fair platform terms that protect everyone' },
    { icon: ShieldCheck, color: '#10b981', title: 'Amazon Compliant',     desc: 'Our review process follows Amazons policies' },
    { icon: Lock,        color: '#a78bfa', title: 'Data Privacy',         desc: 'Your information is encrypted and never sold' },
    { icon: Star,        color: '#f59e0b', title: 'Account Protection',   desc: 'We enforce terms to keep the platform trustworthy' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden sticky top-0 h-screen"
        style={{ background: 'linear-gradient(160deg, #080d1a 0%, #0d1b2e 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom right, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">BookProof</span>
          </div>
          <p className="text-slate-500 text-xs">The Amazon Review Platform for Authors</p>
        </div>

        {/* Main content */}
        <div className="relative space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Before you begin,<br />
              <span className="text-purple-400">review the rules</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              These terms keep our platform fair, safe, and Amazon-compliant for every author and reader.
            </p>
          </div>

          <div className="space-y-4">
            {leftPoints.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center mt-0.5"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-8 pt-2 border-t border-slate-800">
            {[
              { value: '8', label: 'Key Terms' },
              { value: '100%', label: 'Policy Compliant' },
              { value: 'GDPR', label: 'Data Protected' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Lock className="h-3 w-3" />
            Your acceptance is recorded securely on our servers.
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-7/12 xl:w-3/5 flex flex-col items-center justify-start px-6 py-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl animate-fade-up">

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-400 to-teal-400" />

            <div className="px-8 py-8">
              {/* Header */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('title') || 'Terms of Service'}
                </h1>
                <p className="text-gray-500 text-sm mt-1 text-center">
                  {t('subtitle') || 'Please review and accept our terms to continue'}
                </p>
              </div>

              {/* Terms scroll area */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    {t('termsTitle') || 'BookProof Terms of Service'}
                  </h3>
                </div>
                <div className="h-[220px] overflow-y-auto rounded-md border border-gray-200 bg-white p-4">
                  <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                    <p>
                      <strong className="text-gray-700">1. Acceptance of Terms</strong><br />
                      By using BookProof, you agree to these terms of service. If you do not agree, please do not use our platform.
                    </p>
                    <p>
                      <strong className="text-gray-700">2. Service Description</strong><br />
                      BookProof connects authors with readers to facilitate authentic book reviews on Amazon. Authors purchase credits to initiate review campaigns for their books.
                    </p>
                    <p>
                      <strong className="text-gray-700">3. Author Responsibilities</strong><br />
                      Authors must provide accurate book information, high-quality materials, and comply with all Amazon policies regarding reviews.
                    </p>
                    <p>
                      <strong className="text-gray-700">4. Review Authenticity</strong><br />
                      All reviews facilitated through BookProof must be genuine and reflect the reader&apos;s honest opinion. Fake reviews are strictly prohibited.
                    </p>
                    <p>
                      <strong className="text-gray-700">5. Payment and Credits</strong><br />
                      Credits purchased are non-refundable except as specified in our refund policy. Credits expire 12 months from the purchase date.
                    </p>
                    <p>
                      <strong className="text-gray-700">6. Privacy</strong><br />
                      Your personal information is protected according to our Privacy Policy. We do not share your data with third parties without consent.
                    </p>
                    <p>
                      <strong className="text-gray-700">7. Limitation of Liability</strong><br />
                      BookProof is not responsible for review outcomes on Amazon or any consequences of using our service.
                    </p>
                    <p>
                      <strong className="text-gray-700">8. Termination</strong><br />
                      We reserve the right to terminate accounts that violate these terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Closer note */}
              {user?.accountCreatedByCloser && (
                <div className="flex items-start gap-3 rounded-md bg-blue-50 border border-blue-100 p-3 mb-5">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    {t('closerAccountNote') || 'Your account was created by our sales team. Please accept the terms to access your dashboard and start creating campaigns.'}
                  </p>
                </div>
              )}

              {/* Checkbox */}
              <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 mb-6">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  disabled={isAccepting}
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-gray-600">
                  {t('checkboxLabel') || 'I have read and agree to the Terms of Service and Privacy Policy. I understand that violating these terms may result in account termination.'}
                </Label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  onClick={handleAcceptTerms}
                  disabled={!termsAccepted || isAccepting}
                  style={{ backgroundColor: termsAccepted ? '#3b82f6' : undefined, fontWeight: 600 }}
                  className="w-full"
                >
                  {isAccepting
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : t('acceptButton') || 'Accept & Continue'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDecline}
                  disabled={isAccepting}
                  className="w-full text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout') || 'Decline & Log out'}
                </Button>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            {['Secure & Encrypted', '100% Policy Compliant', 'GDPR Protected'].map((label) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
