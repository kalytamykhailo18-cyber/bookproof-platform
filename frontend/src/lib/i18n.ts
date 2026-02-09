import i18n from 'i18next';
import { initReactI18next } from 'node_modules/react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector/cjs';

// English translations
import enAdminAffiliateDetails from '../locales/en/admin-affiliate-details.json';
import enAdminAffiliatePayouts from '../locales/en/admin-affiliate-payouts.json';
import enAdminAffiliates from '../locales/en/admin-affiliates.json';
import enAdminAuthorTransactions from '../locales/en/admin-author-transactions.json';
import enAdminAuthors from '../locales/en/admin-authors.json';
import enAdminCampaigns from '../locales/en/admin-campaigns.json';
import enAdminControls from '../locales/en/admin-controls.json';
import enAdminCoupons from '../locales/en/admin-coupons.json';
import enAdminDashboard from '../locales/en/admin-dashboard.json';
import enAdminExceptions from '../locales/en/admin-exceptions.json';
import enAdminLandingPages from '../locales/en/admin-landing-pages.json';
import enAdminLogs from '../locales/en/admin-logs.json';
import enAdminPayouts from '../locales/en/admin-payouts.json';
import enAdminReaders from '../locales/en/admin-readers.json';
import enAdminRefunds from '../locales/en/admin-refunds.json';
import enAdminSettings from '../locales/en/admin-settings.json';
import enAdminTeam from '../locales/en/admin-team.json';
import enAdminValidation from '../locales/en/admin-validation.json';
import enAdmin from '../locales/en/admin.json';
import enAffiliates from '../locales/en/affiliates.json';
import enAuth from '../locales/en/auth.json';
import enAuthor from '../locales/en/author.json';
import enCampaignAnalytics from '../locales/en/campaign-analytics.json';
import enCampaigns from '../locales/en/campaigns.json';
import enCloser from '../locales/en/closer.json';
import enCommon from '../locales/en/common.json';
import enCookies from '../locales/en/cookies.json';
import enCredits from '../locales/en/credits.json';
import enKeywordResearch from '../locales/en/keyword-research.json';
import enLanding from '../locales/en/landing.json';
import enNotifications from '../locales/en/notifications.json';
import enPayouts from '../locales/en/payouts.json';
import enReaderStats from '../locales/en/reader-stats.json';
import enReader from '../locales/en/reader.json';
import enReports from '../locales/en/reports.json';
import enReviews from '../locales/en/reviews.json';
import enSettings from '../locales/en/settings.json';
import enSubscription from '../locales/en/subscription.json';
import enTransactions from '../locales/en/transactions.json';

// Spanish translations
import esAdminAffiliateDetails from '../locales/es/admin-affiliate-details.json';
import esAdminAffiliatePayouts from '../locales/es/admin-affiliate-payouts.json';
import esAdminAffiliates from '../locales/es/admin-affiliates.json';
import esAdminAuthorTransactions from '../locales/es/admin-author-transactions.json';
import esAdminAuthors from '../locales/es/admin-authors.json';
import esAdminCampaigns from '../locales/es/admin-campaigns.json';
import esAdminControls from '../locales/es/admin-controls.json';
import esAdminCoupons from '../locales/es/admin-coupons.json';
import esAdminDashboard from '../locales/es/admin-dashboard.json';
import esAdminExceptions from '../locales/es/admin-exceptions.json';
import esAdminLandingPages from '../locales/es/admin-landing-pages.json';
import esAdminLogs from '../locales/es/admin-logs.json';
import esAdminPayouts from '../locales/es/admin-payouts.json';
import esAdminReaders from '../locales/es/admin-readers.json';
import esAdminRefunds from '../locales/es/admin-refunds.json';
import esAdminSettings from '../locales/es/admin-settings.json';
import esAdminTeam from '../locales/es/admin-team.json';
import esAdminValidation from '../locales/es/admin-validation.json';
import esAdmin from '../locales/es/admin.json';
import esAffiliates from '../locales/es/affiliates.json';
import esAuth from '../locales/es/auth.json';
import esAuthor from '../locales/es/author.json';
import esCampaignAnalytics from '../locales/es/campaign-analytics.json';
import esCampaigns from '../locales/es/campaigns.json';
import esCloser from '../locales/es/closer.json';
import esCommon from '../locales/es/common.json';
import esCookies from '../locales/es/cookies.json';
import esCredits from '../locales/es/credits.json';
import esKeywordResearch from '../locales/es/keyword-research.json';
import esLanding from '../locales/es/landing.json';
import esNotifications from '../locales/es/notifications.json';
import esPayouts from '../locales/es/payouts.json';
import esReaderStats from '../locales/es/reader-stats.json';
import esReader from '../locales/es/reader.json';
import esReports from '../locales/es/reports.json';
import esReviews from '../locales/es/reviews.json';
import esSettings from '../locales/es/settings.json';
import esSubscription from '../locales/es/subscription.json';
import esTransactions from '../locales/es/transactions.json';

