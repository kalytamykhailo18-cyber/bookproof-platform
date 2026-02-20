import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * 403 Forbidden Page (Locale-aware)
 * Section 16.1: Clear message with link to dashboard
 */
export function ForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [isHomeLoading, setIsHomeLoading] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-4 text-7xl font-bold text-foreground">403</h1>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          {t('forbidden.title')}
        </h2>

        {/* Description */}
        <p className="mb-8 text-muted-foreground">
          {t('forbidden.description')}
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="gap-2"
            onClick={() => {
              setIsHomeLoading(true);
              navigate('/');
            }}
            disabled={isHomeLoading}
          >
            {isHomeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Home className="h-4 w-4" />}
            {t('forbidden.goHome')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('forbidden.goBack')}
          </Button>
        </div>

        {/* Explanation */}
        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {t('forbidden.whyTitle')}
          </p>
          <div className="text-sm text-muted-foreground">
            <ul className="space-y-2 text-left">
              <li>{t('forbidden.reason1')}</li>
              <li>{t('forbidden.reason2')}</li>
              <li>{t('forbidden.reason3')}</li>
              <li>{t('forbidden.reason4')}</li>
            </ul>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            {t('forbidden.contactText')}{' '}
            <a
              href="mailto:support@bookproof.app"
              className="text-primary hover:underline"
            >
              {t('forbidden.contactLink')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
