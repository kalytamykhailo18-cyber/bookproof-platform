import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Clean React + Vite i18n setup
// Uses dynamic imports for code splitting

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['path', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    resources: {}, // Will be loaded dynamically
  });

// Dynamically load and register translations
async function loadTranslations(lng: string) {
  try {
    // Load common namespace
    const common = await import(`../locales/${lng}/common.json`);
    i18n.addResourceBundle(lng, 'common', common.default, true, true);

    // Load landing and flatten its sections into separate namespaces
    // This allows components to use useTranslation('hero'), useTranslation('features'), etc.
    const landing = await import(`../locales/${lng}/landing.json`);
    const landingData = landing.default;

    // Flatten: { hero: {...}, features: {...} } → separate namespaces
    Object.keys(landingData).forEach((key) => {
      i18n.addResourceBundle(lng, key, landingData[key], true, true);
    });

    // Load auth
    const auth = await import(`../locales/${lng}/auth.json`);
    i18n.addResourceBundle(lng, 'auth', auth.default, true, true);

    // Add more namespaces as needed when migrating other pages
  } catch (error) {
    console.error(`Failed to load ${lng} translations:`, error);
  }
}

// Preload translations for all supported languages
const initTranslations = async () => {
  const languages = ['en', 'es', 'pt'];
  await Promise.all(languages.map((lng) => loadTranslations(lng)));
};

// Initialize
initTranslations();

export default i18n;
