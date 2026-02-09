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

// Admin page translations
import adminDashboardEN from '../locales/en/admin-dashboard.json';
import adminDashboardES from '../locales/es/admin-dashboard.json';
import adminDashboardPT from '../locales/pt/admin-dashboard.json';

import adminAuthorsEN from '../locales/en/admin-authors.json';
import adminAuthorsES from '../locales/es/admin-authors.json';
import adminAuthorsPT from '../locales/pt/admin-authors.json';

import adminReadersEN from '../locales/en/admin-readers.json';
import adminReadersES from '../locales/es/admin-readers.json';
import adminReadersPT from '../locales/pt/admin-readers.json';

import adminAffiliatesEN from '../locales/en/admin-affiliates.json';
import adminAffiliatesES from '../locales/es/admin-affiliates.json';
import adminAffiliatesPT from '../locales/pt/admin-affiliates.json';

import adminCampaignsEN from '../locales/en/admin-campaigns.json';
import adminCampaignsES from '../locales/es/admin-campaigns.json';
import adminCampaignsPT from '../locales/pt/admin-campaigns.json';

import adminValidationEN from '../locales/en/admin-validation.json';
import adminValidationES from '../locales/es/admin-validation.json';
import adminValidationPT from '../locales/pt/admin-validation.json';

import adminPayoutsEN from '../locales/en/admin-payouts.json';
import adminPayoutsES from '../locales/es/admin-payouts.json';
import adminPayoutsPT from '../locales/pt/admin-payouts.json';

import adminRefundsEN from '../locales/en/admin-refunds.json';
import adminRefundsES from '../locales/es/admin-refunds.json';
import adminRefundsPT from '../locales/pt/admin-refunds.json';

import adminCouponsEN from '../locales/en/admin-coupons.json';
import adminCouponsES from '../locales/es/admin-coupons.json';
import adminCouponsPT from '../locales/pt/admin-coupons.json';

import adminSettingsEN from '../locales/en/admin-settings.json';
import adminSettingsES from '../locales/es/admin-settings.json';
import adminSettingsPT from '../locales/pt/admin-settings.json';

import adminTeamEN from '../locales/en/admin-team.json';
import adminTeamES from '../locales/es/admin-team.json';
import adminTeamPT from '../locales/pt/admin-team.json';

import adminLandingPagesEN from '../locales/en/admin-landing-pages.json';
import adminLandingPagesES from '../locales/es/admin-landing-pages.json';
import adminLandingPagesPT from '../locales/pt/admin-landing-pages.json';

import adminExceptionsEN from '../locales/en/admin-exceptions.json';
import adminExceptionsES from '../locales/es/admin-exceptions.json';
import adminExceptionsPT from '../locales/pt/admin-exceptions.json';

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
    adminDashboard: adminDashboardEN,
    adminAuthors: adminAuthorsEN,
    adminReaders: adminReadersEN,
    adminAffiliates: adminAffiliatesEN,
    adminCampaigns: adminCampaignsEN,
    adminValidation: adminValidationEN,
    adminPayouts: adminPayoutsEN,
    adminRefunds: adminRefundsEN,
    adminCoupons: adminCouponsEN,
    adminSettings: adminSettingsEN,
    adminTeam: adminTeamEN,
    adminLandingPages: adminLandingPagesEN,
    adminExceptions: adminExceptionsEN,
    ...flattenLanding(landingEN),
  },
  es: {
    common: commonES,
    auth: authES,
    adminDashboard: adminDashboardES,
    adminAuthors: adminAuthorsES,
    adminReaders: adminReadersES,
    adminAffiliates: adminAffiliatesES,
    adminCampaigns: adminCampaignsES,
    adminValidation: adminValidationES,
    adminPayouts: adminPayoutsES,
    adminRefunds: adminRefundsES,
    adminCoupons: adminCouponsES,
    adminSettings: adminSettingsES,
    adminTeam: adminTeamES,
    adminLandingPages: adminLandingPagesES,
    adminExceptions: adminExceptionsES,
    ...flattenLanding(landingES),
  },
  pt: {
    common: commonPT,
    auth: authPT,
    adminDashboard: adminDashboardPT,
    adminAuthors: adminAuthorsPT,
    adminReaders: adminReadersPT,
    adminAffiliates: adminAffiliatesPT,
    adminCampaigns: adminCampaignsPT,
    adminValidation: adminValidationPT,
    adminPayouts: adminPayoutsPT,
    adminRefunds: adminRefundsPT,
    adminCoupons: adminCouponsPT,
    adminSettings: adminSettingsPT,
    adminTeam: adminTeamPT,
    adminLandingPages: adminLandingPagesPT,
    adminExceptions: adminExceptionsPT,
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
