import { organizations } from '@/data/organizations';
import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Active Partners · AKPsi Outreach',
};

export default function ActivePartnersPage() {
  const activePartners = organizations.filter(
    (org) => org.status === 'active_partner'
  );

  return (
    <FilteredOrgsPage
      title="Active Partners"
      subtitle={`${activePartners.length} confirmed partner${activePartners.length !== 1 ? 's' : ''} this semester`}
      organizations={activePartners}
      emptyTitle="No active partners yet"
      emptyDescription="Organizations confirmed as partners will appear here."
      accentColor="border-emerald-500"
    />
  );
}
