import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files directly
import commonEN from '../locales/en/common.json';
import commonES from '../locales/es/common.json';
import commonPT from '../locales/pt/common.json';

// Landing page section translations (individual files per section)
import landingHeroEN from '../locales/en/landing-hero.json';
import landingHeroES from '../locales/es/landing-hero.json';
import landingHeroPT from '../locales/pt/landing-hero.json';

import landingStatsEN from '../locales/en/landing-stats.json';
import landingStatsES from '../locales/es/landing-stats.json';
import landingStatsPT from '../locales/pt/landing-stats.json';

import landingHowItWorksEN from '../locales/en/landing-how-it-works.json';
import landingHowItWorksES from '../locales/es/landing-how-it-works.json';
import landingHowItWorksPT from '../locales/pt/landing-how-it-works.json';

import landingFeaturesEN from '../locales/en/landing-features.json';
import landingFeaturesES from '../locales/es/landing-features.json';
import landingFeaturesPT from '../locales/pt/landing-features.json';

import landingForAuthorsEN from '../locales/en/landing-for-authors.json';
import landingForAuthorsES from '../locales/es/landing-for-authors.json';
import landingForAuthorsPT from '../locales/pt/landing-for-authors.json';

import landingReaderBenefitsEN from '../locales/en/landing-reader-benefits.json';
import landingReaderBenefitsES from '../locales/es/landing-reader-benefits.json';
import landingReaderBenefitsPT from '../locales/pt/landing-reader-benefits.json';

import landingTestimonialsEN from '../locales/en/landing-testimonials.json';
import landingTestimonialsES from '../locales/es/landing-testimonials.json';
import landingTestimonialsPT from '../locales/pt/landing-testimonials.json';

import landingGuaranteeEN from '../locales/en/landing-guarantee.json';
import landingGuaranteeES from '../locales/es/landing-guarantee.json';
import landingGuaranteePT from '../locales/pt/landing-guarantee.json';

import landingPricingEN from '../locales/en/landing-pricing.json';
import landingPricingES from '../locales/es/landing-pricing.json';
import landingPricingPT from '../locales/pt/landing-pricing.json';

import landingFaqEN from '../locales/en/landing-faq.json';
import landingFaqES from '../locales/es/landing-faq.json';
import landingFaqPT from '../locales/pt/landing-faq.json';

import landingLeadFormEN from '../locales/en/landing-lead-form.json';
import landingLeadFormES from '../locales/es/landing-lead-form.json';
import landingLeadFormPT from '../locales/pt/landing-lead-form.json';

import landingContactEN from '../locales/en/landing-contact.json';
import landingContactES from '../locales/es/landing-contact.json';
import landingContactPT from '../locales/pt/landing-contact.json';

import landingFooterEN from '../locales/en/landing-footer.json';
import landingFooterES from '../locales/es/landing-footer.json';
import landingFooterPT from '../locales/pt/landing-footer.json';

import landingCtaBannerEN from '../locales/en/landing-cta-banner.json';
import landingCtaBannerES from '../locales/es/landing-cta-banner.json';
import landingCtaBannerPT from '../locales/pt/landing-cta-banner.json';

import landingTrustEN from '../locales/en/landing-trust.json';
import landingTrustES from '../locales/es/landing-trust.json';
import landingTrustPT from '../locales/pt/landing-trust.json';

// Legal page translations
import legalTermsEN from '../locales/en/legal-terms.json';
import legalTermsES from '../locales/es/legal-terms.json';
import legalTermsPT from '../locales/pt/legal-terms.json';

import legalPrivacyEN from '../locales/en/legal-privacy.json';
import legalPrivacyES from '../locales/es/legal-privacy.json';
import legalPrivacyPT from '../locales/pt/legal-privacy.json';

import legalCookiesEN from '../locales/en/legal-cookies.json';
import legalCookiesES from '../locales/es/legal-cookies.json';
import legalCookiesPT from '../locales/pt/legal-cookies.json';

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

// Affiliate page translations
import affiliatesEN from '../locales/en/affiliates.json';
import affiliatesES from '../locales/es/affiliates.json';
import affiliatesPT from '../locales/pt/affiliates.json';

// Reader page translations
import readerDashboardEN from '../locales/en/reader-dashboard.json';
import readerDashboardES from '../locales/es/reader-dashboard.json';
import readerDashboardPT from '../locales/pt/reader-dashboard.json';

import readerCampaignsEN from '../locales/en/reader-campaigns.json';
import readerCampaignsES from '../locales/es/reader-campaigns.json';
import readerCampaignsPT from '../locales/pt/reader-campaigns.json';

import readerAssignmentEN from '../locales/en/reader-assignment.json';
import readerAssignmentES from '../locales/es/reader-assignment.json';
import readerAssignmentPT from '../locales/pt/reader-assignment.json';

