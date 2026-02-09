import { Outlet } from 'react-router-dom';

export function ReaderLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        <div className="p-4">Reader Sidebar</div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
