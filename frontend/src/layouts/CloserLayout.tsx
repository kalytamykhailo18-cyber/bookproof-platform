import { Outlet } from 'react-router-dom';
import { CloserSidebar } from '@/components/closer/CloserSidebar';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

export function CloserLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <CloserSidebar />

      {/* Main Content Area */}
      <div className="pl-64 transition-all duration-300">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
