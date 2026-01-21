'use client';

import { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

function LegalHeader({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();

  const handleLogoClick = () => {
    router.push(`/${locale}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={handleLogoClick}
        >
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
            {t('app.name')}
          </span>
        </div>
        <LanguageSelector currentLocale={locale} />
      </div>
    </header>
  );
}

function LegalFooter() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t bg-background py-6">
      <div className="container text-center text-sm text-muted-foreground">
        <p>{t('copyright')}</p>
      </div>
    </footer>
  );
}

export default function LegalLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  return (
    <div className="flex min-h-screen flex-col">
      <LegalHeader locale={locale} />
      <main className="flex-1">
        {children}
      </main>
      <LegalFooter />
    </div>
  );
}
