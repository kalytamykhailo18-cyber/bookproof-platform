import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Clean React hook for language switching
 * Handles both i18next AND URL routing together
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLanguage = i18n.language || 'en';

  const changeLanguage = useCallback(
    (newLang: string) => {
      // Change i18next language
      i18n.changeLanguage(newLang);

      // Update URL to match
      const pathParts = location.pathname.split('/');
      pathParts[1] = newLang; // Replace locale in /:locale/...
      navigate(pathParts.join('/'), { replace: true });
    },
    [i18n, location.pathname, navigate]
  );

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages: ['en', 'es', 'pt'] as const,
  };
}
