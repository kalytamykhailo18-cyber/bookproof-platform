import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate,  useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const { t, i18n } = useTranslation('auth.verifyEmail');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavLoading, setIsNavLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage(t('errorInvalidToken'));
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (error: unknown) {
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        const message = err?.response?.data?.message || err?.message;

        if (message?.includes('already used')) {
          setErrorMessage(t('errorAlreadyUsed'));
        } else if (message?.includes('expired')) {
          setErrorMessage(t('errorExpired'));
        } else {
          setErrorMessage(t('errorInvalidToken'));
        }
      }
    };

    verify();
  }, [searchParams, verifyEmail, t]);

  return (
    <Card className="animate-fade-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">{t('title')}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4 py-8">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">{t('verifying')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                {t('success')}
              </h3>
              <p className="text-muted-foreground">{t('successMessage')}</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">{t('error')}</h3>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        {status === 'success' && (
          <Button type="button" className="w-full" disabled={isNavLoading} onClick={() => { setIsNavLoading(true); navigate(`/${i18n.language}/login`); }}>
            {isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('loginButton')}
          </Button>
        )}

        {status === 'error' && (
          <Button type="button" disabled={isNavLoading} onClick={() => { setIsNavLoading(true); navigate(`/${i18n.language}/register`); }} variant="outline" className="w-full">
            {isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('resendButton')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
