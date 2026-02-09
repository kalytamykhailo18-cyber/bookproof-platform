import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import i18n from '@/lib/i18n';

export function RootLayout() {
  const params = useParams();
  const locale = params.locale as string;

  // Global locale synchronization - syncs React Router locale with i18next
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <Outlet />;
}
