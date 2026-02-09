import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Clean React hook for language switching
 * Language is stored in localStorage and managed by i18next
 * No URL routing needed - language is independent of routes
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language || 'en';

  const changeLanguage = useCallback(
    (newLang: string) => {
      // Change i18next language - automatically saved to localStorage
      // by LanguageDetector with caches: ['localStorage'] config
      i18n.changeLanguage(newLang);
    },
    [i18n]
  );

  return {
    currentLanguage,
    changeLanguage,
    availableLanguages: ['en', 'es', 'pt'] as const,
  };
}
