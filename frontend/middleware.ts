import createMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/', '/(en|pt|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
