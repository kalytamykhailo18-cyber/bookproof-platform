import { useTranslation } from 'node_modules/react-i18next';

export function AuthorDashboard() {
  const { t } = useTranslation('author');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Author Dashboard</h1>
      <p>Author dashboard - to be migrated from Next.js</p>
    </div>
  );
}
