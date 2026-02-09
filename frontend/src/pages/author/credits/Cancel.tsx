import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2 } from 'lucide-react';
import { useNavigate,  useParams } from 'react-router-dom';

export function CreditPurchaseCancelPage() {
  const { t } = useTranslation('author.credits.cancel');
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const [isTryAgainLoading, setIsTryAgainLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

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
            <Button
              type="button"
              onClick={() => {
                setIsTryAgainLoading(true);
                navigate(`/${locale}/author/credits`);
              }}
              disabled={isTryAgainLoading}
            >
              {isTryAgainLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('tryAgain')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDashboardLoading(true);
                navigate(`/${locale}/author`);
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
