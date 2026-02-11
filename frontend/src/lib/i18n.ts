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

import adminAuthorTransactionsEN from '../locales/en/admin-author-transactions.json';
import adminAuthorTransactionsES from '../locales/es/admin-author-transactions.json';
import adminAuthorTransactionsPT from '../locales/pt/admin-author-transactions.json';

import adminReadersEN from '../locales/en/admin-readers.json';
import adminReadersES from '../locales/es/admin-readers.json';
import adminReadersPT from '../locales/pt/admin-readers.json';

import adminAffiliatesEN from '../locales/en/admin-affiliates.json';
import adminAffiliatesES from '../locales/es/admin-affiliates.json';
import adminAffiliatesPT from '../locales/pt/admin-affiliates.json';

import adminAffiliateDetailsEN from '../locales/en/admin-affiliate-details.json';
import adminAffiliateDetailsES from '../locales/es/admin-affiliate-details.json';
import adminAffiliateDetailsPT from '../locales/pt/admin-affiliate-details.json';

import adminCampaignsEN from '../locales/en/admin-campaigns.json';
import adminCampaignsES from '../locales/es/admin-campaigns.json';
import adminCampaignsPT from '../locales/pt/admin-campaigns.json';

import adminControlsEN from '../locales/en/admin-controls.json';
import adminControlsES from '../locales/es/admin-controls.json';
import adminControlsPT from '../locales/pt/admin-controls.json';

import adminValidationEN from '../locales/en/admin-validation.json';
import adminValidationES from '../locales/es/admin-validation.json';
import adminValidationPT from '../locales/pt/admin-validation.json';

import adminPayoutsEN from '../locales/en/admin-payouts.json';
import adminPayoutsES from '../locales/es/admin-payouts.json';
import adminPayoutsPT from '../locales/pt/admin-payouts.json';

import adminRefundsEN from '../locales/en/admin-refunds.json';
import adminRefundsES from '../locales/es/admin-refunds.json';
import adminRefundsPT from '../locales/pt/admin-refunds.json';

import adminPaymentIssuesEN from '../locales/en/admin-payment-issues.json';
import adminPaymentIssuesES from '../locales/es/admin-payment-issues.json';
import adminPaymentIssuesPT from '../locales/pt/admin-payment-issues.json';

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

import adminKeywordResearchEN from '../locales/en/admin-keyword-research.json';
import adminKeywordResearchES from '../locales/es/admin-keyword-research.json';
import adminKeywordResearchPT from '../locales/pt/admin-keyword-research.json';

import adminNotificationsEN from '../locales/en/admin-notifications.json';
import adminNotificationsES from '../locales/es/admin-notifications.json';
import adminNotificationsPT from '../locales/pt/admin-notifications.json';

import adminDisputesEN from '../locales/en/admin-disputes.json';
import adminDisputesES from '../locales/es/admin-disputes.json';
import adminDisputesPT from '../locales/pt/admin-disputes.json';

import adminIssuesEN from '../locales/en/admin-issues.json';
import adminIssuesES from '../locales/es/admin-issues.json';
import adminIssuesPT from '../locales/pt/admin-issues.json';

import adminReaderBehaviorEN from '../locales/en/admin-reader-behavior.json';
import adminReaderBehaviorES from '../locales/es/admin-reader-behavior.json';
import adminReaderBehaviorPT from '../locales/pt/admin-reader-behavior.json';

import keywordResearchEN from '../locales/en/keyword-research.json';
import keywordResearchES from '../locales/es/keyword-research.json';
import keywordResearchPT from '../locales/pt/keyword-research.json';

import adminEN from '../locales/en/admin.json';
import adminES from '../locales/es/admin.json';
import adminPT from '../locales/pt/admin.json';

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
    admin: adminEN,
    adminDashboard: adminDashboardEN,
    adminAuthors: adminAuthorsEN,
    adminAuthorTransactions: adminAuthorTransactionsEN,
    adminReaders: adminReadersEN,
    adminAffiliates: adminAffiliatesEN,
    adminAffiliateDetails: adminAffiliateDetailsEN,
    adminCampaigns: adminCampaignsEN,
    adminControls: adminControlsEN,
    adminValidation: adminValidationEN,
    adminPayouts: adminPayoutsEN,
    adminRefunds: adminRefundsEN,
    adminPaymentIssues: adminPaymentIssuesEN,
    adminCoupons: adminCouponsEN,
    adminSettings: adminSettingsEN,
    adminTeam: adminTeamEN,
    adminLandingPages: adminLandingPagesEN,
    adminExceptions: adminExceptionsEN,
    adminKeywordResearch: adminKeywordResearchEN,
    adminNotifications: adminNotificationsEN,
    adminDisputes: adminDisputesEN,
    adminIssues: adminIssuesEN,
    adminReaderBehavior: adminReaderBehaviorEN,
    keywordResearch: keywordResearchEN,
    ...flattenLanding(landingEN),
  },
  es: {
    common: commonES,
    auth: authES,
    admin: adminES,
    adminDashboard: adminDashboardES,
    adminAuthors: adminAuthorsES,
    adminAuthorTransactions: adminAuthorTransactionsES,
    adminReaders: adminReadersES,
    adminAffiliates: adminAffiliatesES,
    adminAffiliateDetails: adminAffiliateDetailsES,
    adminCampaigns: adminCampaignsES,
    adminControls: adminControlsES,
    adminValidation: adminValidationES,
    adminPayouts: adminPayoutsES,
    adminRefunds: adminRefundsES,
    adminPaymentIssues: adminPaymentIssuesES,
    adminCoupons: adminCouponsES,
    adminSettings: adminSettingsES,
    adminTeam: adminTeamES,
    adminLandingPages: adminLandingPagesES,
    adminExceptions: adminExceptionsES,
    adminKeywordResearch: adminKeywordResearchES,
    adminNotifications: adminNotificationsES,
    adminDisputes: adminDisputesES,
    adminIssues: adminIssuesES,
    adminReaderBehavior: adminReaderBehaviorES,
    keywordResearch: keywordResearchES,
    ...flattenLanding(landingES),
  },
  pt: {
    common: commonPT,
    auth: authPT,
    admin: adminPT,
    adminDashboard: adminDashboardPT,
    adminAuthors: adminAuthorsPT,
    adminAuthorTransactions: adminAuthorTransactionsPT,
    adminReaders: adminReadersPT,
    adminAffiliates: adminAffiliatesPT,
    adminAffiliateDetails: adminAffiliateDetailsPT,
    adminCampaigns: adminCampaignsPT,
    adminControls: adminControlsPT,
    adminValidation: adminValidationPT,
    adminPayouts: adminPayoutsPT,
    adminRefunds: adminRefundsPT,
    adminPaymentIssues: adminPaymentIssuesPT,
    adminCoupons: adminCouponsPT,
    adminSettings: adminSettingsPT,
    adminTeam: adminTeamPT,
    adminLandingPages: adminLandingPagesPT,
    adminExceptions: adminExceptionsPT,
    adminKeywordResearch: adminKeywordResearchPT,
    adminNotifications: adminNotificationsPT,
    adminDisputes: adminDisputesPT,
    adminIssues: adminIssuesPT,
    adminReaderBehavior: adminReaderBehaviorPT,
    keywordResearch: keywordResearchPT,
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
    console.log('Available namespaces:', Object.keys(resources.en));
  })
  .catch((err) => {
    console.error('i18n initialization failed:', err);
  });

export default i18n;
