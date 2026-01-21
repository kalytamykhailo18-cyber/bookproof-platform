'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, Search } from 'lucide-react';

/**
 * Global 404 Not Found Page
 * Section 16.1: Friendly page with navigation options and search suggestion
 */
export default function NotFound() {
  const router = useRouter();

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
          <Button size="lg" className="gap-2" onClick={() => router.push('/')}>
            <Home className="h-4 w-4" />
            Go Home
          </Button>

          <Button variant="outline" size="lg" className="gap-2" onClick={() => router.push('/search')}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            You might be looking for:
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <button
              onClick={() => router.push('/author/campaigns')}
              className="text-primary hover:underline"
            >
              My Campaigns
            </button>
            <button
              onClick={() => router.push('/reader/assignments')}
              className="text-primary hover:underline"
            >
              My Assignments
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-primary hover:underline"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => router.push('/help')}
              className="text-primary hover:underline"
            >
              Help Center
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Still having trouble?{' '}
            <button
              onClick={() => router.push('/contact')}
              className="text-primary hover:underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
