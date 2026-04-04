import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export const metadata = {
  title: 'Semester Handoff · AKPsi Outreach',
};

export default function HandoffPage() {
  return (
    <div className="px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Semester Handoff
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Transfer outreach context and relationship history to incoming leadership
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <EmptyState
          icon={
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          }
          title="Semester Handoff — coming in Stage 2"
          description="Generate handoff packets for incoming VPs and committee chairs. Includes relationship summaries, open follow-ups, active partner notes, and recommended next steps."
          action={
            <Link
              href="/organizations"
              className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
            >
              Review all organizations before handoff →
            </Link>
          }
        />
      </div>
    </div>
  );
}
