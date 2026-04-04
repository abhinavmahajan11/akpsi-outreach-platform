import { notFound } from 'next/navigation';
import { getOrganizationById, organizations } from '@/data/organizations';
import OrganizationDetailView from '@/features/organizations/OrganizationDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return organizations.map((org) => ({ id: org.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const org = getOrganizationById(id);
  return {
    title: org ? `${org.name} · AKPsi Outreach` : 'Not Found',
  };
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const org = getOrganizationById(id);

  if (!org) {
    notFound();
  }

  return <OrganizationDetailView org={org} />;
}
