import { organizations } from '@/data/organizations';
import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Pending · AKPsi Outreach',
};

export default function PendingPage() {
  const pendingOrgs = organizations.filter(
    (org) => org.status === 'pending_response'
  );

  return (
    <FilteredOrgsPage
      title="Pending Responses"
      subtitle={`${pendingOrgs.length} organization${pendingOrgs.length !== 1 ? 's' : ''} awaiting a reply`}
      organizations={pendingOrgs}
      emptyTitle="No pending responses"
      emptyDescription="Organizations waiting on a reply will show here."
      accentColor="border-amber-400"
    />
  );
}
