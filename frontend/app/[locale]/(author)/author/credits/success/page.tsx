'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CreditPurchaseSuccessPage() {
  const t = useTranslations('author.credits.success');
  const { refetchBalance } = useCredits();

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

          <div className="animate-fade-up-very-slow rounded-md bg-muted p-4">
            <p className="text-sm">{t('info')}</p>
          </div>

          <div className="flex animate-fade-up flex-col justify-center gap-4 sm:flex-row">
            <Link href="/author/campaigns/new">
              <Button>{t('createCampaign')}</Button>
            </Link>
            <Link href="/author">
              <Button variant="outline">{t('backToDashboard')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
