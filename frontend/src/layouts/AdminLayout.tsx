import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        {/* AdminSidebar will go here */}
        <div className="p-4">Admin Sidebar</div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
