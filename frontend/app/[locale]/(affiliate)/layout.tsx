'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['AFFILIATE']} requireEmailVerified={true}>
      <DashboardHeader />
      <div className="min-h-screen bg-background">{children}</div>
    </ProtectedRoute>
  );
}