import payoutsEN from '../locales/en/payouts.json';
import payoutsES from '../locales/es/payouts.json';
import payoutsPT from '../locales/pt/payouts.json';

import readerStatsEN from '../locales/en/reader-stats.json';
import readerStatsES from '../locales/es/reader-stats.json';
import readerStatsPT from '../locales/pt/reader-stats.json';

import readerProfileEN from '../locales/en/reader-profile.json';
import readerProfileES from '../locales/es/reader-profile.json';
import readerProfilePT from '../locales/pt/reader-profile.json';

// Author page translations
import authorDashboardEN from '../locales/en/author-dashboard.json';
import authorDashboardES from '../locales/es/author-dashboard.json';
import authorDashboardPT from '../locales/pt/author-dashboard.json';

import authorCampaignsListEN from '../locales/en/author-campaigns-list.json';
import authorCampaignsListES from '../locales/es/author-campaigns-list.json';
import authorCampaignsListPT from '../locales/pt/author-campaigns-list.json';

import authorCampaignsDetailEN from '../locales/en/author-campaigns-detail.json';
import authorCampaignsDetailES from '../locales/es/author-campaigns-detail.json';
import authorCampaignsDetailPT from '../locales/pt/author-campaigns-detail.json';

import campaignAnalyticsEN from '../locales/en/campaign-analytics.json';
import campaignAnalyticsES from '../locales/es/campaign-analytics.json';
import campaignAnalyticsPT from '../locales/pt/campaign-analytics.json';

import authorCreditsEN from '../locales/en/author-credits.json';
import authorCreditsES from '../locales/es/author-credits.json';
import authorCreditsPT from '../locales/pt/author-credits.json';

import authorCampaignsNewEN from '../locales/en/author-campaigns-new.json';
import authorCampaignsNewES from '../locales/es/author-campaigns-new.json';
import authorCampaignsNewPT from '../locales/pt/author-campaigns-new.json';

import authorTransactionsEN from '../locales/en/author-transactions.json';
import authorTransactionsES from '../locales/es/author-transactions.json';
import authorTransactionsPT from '../locales/pt/author-transactions.json';

import keywordResearchEN from '../locales/en/keyword-research.json';
import keywordResearchES from '../locales/es/keyword-research.json';
import keywordResearchPT from '../locales/pt/keyword-research.json';

import reportsEN from '../locales/en/reports.json';
import reportsES from '../locales/es/reports.json';
import reportsPT from '../locales/pt/reports.json';

import adminEN from '../locales/en/admin.json';
import adminES from '../locales/es/admin.json';
import adminPT from '../locales/pt/admin.json';

import settingsEN from '../locales/en/settings.json';
import settingsES from '../locales/es/settings.json';
import settingsPT from '../locales/pt/settings.json';

import closerEN from '../locales/en/closer.json';
import closerES from '../locales/es/closer.json';
import closerPT from '../locales/pt/closer.json';

