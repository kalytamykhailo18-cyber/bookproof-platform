import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardHeader } from '@/components/shared/DashboardHeader';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

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
