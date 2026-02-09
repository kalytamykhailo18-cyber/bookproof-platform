import { useTranslation } from 'node_modules/react-i18next';

export function CloserDashboard() {
  const { t } = useTranslation('closer');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Closer Dashboard</h1>
      <p>Closer dashboard - to be migrated from Next.js</p>
    </div>
  );
}
