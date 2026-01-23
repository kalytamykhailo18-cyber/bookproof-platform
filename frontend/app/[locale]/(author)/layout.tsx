'use client';

import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { AuthorSidebar } from '@/components/author/AuthorSidebar';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      allowedRoles={['AUTHOR']}
      requireEmailVerified={true}
      requireTermsAccepted={true}
    >
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <AuthorSidebar />

        {/* Main Content */}
        <div className="pl-64 transition-all duration-300">
          {/* Header */}
          <DashboardHeader />

          {/* Page Content */}
          <main className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
