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
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') // Files with extensions (favicon.ico, images, etc.)
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Run middleware on all paths
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