// Portuguese translations
import ptAdminAffiliateDetails from '../locales/pt/admin-affiliate-details.json';
import ptAdminAffiliatePayouts from '../locales/pt/admin-affiliate-payouts.json';
import ptAdminAffiliates from '../locales/pt/admin-affiliates.json';
import ptAdminAuthorTransactions from '../locales/pt/admin-author-transactions.json';
import ptAdminAuthors from '../locales/pt/admin-authors.json';
import ptAdminCampaigns from '../locales/pt/admin-campaigns.json';
import ptAdminControls from '../locales/pt/admin-controls.json';
import ptAdminCoupons from '../locales/pt/admin-coupons.json';
import ptAdminDashboard from '../locales/pt/admin-dashboard.json';
import ptAdminExceptions from '../locales/pt/admin-exceptions.json';
import ptAdminLandingPages from '../locales/pt/admin-landing-pages.json';
import ptAdminLogs from '../locales/pt/admin-logs.json';
import ptAdminPayouts from '../locales/pt/admin-payouts.json';
import ptAdminReaders from '../locales/pt/admin-readers.json';
import ptAdminRefunds from '../locales/pt/admin-refunds.json';
import ptAdminSettings from '../locales/pt/admin-settings.json';
import ptAdminTeam from '../locales/pt/admin-team.json';
import ptAdminValidation from '../locales/pt/admin-validation.json';
import ptAdmin from '../locales/pt/admin.json';
import ptAffiliates from '../locales/pt/affiliates.json';
import ptAuth from '../locales/pt/auth.json';
import ptAuthor from '../locales/pt/author.json';
import ptCampaignAnalytics from '../locales/pt/campaign-analytics.json';
import ptCampaigns from '../locales/pt/campaigns.json';
import ptCloser from '../locales/pt/closer.json';
import ptCommon from '../locales/pt/common.json';
import ptCookies from '../locales/pt/cookies.json';
import ptCredits from '../locales/pt/credits.json';
import ptKeywordResearch from '../locales/pt/keyword-research.json';
import ptLanding from '../locales/pt/landing.json';
import ptNotifications from '../locales/pt/notifications.json';
import ptPayouts from '../locales/pt/payouts.json';
import ptReaderStats from '../locales/pt/reader-stats.json';
import ptReader from '../locales/pt/reader.json';
import ptReports from '../locales/pt/reports.json';
import ptReviews from '../locales/pt/reviews.json';
import ptSettings from '../locales/pt/settings.json';
import ptSubscription from '../locales/pt/subscription.json';
import ptTransactions from '../locales/pt/transactions.json';

