import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      allowedRoles={['AUTHOR']}
      requireEmailVerified={true}
      requireTermsAccepted={true}
    >
      <div className="min-h-screen bg-background">{children}</div>
    </ProtectedRoute>
  );
}
