import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Pending · AKPsi Outreach',
};

export default function PendingPage() {
  return (
    <FilteredOrgsPage
      title="Pending Responses"
      filterKey="pending"
      emptyTitle="No pending responses"
      emptyDescription="Organizations waiting on a reply will show here."
      accentColor="border-amber-400"
    />
  );
}
