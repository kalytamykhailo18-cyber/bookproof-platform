import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate,  useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { useLoading } from '@/components/providers/LoadingProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, Shield, CheckCircle, Loader2 } from 'lucide-react';

export function AcceptTermsPage() {
  const { t, i18n } = useTranslation('auth.acceptTerms');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const acceptTermsMutation = useMutation({
    mutationFn: () => {
      startLoading('Accepting terms...');
      return authApi.acceptTerms();
    },
    onSuccess: () => {
      stopLoading();
      toast.success(t('success') || 'Terms accepted successfully!');
      // Invalidate user query to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Redirect to author dashboard
      navigate(`/${i18n.language}/author`);
    },
    onError: (error: unknown) => {
      stopLoading();
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept terms';
      toast.error(errorMessage);
    } });

  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      toast.error(t('checkboxRequired') || 'You must accept the terms to continue');
      return;
    }
    acceptTermsMutation.mutate();
  };

  // If user already accepted terms, redirect to dashboard
  if (user?.termsAccepted) {
    navigate(`/${i18n.language}/author`);
    return null;
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader className="space-y-1">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          {t('title') || 'Terms of Service'}
        </CardTitle>
        <CardDescription className="text-center">
          {t('subtitle') || 'Please review and accept our terms of service to continue'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">{t('termsTitle') || 'BookProof Terms of Service'}</h3>
          </div>
          <div className="h-[200px] overflow-y-auto rounded-md border bg-background p-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>1. Acceptance of Terms</strong>
                <br />
                By using BookProof, you agree to these terms of service. If you do not agree, please
                do not use our platform.
              </p>
              <p>
                <strong>2. Service Description</strong>
                <br />
                BookProof connects authors with readers to facilitate authentic book reviews on
                Amazon. Authors purchase credits to initiate review campaigns for their books.
              </p>
              <p>
                <strong>3. Author Responsibilities</strong>
                <br />
                Authors must provide accurate book information, high-quality materials, and comply
                with all Amazon policies regarding reviews.
              </p>
              <p>
                <strong>4. Review Authenticity</strong>
                <br />
                All reviews facilitated through BookProof must be genuine and reflect the
                reader&apos;s honest opinion. Fake reviews are strictly prohibited.
              </p>
              <p>
                <strong>5. Payment and Credits</strong>
                <br />
                Credits purchased are non-refundable except as specified in our refund policy.
                Credits expire 12 months from the purchase date.
              </p>
              <p>
                <strong>6. Privacy</strong>
                <br />
                Your personal information is protected according to our Privacy Policy. We do not
                share your data with third parties without consent.
              </p>
              <p>
                <strong>7. Limitation of Liability</strong>
                <br />
                BookProof is not responsible for review outcomes on Amazon or any consequences of
                using our service.
              </p>
              <p>
                <strong>8. Termination</strong>
                <br />
                We reserve the right to terminate accounts that violate these terms.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 rounded-md border p-4">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            disabled={acceptTermsMutation.isPending}
          />
          <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed">
            {t('checkboxLabel') ||
              'I have read and agree to the Terms of Service and Privacy Policy. I understand that violating these terms may result in account termination.'}
          </Label>
        </div>

        {user?.accountCreatedByCloser && (
          <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {t('closerAccountNote') ||
                'Your account was created by our sales team. Please accept the terms to access your dashboard and start creating campaigns.'}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-3">
        <Button
          type="button"
          onClick={handleAcceptTerms}
          className="w-full"
          disabled={!termsAccepted || acceptTermsMutation.isPending}
        >
          {acceptTermsMutation.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : t('acceptButton') || 'Accept and Continue'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={logout}
          className="w-full text-muted-foreground"
          disabled={acceptTermsMutation.isPending}
        >
          {t('logout') || 'Decline and Logout'}
        </Button>
      </CardFooter>
    </Card>
  );
}
