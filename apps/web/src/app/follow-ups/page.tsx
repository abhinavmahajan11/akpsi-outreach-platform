import { organizations } from '@/data/organizations';
import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Follow-Ups · AKPsi Outreach',
};

export default function FollowUpsPage() {
  // Orgs that have open (incomplete) reminders or are actively in progress
  const followUpOrgs = organizations.filter(
    (org) =>
      org.reminders.some((r) => !r.isCompleted) ||
      org.status === 'in_progress'
  );

  return (
    <FilteredOrgsPage
      title="Follow-Ups"
      subtitle={`${followUpOrgs.length} organization${followUpOrgs.length !== 1 ? 's' : ''} with open reminders or active outreach`}
      organizations={followUpOrgs}
      emptyTitle="All caught up"
      emptyDescription="No organizations currently have open follow-up reminders."
      accentColor="border-orange-400"
    />
  );
}
