import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Follow-Ups · AKPsi Outreach',
};

export default function FollowUpsPage() {
  return (
    <FilteredOrgsPage
      title="Follow-Ups"
      filterKey="follow-ups"
      emptyTitle="All caught up"
      emptyDescription="No organizations currently have open follow-up reminders."
      accentColor="border-orange-400"
    />
  );
}
