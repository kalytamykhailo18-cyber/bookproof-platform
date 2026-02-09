import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function Header() {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLoginClick = () => {
    setIsLoginLoading(true);
    navigate(`/${i18n.language}/login`);
  };

  const handleSignupClick = () => {
    setIsSignupLoading(true);
    navigate(`/${i18n.language}/register`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex animate-fade-right-fast items-center gap-2">
          <span
            className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent cursor-pointer"
            onClick={() => navigate(`/${i18n.language}`)}
          >
            {t('app.name')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Button type="button" variant="ghost" className="animate-fade-left-fast" onClick={handleLoginClick} disabled={isLoginLoading}>
            {isLoginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('nav.login')}
          </Button>
          <Button type="button" className="animate-fade-left" onClick={handleSignupClick} disabled={isSignupLoading}>
            {isSignupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('nav.signup')}
          </Button>
        </div>
      </div>
    </header>
  );
}