const resources = {
  en: {
    adminAffiliateDetails: enAdminAffiliateDetails,
    adminAffiliatePayouts: enAdminAffiliatePayouts,
    adminAffiliates: enAdminAffiliates,
    adminAuthorTransactions: enAdminAuthorTransactions,
    adminAuthors: enAdminAuthors,
    adminCampaigns: enAdminCampaigns,
    adminControls: enAdminControls,
    adminCoupons: enAdminCoupons,
    adminDashboard: enAdminDashboard,
    adminExceptions: enAdminExceptions,
    adminLandingPages: enAdminLandingPages,
    adminLogs: enAdminLogs,
    adminPayouts: enAdminPayouts,
    adminReaders: enAdminReaders,
    adminRefunds: enAdminRefunds,
    adminSettings: enAdminSettings,
    adminTeam: enAdminTeam,
    adminValidation: enAdminValidation,
    admin: enAdmin,
    affiliates: enAffiliates,
    auth: enAuth,
    author: enAuthor,
    campaignAnalytics: enCampaignAnalytics,
    campaigns: enCampaigns,
    closer: enCloser,
    common: enCommon,
    cookies: enCookies,
    credits: enCredits,
    keywordResearch: enKeywordResearch,
    landing: enLanding,
    notifications: enNotifications,
    payouts: enPayouts,
    readerStats: enReaderStats,
    reader: enReader,
    reports: enReports,
    reviews: enReviews,
    settings: enSettings,
    subscription: enSubscription,
    transactions: enTransactions,
  },
  es: {
    adminAffiliateDetails: esAdminAffiliateDetails,
    adminAffiliatePayouts: esAdminAffiliatePayouts,
    adminAffiliates: esAdminAffiliates,
    adminAuthorTransactions: esAdminAuthorTransactions,
    adminAuthors: esAdminAuthors,
    adminCampaigns: esAdminCampaigns,
    adminControls: esAdminControls,
    adminCoupons: esAdminCoupons,
    adminDashboard: esAdminDashboard,
    adminExceptions: esAdminExceptions,
    adminLandingPages: esAdminLandingPages,
    adminLogs: esAdminLogs,
    adminPayouts: esAdminPayouts,
    adminReaders: esAdminReaders,
    adminRefunds: esAdminRefunds,
    adminSettings: esAdminSettings,
    adminTeam: esAdminTeam,
    adminValidation: esAdminValidation,
    admin: esAdmin,
    affiliates: esAffiliates,
    auth: esAuth,
    author: esAuthor,
    campaignAnalytics: esCampaignAnalytics,
    campaigns: esCampaigns,
    closer: esCloser,
    common: esCommon,
    cookies: esCookies,
    credits: esCredits,
    keywordResearch: esKeywordResearch,
    landing: esLanding,
    notifications: esNotifications,
    payouts: esPayouts,
    readerStats: esReaderStats,
    reader: esReader,
    reports: esReports,
    reviews: esReviews,
    settings: esSettings,
    subscription: esSubscription,
    transactions: esTransactions,
  },
  pt: {
    adminAffiliateDetails: ptAdminAffiliateDetails,
    adminAffiliatePayouts: ptAdminAffiliatePayouts,
    adminAffiliates: ptAdminAffiliates,
    adminAuthorTransactions: ptAdminAuthorTransactions,
    adminAuthors: ptAdminAuthors,
    adminCampaigns: ptAdminCampaigns,
    adminControls: ptAdminControls,
    adminCoupons: ptAdminCoupons,
    adminDashboard: ptAdminDashboard,
    adminExceptions: ptAdminExceptions,
    adminLandingPages: ptAdminLandingPages,
    adminLogs: ptAdminLogs,
    adminPayouts: ptAdminPayouts,
    adminReaders: ptAdminReaders,
    adminRefunds: ptAdminRefunds,
    adminSettings: ptAdminSettings,
    adminTeam: ptAdminTeam,
    adminValidation: ptAdminValidation,
    admin: ptAdmin,
    affiliates: ptAffiliates,
    auth: ptAuth,
    author: ptAuthor,
    campaignAnalytics: ptCampaignAnalytics,
    campaigns: ptCampaigns,
    closer: ptCloser,
    common: ptCommon,
    cookies: ptCookies,
    credits: ptCredits,
    keywordResearch: ptKeywordResearch,
    landing: ptLanding,
    notifications: ptNotifications,
    payouts: ptPayouts,
    readerStats: ptReaderStats,
    reader: ptReader,
    reports: ptReports,
    reviews: ptReviews,
    settings: ptSettings,
    subscription: ptSubscription,
    transactions: ptTransactions,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
  });

export default i18n;
