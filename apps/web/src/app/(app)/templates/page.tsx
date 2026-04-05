import EmptyState from '@/components/ui/EmptyState';

export const metadata = {
  title: 'Templates · AKPsi Outreach',
};

export default function TemplatesPage() {
  return (
    <div className="px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Templates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Reusable email and outreach templates for your committee
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="Email templates — coming in Stage 2"
          description="Saved intro emails, follow-up templates, sponsorship asks, and AI-assisted drafting will be available here once backend integration is complete."
        />
      </div>
    </div>
  );
}
