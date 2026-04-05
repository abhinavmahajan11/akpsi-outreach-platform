import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export const metadata = {
  title: 'Contacts · AKPsi Outreach',
};

export default function ContactsPage() {
  return (
    <div className="px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Contacts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Individual contacts across all tracked organizations
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          title="Contacts — coming in Stage 2"
          description="A dedicated contacts directory with search, filtering by organization, and direct outreach shortcuts will be available in the next stage."
          action={
            <Link
              href="/organizations"
              className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
            >
              View contacts inside each organization →
            </Link>
          }
        />
      </div>
    </div>
  );
}
