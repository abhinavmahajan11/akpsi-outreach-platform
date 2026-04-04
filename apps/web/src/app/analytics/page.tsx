import EmptyState from '@/components/ui/EmptyState';

export const metadata = {
  title: 'Analytics · AKPsi Outreach',
};

export default function AnalyticsPage() {
  return (
    <div className="px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Outreach performance, response rates, and semester-over-semester trends
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
          title="Analytics — coming in Stage 2"
          description="Charts and reporting for outreach volume, response rates, committee performance, and semester comparisons will appear here once real data is connected."
        />
      </div>
    </div>
  );
}
