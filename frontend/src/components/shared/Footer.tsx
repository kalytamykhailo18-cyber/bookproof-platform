import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { Loader2 } from 'lucide-react';

export function Footer() {
  const { t, i18n } = useTranslation('footer');
  const navigate = useNavigate();
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [isCookiesLoading, setIsCookiesLoading] = useState(false);

  return (
    <footer className="border-t bg-background py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="animate-fade-right">
            <h3 className="mb-4 text-lg font-bold">{t('links.product.title')}</h3>
            <ul className="space-y-2">
              <li>
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigate(`/${i18n.language}`);
                    setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                >
                  {t('links.product.features')}
                </span>
              </li>
              <li>
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigate(`/${i18n.language}`);
                    setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                >
                  {t('links.product.pricing')}
                </span>
              </li>
              <li>
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigate(`/${i18n.language}`);
                    setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                >
                  {t('links.product.faq')}
                </span>
              </li>
            </ul>
          </div>
          <div className="animate-fade-up">
            <h3 className="mb-4 text-lg font-bold">{t('links.company.title')}</h3>
            <ul className="space-y-2">
              <li>
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigate(`/${i18n.language}`);
                    setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                >
                  {t('links.company.about')}
                </span>
              </li>
              <li>
                <span
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigate(`/${i18n.language}`);
                    setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                >
                  {t('links.company.contact')}
                </span>
              </li>
            </ul>
          </div>
          <div className="animate-fade-down">
            <h3 className="mb-4 text-lg font-bold">{t('links.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <span
                  className={`cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2 ${isPrivacyLoading ? 'opacity-70' : ''}`}
                  onClick={() => {
                    if (isPrivacyLoading) return;
                    setIsPrivacyLoading(true);
                    navigate(`/${i18n.language}/privacy`);
                  }}
                >
                  {isPrivacyLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {t('links.legal.privacy')}
                </span>
              </li>
              <li>
                <span
                  className={`cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2 ${isTermsLoading ? 'opacity-70' : ''}`}
                  onClick={() => {
                    if (isTermsLoading) return;
                    setIsTermsLoading(true);
                    navigate(`/${i18n.language}/terms`);
                  }}
                >
                  {isTermsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {t('links.legal.terms')}
                </span>
              </li>
              <li>
                <span
                  className={`cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-2 ${isCookiesLoading ? 'opacity-70' : ''}`}
                  onClick={() => {
                    if (isCookiesLoading) return;
                    setIsCookiesLoading(true);
                    navigate(`/${i18n.language}/cookies`);
                  }}
                >
                  {isCookiesLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {t('links.legal.cookies')}
                </span>
              </li>
            </ul>
          </div>
          <div className="animate-fade-left">
            <h3 className="mb-4 text-lg font-bold">BookProof</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t('tagline')}</p>
            <LanguageSelector />
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
