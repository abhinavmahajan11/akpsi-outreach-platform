import { organizations } from '@/data/organizations';
import OrganizationsView from '@/features/organizations/OrganizationsView';

export const metadata = {
  title: 'Organizations · AKPsi Outreach',
};

export default function OrganizationsPage() {
  return <OrganizationsView organizations={organizations} />;
}
