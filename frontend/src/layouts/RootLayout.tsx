import { Outlet } from 'react-router-dom';

export function RootLayout() {
  // Language is managed via localStorage by i18next
  // No URL sync needed
  return <Outlet />;
}
