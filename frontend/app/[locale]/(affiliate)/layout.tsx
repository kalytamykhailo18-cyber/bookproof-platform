import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['AFFILIATE']} requireEmailVerified={true}>
      <div className="min-h-screen bg-background">{children}</div>
    </ProtectedRoute>
  );
}
