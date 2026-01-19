import { ReactNode } from 'react';

// Disable static generation for auth pages
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
