import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './lib/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, API routes, and Next.js internals
  // This prevents 400 errors on _next/static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    /\.(.*)$/.test(pathname) // Files with extensions (favicon.ico, images, etc.)
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Only match paths that should go through i18n middleware
  // Explicitly exclude static files and API routes
  matcher: [
    '/',
    '/(en|pt|es)/:path*',
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
