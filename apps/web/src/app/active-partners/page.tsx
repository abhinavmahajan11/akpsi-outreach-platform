import FilteredOrgsPage from '@/features/organizations/FilteredOrgsPage';

export const metadata = {
  title: 'Active Partners · AKPsi Outreach',
};

export default function ActivePartnersPage() {
  return (
    <FilteredOrgsPage
      title="Active Partners"
      filterKey="active-partners"
      emptyTitle="No active partners yet"
      emptyDescription="Organizations confirmed as partners will appear here."
      accentColor="border-emerald-500"
    />
  );
}
