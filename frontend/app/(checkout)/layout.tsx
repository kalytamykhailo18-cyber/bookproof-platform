import { ReactNode } from 'react';

// Disable static generation for checkout pages
export const dynamic = 'force-dynamic';

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
