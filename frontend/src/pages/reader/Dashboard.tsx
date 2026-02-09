import { useTranslation } from 'node_modules/react-i18next';

export function ReaderDashboard() {
  const { t } = useTranslation('reader');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reader Dashboard</h1>
      <p>Reader dashboard - to be migrated from Next.js</p>
    </div>
  );
}
