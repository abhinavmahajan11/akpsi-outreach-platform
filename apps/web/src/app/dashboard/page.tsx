import { organizations } from '@/data/organizations';
import DashboardView from '@/features/dashboard/DashboardView';

export const metadata = {
  title: 'Dashboard · AKPsi Outreach',
};

export default function DashboardPage() {
  return <DashboardView organizations={organizations} />;
}
