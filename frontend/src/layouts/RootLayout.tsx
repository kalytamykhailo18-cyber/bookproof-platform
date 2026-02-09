import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import i18n from '@/lib/i18n';

export function RootLayout() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Global locale synchronization - syncs React Router locale with i18next
  useEffect(() => {
    console.log('[RootLayout] URL locale:', locale, '| i18n.language:', i18n.language);
    if (locale && i18n.language !== locale) {
      console.log('[RootLayout] Changing language to:', locale);
      i18n.changeLanguage(locale).then(() => {
        console.log('[RootLayout] Language changed successfully to:', i18n.language);
      });
    }
  }, [locale]);

  return <Outlet />;
}
