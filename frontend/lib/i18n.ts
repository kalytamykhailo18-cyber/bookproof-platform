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
  affiliates: (locale) => import(`../messages/${locale}/affiliates.json`).then((m) => m.default),
  payouts: (locale) => import(`../messages/${locale}/payouts.json`).then((m) => m.default),
  reports: (locale) => import(`../messages/${locale}/reports.json`).then((m) => m.default),
  'keyword-research': (locale) =>
    import(`../messages/${locale}/keyword-research.json`).then((m) => m.default),
  'admin-landing-pages': (locale) =>
    import(`../messages/${locale}/admin-landing-pages.json`).then((m) => m.default),
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

  return {
    locale,
    messages: (await import(`../messages/${locale}/common.json`)).default,
  };
});
