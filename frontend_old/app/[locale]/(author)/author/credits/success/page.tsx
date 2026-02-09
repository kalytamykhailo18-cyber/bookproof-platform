'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Search, Sparkles, Loader2 } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function CreditPurchaseSuccessPage() {
  const t = useTranslations('author.credits.success');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || 'en';
  const { refetchBalance } = useCredits();

  // Check if keyword research was included in purchase (Section 9.1)
  const includeKeywordResearch = searchParams.get('includeKeywordResearch') === 'true';
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [isCampaignLoading, setIsCampaignLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  useEffect(() => {
    // Refetch credit balance after successful purchase
    refetchBalance();
  }, [refetchBalance]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="animate-zoom-in">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-16 w-16 animate-fade-up text-green-500" />
          </div>
          <CardTitle className="animate-fade-up-fast text-2xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="animate-fade-up-slow text-muted-foreground">{t('message')}</p>

          {/* Per Section 9.1: After payment, prompt appears to fill keyword research form */}
          {includeKeywordResearch && (
            <Alert className="animate-fade-up border-primary bg-primary/10 text-left">
              <Sparkles className="h-5 w-5 text-primary" />
              <AlertDescription className="ml-2">
                <p className="font-semibold text-primary">Keyword Research Purchased!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your keyword research order by filling in your book details. This will
                  generate a professional PDF report with optimized Amazon keywords.
                </p>
                <Button
                  type="button"
                  className="mt-3"
                  onClick={() => {
                    setIsKeywordLoading(true);
                    router.push(`/${locale}/author/keyword-research/new?fromCreditPurchase=true`);
                  }}
                  disabled={isKeywordLoading}
                >
                  {isKeywordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Fill Keyword Research Form
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="animate-fade-up-very-slow rounded-md bg-muted p-4">
            <p className="text-sm">{t('info')}</p>
          </div>

          <div className="flex animate-fade-up flex-col justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setIsCampaignLoading(true);
                router.push(`/${locale}/author/campaigns/new`);
              }}
              disabled={isCampaignLoading}
            >
              {isCampaignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createCampaign')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDashboardLoading(true);
                router.push(`/${locale}/author`);
              }}
              disabled={isDashboardLoading}
            >
              {isDashboardLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('backToDashboard')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
