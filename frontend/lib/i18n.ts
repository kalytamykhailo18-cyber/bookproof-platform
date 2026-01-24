import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'pt', 'es'] as const;
export type Locale = (typeof locales)[number];

// Message file loaders by namespace
const messageLoaders: Record<string, (locale: Locale) => Promise<Record<string, unknown>>> = {
  common: (locale) => import(`../messages/${locale}/common.json`).then((m) => m.default),
  landing: (locale) => import(`../messages/${locale}/landing.json`).then((m) => m.default),
  auth: (locale) => import(`../messages/${locale}/auth.json`).then((m) => m.default),
  reader: (locale) => import(`../messages/${locale}/reader.json`).then((m) => m.default),
  reviews: (locale) => import(`../messages/${locale}/reviews.json`).then((m) => m.default),
  author: (locale) => import(`../messages/${locale}/author.json`).then((m) => m.default),
  credits: (locale) => import(`../messages/${locale}/credits.json`).then((m) => m.default),
  subscription: (locale) =>
    import(`../messages/${locale}/subscription.json`).then((m) => m.default),
  transactions: (locale) =>
    import(`../messages/${locale}/transactions.json`).then((m) => m.default),
  'campaign-analytics': (locale) =>
    import(`../messages/${locale}/campaign-analytics.json`).then((m) => m.default),
  'reader-stats': (locale) =>
    import(`../messages/${locale}/reader-stats.json`).then((m) => m.default),
  'admin-dashboard': (locale) =>
    import(`../messages/${locale}/admin-dashboard.json`).then((m) => m.default),
  'admin-controls': (locale) =>
    import(`../messages/${locale}/admin-controls.json`).then((m) => m.default),
  'admin-exceptions': (locale) =>
    import(`../messages/${locale}/admin-exceptions.json`).then((m) => m.default),
  'admin-coupons': (locale) =>
    import(`../messages/${locale}/admin-coupons.json`).then((m) => m.default),
  'admin-payouts': (locale) =>
    import(`../messages/${locale}/admin-payouts.json`).then((m) => m.default),
  'admin-readers': (locale) =>
    import(`../messages/${locale}/admin-readers.json`).then((m) => m.default),
  'admin-authors': (locale) =>
    import(`../messages/${locale}/admin-authors.json`).then((m) => m.default),
  'admin-campaigns': (locale) =>
    import(`../messages/${locale}/admin-campaigns.json`).then((m) => m.default),
  'admin-settings': (locale) =>
    import(`../messages/${locale}/admin-settings.json`).then((m) => m.default),
  'admin-refunds': (locale) =>
    import(`../messages/${locale}/admin-refunds.json`).then((m) => m.default),
  'admin-affiliate-details': (locale) =>
    import(`../messages/${locale}/admin-affiliate-details.json`).then((m) => m.default),
  'admin-affiliate-payouts': (locale) =>
    import(`../messages/${locale}/admin-affiliate-payouts.json`).then((m) => m.default),
  'admin-author-transactions': (locale) =>
    import(`../messages/${locale}/admin-author-transactions.json`).then((m) => m.default),
  'admin-validation': (locale) =>
    import(`../messages/${locale}/admin-validation.json`).then((m) => m.default),
  affiliates: (locale) => import(`../messages/${locale}/affiliates.json`).then((m) => m.default),
  payouts: (locale) => import(`../messages/${locale}/payouts.json`).then((m) => m.default),
  reports: (locale) => import(`../messages/${locale}/reports.json`).then((m) => m.default),
  'keyword-research': (locale) =>
    import(`../messages/${locale}/keyword-research.json`).then((m) => m.default),
  'admin-landing-pages': (locale) =>
    import(`../messages/${locale}/admin-landing-pages.json`).then((m) => m.default),
  'admin-team': (locale) =>
    import(`../messages/${locale}/admin-team.json`).then((m) => m.default),
  'admin-affiliates': (locale) =>
    import(`../messages/${locale}/admin-affiliates.json`).then((m) => m.default),
  closer: (locale) => import(`../messages/${locale}/closer.json`).then((m) => m.default),
  cookies: (locale) => import(`../messages/${locale}/cookies.json`).then((m) => m.default),
  campaigns: (locale) => import(`../messages/${locale}/campaigns.json`).then((m) => m.default),
  settings: (locale) => import(`../messages/${locale}/settings.json`).then((m) => m.default),
  notifications: (locale) =>
    import(`../messages/${locale}/notifications.json`).then((m) => m.default),
  admin: (locale) => import(`../messages/${locale}/admin.json`).then((m) => m.default),
  adminLogs: (locale) => import(`../messages/${locale}/admin-logs.json`).then((m) => m.default),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

/**
 * Load messages for specific namespaces
 */
export async function getMessages(locale: Locale, namespaces: string[]): Promise<Messages | null> {
  try {
    const messages: Messages = {};
    for (const ns of namespaces) {
      const loader = messageLoaders[ns];
      if (loader) {
        const nsMessages = await loader(locale);
        Object.assign(messages, nsMessages);
      }
    }
    return messages;
  } catch {
    return null;
  }
}

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();

  // Load all message files for the locale
  const [
    common,
    auth,
    landing,
    reader,
    reviews,
    author,
    credits,
    subscription,
    transactions,
    campaignAnalytics,
    readerStats,
    adminDashboard,
    adminControls,
    adminExceptions,
    adminCoupons,
    adminPayouts,
    adminReaders,
    adminAuthors,
    adminCampaigns,
    adminSettings,
    adminRefunds,
    adminAffiliateDetails,
    adminAffiliatePayouts,
    adminAuthorTransactions,
    adminValidation,
    affiliates,
    payouts,
    reports,
    keywordResearch,
    adminLandingPages,
    adminTeam,
    adminAffiliates,
    closer,
    cookies,
    campaigns,
    notifications,
    admin,
    adminLogs,
    settings,
  ] = await Promise.all([
    import(`../messages/${locale}/common.json`).then((m) => m.default),
    import(`../messages/${locale}/auth.json`).then((m) => m.default),
    import(`../messages/${locale}/landing.json`).then((m) => m.default),
    import(`../messages/${locale}/reader.json`).then((m) => m.default),
    import(`../messages/${locale}/reviews.json`).then((m) => m.default),
    import(`../messages/${locale}/author.json`).then((m) => m.default),
    import(`../messages/${locale}/credits.json`).then((m) => m.default),
    import(`../messages/${locale}/subscription.json`).then((m) => m.default),
    import(`../messages/${locale}/transactions.json`).then((m) => m.default),
    import(`../messages/${locale}/campaign-analytics.json`).then((m) => m.default),
    import(`../messages/${locale}/reader-stats.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-dashboard.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-controls.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-exceptions.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-coupons.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-payouts.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-readers.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-authors.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-campaigns.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-settings.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-refunds.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-affiliate-details.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-affiliate-payouts.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-author-transactions.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-validation.json`).then((m) => m.default),
    import(`../messages/${locale}/affiliates.json`).then((m) => m.default),
    import(`../messages/${locale}/payouts.json`).then((m) => m.default),
    import(`../messages/${locale}/reports.json`).then((m) => m.default),
    import(`../messages/${locale}/keyword-research.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-landing-pages.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-team.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-affiliates.json`).then((m) => m.default),
    import(`../messages/${locale}/closer.json`).then((m) => m.default),
    import(`../messages/${locale}/cookies.json`).then((m) => m.default),
    import(`../messages/${locale}/campaigns.json`).then((m) => m.default),
    import(`../messages/${locale}/notifications.json`).then((m) => m.default),
    import(`../messages/${locale}/admin.json`).then((m) => m.default),
    import(`../messages/${locale}/admin-logs.json`).then((m) => m.default),
    import(`../messages/${locale}/settings.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      // Spread common translations at root level
      ...common,
      ...landing,
      ...credits,
      ...subscription,
      ...transactions,
      ...campaignAnalytics,
      ...readerStats,
      ...payouts,
      ...reports,

      // Nested namespaces - keep structure for useTranslations('namespace.key')
      // auth.json has internal nesting: { login: {...}, register: {...} }
      auth,
      // reader.json has internal nesting: { dashboard: {...}, campaigns: {...} }
      reader,
      // author.json has internal nesting: { dashboard: {...}, credits: {...}, campaigns: {...} }
      author,
      // affiliates.json has internal nesting: { register: {...}, dashboard: {...}, ... }
      affiliates,
      // reviews.json has internal nesting: { submit: {...}, validation: {...}, issues: {...} }
      reviews,
      // payouts.json has internal nesting: { paymentMethods: {...}, status: {...}, history: {...}, validation: {...} }
      payouts,
      // reader-stats.json - add as nested namespace for useTranslations('readerStats')
      readerStats,
      // campaigns.json has internal nesting: { public: {...} }
      campaigns,
      // notifications.json has internal nesting: { settings: {...} }
      notifications,
      // keyword-research.json has internal nesting: { new: {...}, edit: {...}, details: {...}, admin: {...} }
      'keyword-research': keywordResearch,

      // Flat admin namespaces (for useTranslations('adminXxx'))
      adminDashboard,
      adminControls,
      adminExceptions,
      adminCoupons,
      adminPayouts,
      adminReaders,
      adminAuthors,
      adminCampaigns,
      adminSettings,
      adminRefunds,
      adminAffiliates,
      adminAffiliateDetails,
      adminAffiliatePayouts,
      adminAuthorTransactions,
      adminTeam,
      adminValidation,
      adminLandingPages,

      // Hyphenated keys for components using hyphenated namespace
      'admin-landing-pages': adminLandingPages,
      'admin-payouts': adminPayouts,

      // admin.json has internal nesting: { packageApprovals: {...} }
      admin,

      // admin-logs.json for admin log pages
      adminLogs,

      // Other namespaces
      closer,
      cookies,
      settings,
    },
  };
});
