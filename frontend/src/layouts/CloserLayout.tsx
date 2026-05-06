import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CloserSidebar } from '@/components/closer/CloserSidebar';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function CloserLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <CloserSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-3 left-3 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-10 w-10 bg-background shadow-md"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
