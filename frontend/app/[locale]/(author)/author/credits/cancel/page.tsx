'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export default function CreditPurchaseCancelPage() {
  const t = useTranslations('author.credits.cancel');
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="animate-zoom-in">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="h-16 w-16 animate-fade-up text-yellow-500" />
          </div>
          <CardTitle className="animate-fade-up-fast text-2xl">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="animate-fade-up-slow text-muted-foreground">{t('message')}</p>

          <div className="flex animate-fade-up-very-slow flex-col justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={() => router.push(`/${locale}/author/credits`)}>
              {t('tryAgain')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/${locale}/author`)}>
              {t('backToDashboard')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
