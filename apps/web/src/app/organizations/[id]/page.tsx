import OrganizationDetailView from '@/features/organizations/OrganizationDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Organization · AKPsi Outreach',
};

// No generateStaticParams — dynamic rendering so newly added orgs work too.

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrganizationDetailView orgId={id} />;
}