// Build resources object with all translations
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    'auth.login': authEN.login,
    'auth.register': authEN.register,
    'auth.verifyEmail': authEN.verifyEmail,
    'auth.forgotPassword': authEN.forgotPassword,
    'auth.resetPassword': authEN.resetPassword,
    'auth.acceptTerms': authEN.acceptTerms,
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
    affiliates: affiliatesEN,
    'affiliates.dashboard': affiliatesEN.dashboard,
    'affiliates.referralLinks': affiliatesEN.referralLinks,
    'affiliates.commissions': affiliatesEN.commissions,
    'affiliates.payouts': affiliatesEN.payouts,
    'affiliates.referredAuthors': affiliatesEN.referredAuthors,
    'affiliates.register': affiliatesEN.register,
    'reader.dashboard': readerDashboardEN,
    'reader.campaigns': readerCampaignsEN,
    'reader.assignment': readerAssignmentEN,
    payouts: payoutsEN,
    readerStats: readerStatsEN,
    'reader.profile': readerProfileEN,
    authorDashboard: authorDashboardEN,
    authorCampaignsList: authorCampaignsListEN,
    authorCampaignsDetail: authorCampaignsDetailEN,
    campaignAnalytics: campaignAnalyticsEN,
    authorCredits: authorCreditsEN,
    authorCampaignsNew: authorCampaignsNewEN,
    authorTransactions: authorTransactionsEN,
    keywordResearch: keywordResearchEN,
    reports: reportsEN,
    settings: settingsEN,
    closer: closerEN,
    hero: landingHeroEN,
    stats: landingStatsEN,
    howItWorks: landingHowItWorksEN,
    features: landingFeaturesEN,
    forAuthors: landingForAuthorsEN,
    readerBenefits: landingReaderBenefitsEN,
    testimonials: landingTestimonialsEN,
    guarantee: landingGuaranteeEN,
    pricing: landingPricingEN,
    faq: landingFaqEN,
    leadForm: landingLeadFormEN,
    contact: landingContactEN,
    footer: landingFooterEN,
    ctaBanner: landingCtaBannerEN,
    trust: landingTrustEN,
    legalTerms: legalTermsEN,
    legalPrivacy: legalPrivacyEN,
    legalCookies: legalCookiesEN,
  },
  es: {
    common: commonES,
    auth: authES,
    'auth.login': authES.login,
    'auth.register': authES.register,
    'auth.verifyEmail': authES.verifyEmail,
    'auth.forgotPassword': authES.forgotPassword,
    'auth.resetPassword': authES.resetPassword,
    'auth.acceptTerms': authES.acceptTerms,
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
    affiliates: affiliatesES,
    'affiliates.dashboard': affiliatesES.dashboard,
    'affiliates.referralLinks': affiliatesES.referralLinks,
    'affiliates.commissions': affiliatesES.commissions,
    'affiliates.payouts': affiliatesES.payouts,
    'affiliates.referredAuthors': affiliatesES.referredAuthors,
    'affiliates.register': affiliatesES.register,
    'reader.dashboard': readerDashboardES,
    'reader.campaigns': readerCampaignsES,
    'reader.assignment': readerAssignmentES,
    payouts: payoutsES,
    readerStats: readerStatsES,
    'reader.profile': readerProfileES,
    authorDashboard: authorDashboardES,
    authorCampaignsList: authorCampaignsListES,
    authorCampaignsDetail: authorCampaignsDetailES,
    campaignAnalytics: campaignAnalyticsES,
    authorCredits: authorCreditsES,
    authorCampaignsNew: authorCampaignsNewES,
    authorTransactions: authorTransactionsES,
    keywordResearch: keywordResearchES,
    reports: reportsES,
    settings: settingsES,
    closer: closerES,
    hero: landingHeroES,
    stats: landingStatsES,
    howItWorks: landingHowItWorksES,
    features: landingFeaturesES,
    forAuthors: landingForAuthorsES,
    readerBenefits: landingReaderBenefitsES,
    testimonials: landingTestimonialsES,
    guarantee: landingGuaranteeES,
    pricing: landingPricingES,
    faq: landingFaqES,
    leadForm: landingLeadFormES,
    contact: landingContactES,
    footer: landingFooterES,
    ctaBanner: landingCtaBannerES,
    trust: landingTrustES,
    legalTerms: legalTermsES,
    legalPrivacy: legalPrivacyES,
    legalCookies: legalCookiesES,
  },
  pt: {
    common: commonPT,
    auth: authPT,
    'auth.login': authPT.login,
    'auth.register': authPT.register,
    'auth.verifyEmail': authPT.verifyEmail,
    'auth.forgotPassword': authPT.forgotPassword,
    'auth.resetPassword': authPT.resetPassword,
    'auth.acceptTerms': authPT.acceptTerms,
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
    affiliates: affiliatesPT,
    'affiliates.dashboard': affiliatesPT.dashboard,
    'affiliates.referralLinks': affiliatesPT.referralLinks,
    'affiliates.commissions': affiliatesPT.commissions,
    'affiliates.payouts': affiliatesPT.payouts,
    'affiliates.referredAuthors': affiliatesPT.referredAuthors,
    'affiliates.register': affiliatesPT.register,
    'reader.dashboard': readerDashboardPT,
    'reader.campaigns': readerCampaignsPT,
    'reader.assignment': readerAssignmentPT,
    payouts: payoutsPT,
    readerStats: readerStatsPT,
    'reader.profile': readerProfilePT,
    authorDashboard: authorDashboardPT,
    authorCampaignsList: authorCampaignsListPT,
    authorCampaignsDetail: authorCampaignsDetailPT,
    campaignAnalytics: campaignAnalyticsPT,
    authorCredits: authorCreditsPT,
    authorCampaignsNew: authorCampaignsNewPT,
    authorTransactions: authorTransactionsPT,
    keywordResearch: keywordResearchPT,
    reports: reportsPT,
    settings: settingsPT,
    closer: closerPT,
    hero: landingHeroPT,
    stats: landingStatsPT,
    howItWorks: landingHowItWorksPT,
    features: landingFeaturesPT,
    forAuthors: landingForAuthorsPT,
    readerBenefits: landingReaderBenefitsPT,
    testimonials: landingTestimonialsPT,
    guarantee: landingGuaranteePT,
    pricing: landingPricingPT,
    faq: landingFaqPT,
    leadForm: landingLeadFormPT,
    contact: landingContactPT,
    footer: landingFooterPT,
    ctaBanner: landingCtaBannerPT,
    trust: landingTrustPT,
    legalTerms: legalTermsPT,
    legalPrivacy: legalPrivacyPT,
    legalCookies: legalCookiesPT,
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
