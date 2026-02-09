import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';

export function Header() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex animate-fade-right-fast items-center gap-2">
          <span
            className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            {t('app.name')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Button
            type="button"
            variant="ghost"
            className="animate-fade-left-fast"
            onClick={() => navigate(`/login`)}
          >
            {t('nav.login')}
          </Button>
          <Button
            type="button"
            className="animate-fade-left"
            onClick={() => navigate(`/register`)}
          >
            {t('nav.signup')}
          </Button>
        </div>
      </div>
    </header>
  );
}
