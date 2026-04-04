import Link from 'next/link';
import type { Organization } from '@/types';

const statusStyles: Record<
  Organization['status'],
  { label: string; className: string }
> = {
  active_partner: {
    label: 'Active Partner',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  pending_response: {
    label: 'Awaiting Response',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  no_contact: {
    label: 'No Contact',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  declined: {
    label: 'Declined',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-violet-50 text-violet-700 border border-violet-200',
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface OrgCommandPanelProps {
  org: Organization;
}

export default function OrgCommandPanel({ org }: OrgCommandPanelProps) {
  const status = statusStyles[org.status];
  const primaryContact = org.contacts.find((c) => c.isPrimary) ?? org.contacts[0];
  const openReminders = org.reminders.filter((r) => !r.isCompleted);
  const latestNote = org.notes[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── SECTION 1: Committee + Assignee ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {org.committeeOwner}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Assignee avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">
                {org.assignedMember
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-slate-800 leading-tight">
                {org.assignedMember}
              </p>
              <p className="text-[10px] text-slate-400">Assigned member</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── SECTION 2: Last Contacted + Status ── */}
      <div className="px-4 py-3 border-b border-slate-100 space-y-2.5">
        {/* Last contacted */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">Last contacted</p>
          {org.lastContactedAt ? (
            <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              {formatDate(org.lastContactedAt)}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Not yet</span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-medium">Status</p>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Last activity description */}
        {org.recentActivity[0] && (
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Last activity:{' '}
            <span className="text-slate-600">{org.recentActivity[0].title}</span>
            {primaryContact && (
              <> by{' '}
                <span className="text-slate-600">{org.recentActivity[0].authorName}</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* ── SECTION 3: Next Step ── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] text-slate-500 font-medium flex-shrink-0">Next step</p>
          <button className="text-[10px] font-medium text-[#0d1f3c] hover:text-[#1e3a5f] flex-shrink-0">
            Set Reminder
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-700 leading-relaxed">
          {org.nextStep}
        </p>
      </div>

      {/* ── SECTION 4: Primary Contact ── */}
      {primaryContact && (
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Primary Contact
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-blue-600">
                {primaryContact.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-800 truncate">
                {primaryContact.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{primaryContact.title}</p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-blue-600 truncate">{primaryContact.email}</p>
        </div>
      )}

      {/* ── SECTION 5: Quick Actions ── */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="grid grid-cols-3 gap-1.5">
          <QuickActionBtn label="Follow Up" icon="mail" />
          <QuickActionBtn label="Log Activity" icon="edit" />
          <QuickActionBtn label="Draft Email" icon="sparkle" accent />
        </div>
      </div>

      {/* ── SECTION 6: Notes ── */}
      {latestNote && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Internal Notes
            </p>
            <button className="text-[10px] text-[#0d1f3c] font-medium hover:text-[#1e3a5f]">
              + Add Note
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
            {latestNote.content}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-[7px] font-bold text-slate-500">
                {latestNote.authorName.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {latestNote.authorName} · {org.notes.length} note{org.notes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION 7: Follow-Up Reminders ── */}
      {openReminders.length > 0 && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Follow-Up Reminders
            </p>
            <button className="text-[10px] text-[#0d1f3c] font-medium hover:text-[#1e3a5f]">
              For this Commit &rsaquo;
            </button>
          </div>
          {openReminders.slice(0, 2).map((reminder) => (
            <div key={reminder.id} className="flex items-start gap-2 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-700 leading-snug">{reminder.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Due{' '}
                  {new Date(reminder.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}{reminder.assignedTo}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer link */}
      <div className="mt-auto px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/organizations/${org.id}`}
          className="text-[11px] font-medium text-[#0d1f3c] hover:text-[#1e3a5f] flex items-center gap-1"
        >
          View full profile
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <button className="text-[11px] text-slate-400 hover:text-slate-600 font-medium">
          Rename
        </button>
      </div>
    </div>
  );
}

function QuickActionBtn({
  label,
  icon,
  accent = false,
}: {
  label: string;
  icon: 'mail' | 'edit' | 'sparkle';
  accent?: boolean;
}) {
  const icons = {
    mail: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    edit: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
    sparkle: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  };

  return (
    <button
      className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center transition-colors ${
        accent
          ? 'bg-[#0d1f3c] text-white hover:bg-[#1e3a5f]'
          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
      }`}
    >
      {icons[icon]}
      <span className="text-[9px] font-semibold leading-tight">{label}</span>
    </button>
  );
}
