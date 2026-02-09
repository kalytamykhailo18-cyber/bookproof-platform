import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files directly
import commonEN from '../locales/en/common.json';
import commonES from '../locales/es/common.json';
import commonPT from '../locales/pt/common.json';

import landingEN from '../locales/en/landing.json';
import landingES from '../locales/es/landing.json';
import landingPT from '../locales/pt/landing.json';

import authEN from '../locales/en/auth.json';
import authES from '../locales/es/auth.json';
import authPT from '../locales/pt/auth.json';

// Helper to flatten landing page sections into separate namespaces
function flattenLanding(landingData: any) {
  const flattened: Record<string, any> = {};
  Object.keys(landingData).forEach((key) => {
    flattened[key] = landingData[key];
  });
  return flattened;
}

// Build resources object with all translations
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    ...flattenLanding(landingEN),
  },
  es: {
    common: commonES,
    auth: authES,
    ...flattenLanding(landingES),
  },
  pt: {
    common: commonPT,
    auth: authPT,
    ...flattenLanding(landingPT),
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt'],
    defaultNS: 'common',
    load: 'languageOnly', // Load 'en' instead of 'en-US'
    debug: true, // Enable debugging to see translation loading

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      // Don't auto-detect from path - RootLayout handles that via React Router
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    resources, // Load translations synchronously

    react: {
      useSuspense: false, // Disable suspense to avoid loading delays
    },
  })
  .then(() => {
    console.log('i18n initialized with language:', i18n.language);
    console.log('Available namespaces:', Object.keys(resources.en));
  })
  .catch((err) => {
    console.error('i18n initialization failed:', err);
  });

export default i18n;
