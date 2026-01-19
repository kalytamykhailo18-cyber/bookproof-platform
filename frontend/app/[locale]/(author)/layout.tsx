import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
