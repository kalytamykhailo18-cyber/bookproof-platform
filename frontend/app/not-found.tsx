'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Loader2 } from 'lucide-react';

/**
 * Global 404 Not Found Page
 * Section 16.1: Friendly page with navigation options
 *
 * Note: This is the root-level 404, shown when no locale context exists.
 * Routes use 'en' as default locale since we're outside [locale] context.
 */
export default function NotFound() {
  const router = useRouter();
  const [isHomeLoading, setIsHomeLoading] = useState(false);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);
  const [isReaderLoading, setIsReaderLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Default locale for root-level 404 (outside [locale] context)
  const locale = 'en';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <FileQuestion className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-4 text-7xl font-bold text-foreground">404</h1>

        {/* Title */}
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or doesn't exist.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            type="button"
            size="lg"
            className="gap-2"
            onClick={() => {
              setIsHomeLoading(true);
              router.push(`/${locale}`);
            }}
            disabled={isHomeLoading}
          >
            {isHomeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Home className="h-4 w-4" />}
            Go Home
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            You might be looking for:
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <button
              onClick={() => {
                setIsCampaignsLoading(true);
                router.push(`/${locale}/author/campaigns`);
              }}
              className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
              disabled={isCampaignsLoading}
            >
              {isCampaignsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              My Campaigns (Authors)
            </button>
            <button
              onClick={() => {
                setIsReaderLoading(true);
                router.push(`/${locale}/reader`);
              }}
              className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
              disabled={isReaderLoading}
            >
              {isReaderLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Reader Dashboard
            </button>
            <button
              onClick={() => {
                setIsAdminLoading(true);
                router.push(`/${locale}/admin/dashboard`);
              }}
              className="inline-flex items-center justify-center gap-2 text-primary hover:underline"
              disabled={isAdminLoading}
            >
              {isAdminLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Admin Dashboard
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Still having trouble?{' '}
            <a
              href="mailto:support@bookproof.app"
              className="text-primary hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
