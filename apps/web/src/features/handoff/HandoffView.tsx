'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useOrgs } from '@/context/OrgsContext';
import { useAuth } from '@/context/AuthContext';
import { useCalendar } from '@/context/CalendarContext';
import { computeHandoff, daysSince, type CommitteeHandoff } from './handoffUtils';
import { fmtDate, fmtTime } from '@/features/calendar/calendarConfig';
import type { Organization, CommitteeType, CalendarEvent } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sinceLabel(iso: string | undefined): string {
  const d = daysSince(iso);
  if (d === null) return 'Never contacted';
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

const STATUS_COLOR: Record<string, string> = {
  active_partner:   '#16a34a',
  in_progress:      '#2563eb',
  pending_response: '#d97706',
  no_contact:       '#6b7280',
  declined:         '#dc2626',
  completed:        '#7c3aed',
};
const STATUS_LABEL: Record<string, string> = {
  active_partner:   'Active Partner',
  in_progress:      'In Progress',
  pending_response: 'Pending',
  no_contact:       'No Contact',
  declined:         'Declined',
  completed:        'Completed',
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function Stat({
  label, value, sub, accent,
}: {
  label: string; value: number; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold tracking-tight mt-1 ${accent ?? 'text-[#0d1f3c]'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Org row used in panels ────────────────────────────────────────────────────

function OrgRow({
  org,
  meta,
  showHandoffNote = false,
  urgent = false,
}: {
  org: Organization;
  meta: string;
  showHandoffNote?: boolean;
  urgent?: boolean;
}) {
  const primary = org.contacts.find((c) => c.isPrimary) ?? org.contacts[0];
  return (
    <Link
      href={`/organizations/${org.id}`}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group ${urgent ? 'bg-amber-50/60 hover:bg-amber-50' : ''}`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
        style={{ backgroundColor: org.logoColor }}
      >
        {org.logoInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0d1f3c] truncate">
            {org.name}
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: `${STATUS_COLOR[org.status]}18`,
              color: STATUS_COLOR[org.status],
            }}
          >
            {STATUS_LABEL[org.status]}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{meta}</p>
        {showHandoffNote && org.handoffNote && (
          <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 line-clamp-1">
            {org.handoffNote}
          </p>
        )}
        {primary && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            {primary.name}{primary.title ? ` · ${primary.title}` : ''}
          </p>
        )}
      </div>
      <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

// ─── Intel panel ─────────────────────────────────────────────────────────────

function IntelPanel({
  title, desc, orgs, emptyText, metaFn, accentColor, showHandoffNote, urgent, maxShow = 6,
}: {
  title: string;
  desc: string;
  orgs: Organization[];
  emptyText: string;
  metaFn: (o: Organization) => string;
  accentColor: string;
  showHandoffNote?: boolean;
  urgent?: boolean;
  maxShow?: number;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
      <div className="px-4 py-3.5 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-semibold text-slate-800 flex-1">{title}</h3>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            {orgs.length}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 pl-4">{desc}</p>
      </div>
      <div className="p-1.5">
        {orgs.length === 0 ? (
          <p className="text-xs text-slate-400 px-3 py-3">{emptyText}</p>
        ) : (
          <>
            {orgs.slice(0, maxShow).map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                meta={metaFn(org)}
                showHandoffNote={showHandoffNote}
                urgent={urgent}
              />
            ))}
            {orgs.length > maxShow && (
              <p className="text-[10px] text-slate-400 px-3 pb-1 pt-0.5">
                +{orgs.length - maxShow} more
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Committee card ───────────────────────────────────────────────────────────

function CommitteeCard({ c }: { c: CommitteeHandoff }) {
  if (c.total === 0) return null;
  const activeRate = c.total > 0 ? Math.round((c.activePartners / c.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-800 leading-tight">{c.committee}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{c.total} org{c.total !== 1 ? 's' : ''}</p>
        </div>
        {c.hasStaleActive && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">
            Stale
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <MiniBar label="Active" count={c.activePartners} total={c.total} color="#16a34a" />
        <MiniBar label="In Progress" count={c.inProgress} total={c.total} color="#2563eb" />
        <MiniBar label="Pending" count={c.pendingResponse} total={c.total} color="#d97706" />
        <MiniBar label="No Contact" count={c.noContact} total={c.total} color="#94a3b8" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {c.recentActivityCount} action{c.recentActivityCount !== 1 ? 's' : ''} this month
        </span>
        <span className="text-[10px] font-semibold text-emerald-600">{activeRate}% active</span>
      </div>
    </div>
  );
}

function MiniBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  if (count === 0) return null;
  const pct = total > 0 ? Math.max(Math.round((count / total) * 100), 4) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-600 w-4 text-right">{count}</span>
    </div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: CalendarEvent }) {
  const isOverdue = new Date(event.startAt) < new Date();
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2 rounded-lg ${isOverdue ? 'bg-rose-50' : 'hover:bg-slate-50'} transition-colors`}>
      <div className="text-center flex-shrink-0 w-8">
        <p className="text-[9px] text-slate-400 uppercase leading-none">{fmtDate(event.startAt).split(' ')[0]}</p>
        <p className="text-sm font-bold text-slate-800 leading-tight">{fmtDate(event.startAt).split(' ')[1]}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{event.title}</p>
        <p className="text-[10px] text-slate-400">
          {event.organizationName ?? 'No organization'} · {fmtTime(event.startAt)}
        </p>
      </div>
      {isOverdue && (
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 flex-shrink-0">
          Overdue
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function HandoffView() {
  const { organizations } = useOrgs();
  const { events } = useCalendar();
  const { isFullAccess, profile } = useAuth();

  const committeeScope = isFullAccess ? null : (profile?.committee as CommitteeType | null) ?? null;

  const data = useMemo(
    () => computeHandoff(organizations, events, committeeScope),
    [organizations, events, committeeScope],
  );

  const scopeLabel = isFullAccess ? 'All Committees' : (profile?.committee ?? 'Your Committee');

  return (
    <div className="px-6 pt-6 pb-16 space-y-8 max-w-[1400px]">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0d1f3c] tracking-tight">Semester Handoff</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Outreach landscape snapshot for incoming leadership
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0d1f3c]/5 text-[#0d1f3c]/70 ring-1 ring-[#0d1f3c]/10">
            {scopeLabel}
          </span>
          <Link
            href="/templates"
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] ring-1 ring-[#c9a84c]/30 hover:bg-[#c9a84c]/20 transition-colors"
          >
            View Templates →
          </Link>
        </div>
      </div>

      {/* ── At-a-glance stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Total Organizations" value={data.totalOrgs} />
        <Stat label="Active Partners" value={data.totalActivePartners}
          sub={`${data.totalOrgs > 0 ? Math.round((data.totalActivePartners / data.totalOrgs) * 100) : 0}% of pipeline`}
          accent="text-emerald-600" />
        <Stat label="Needs Follow-Up" value={data.totalNeedsFollowUp}
          sub="Pending 7+ days"
          accent={data.totalNeedsFollowUp > 0 ? 'text-amber-600' : undefined} />
        <Stat label="Stale Active" value={data.totalStaleActive}
          sub="Active, 30+ days quiet"
          accent={data.totalStaleActive > 0 ? 'text-rose-500' : undefined} />
        <Stat label="With Handoff Notes" value={data.totalWithHandoffNote}
          sub="Context preserved"
          accent="text-violet-600" />
      </div>

      {/* ── Main three-column intelligence grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <IntelPanel
          title="Active Partners"
          desc="Confirmed partnerships — highest priority for continuity"
          orgs={data.activePartners}
          emptyText="No active partners yet."
          metaFn={(o) => `${o.committeeOwner} · Last contacted ${sinceLabel(o.lastContactedAt)}`}
          accentColor="#16a34a"
          showHandoffNote
          maxShow={8}
        />
        <IntelPanel
          title="Strong Leads"
          desc="In-progress or pending with activity in the last 14 days"
          orgs={data.strongLeads}
          emptyText="No active leads right now."
          metaFn={(o) => `${o.committeeOwner} · ${sinceLabel(o.lastContactedAt)}`}
          accentColor="#2563eb"
          maxShow={8}
        />
        <IntelPanel
          title="Needs Follow-Up"
          desc="Pending response for 7+ days — don't let these go cold"
          orgs={data.needsFollowUp}
          emptyText="All pending contacts have been reached recently."
          metaFn={(o) => `Last contacted ${sinceLabel(o.lastContactedAt)}`}
          accentColor="#d97706"
          urgent
          maxShow={8}
        />
      </div>

      {/* ── Secondary signals row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <IntelPanel
          title="Stale Relationships"
          desc="Active partners with no contact in 30+ days"
          orgs={data.overdueActive}
          emptyText="No active relationships have gone quiet."
          metaFn={(o) => `Last contacted ${sinceLabel(o.lastContactedAt)}`}
          accentColor="#dc2626"
          maxShow={6}
        />
        <IntelPanel
          title="Recently Active"
          desc="Contacted in the last 7 days — strong momentum"
          orgs={data.recentlyContacted}
          emptyText="No recent activity logged."
          metaFn={(o) => `${o.committeeOwner} · ${sinceLabel(o.lastContactedAt)}`}
          accentColor="#0d1f3c"
          maxShow={6}
        />
        <IntelPanel
          title="Never Contacted"
          desc="Organizations with no outreach on record"
          orgs={data.neverContacted}
          emptyText="All organizations have been contacted."
          metaFn={(o) => o.committeeOwner}
          accentColor="#6b7280"
          maxShow={6}
        />
      </div>

      {/* ── Committee breakdown + Upcoming events ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Committee Breakdown</h2>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {data.committeeBreakdown
              .filter((c) => c.total > 0)
              .map((c) => <CommitteeCard key={c.committee} c={c} />)}
          </div>
          {data.committeeBreakdown.every((c) => c.total === 0) && (
            <p className="text-sm text-slate-400 py-4">No organizations assigned yet.</p>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Upcoming Events</h2>
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
            {data.upcomingEvents.length === 0 ? (
              <p className="text-xs text-slate-400 p-4">No events in the next 14 days.</p>
            ) : (
              <div className="p-2 space-y-0.5">
                {data.upcomingEvents.map((e) => <EventRow key={e.id} event={e} />)}
              </div>
            )}
            <div className="px-4 py-2.5 border-t border-slate-50">
              <Link href="/calendar" className="text-xs font-medium text-[#0d1f3c]/60 hover:text-[#0d1f3c] transition-colors">
                View full calendar →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Handoff tips banner ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d1f3c] to-[#1e3a5f] px-6 py-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Before you hand off</p>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">
            Add a handoff note to every active partner and strong lead — it&apos;s the most valuable thing you can leave for the next committee. Open each org page and use the Handoff Context section. Check the Templates page for email outreach and best-practice playbooks.
          </p>
        </div>
        <Link
          href="/organizations"
          className="flex-shrink-0 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 transition-colors"
        >
          Review orgs →
        </Link>
      </div>
    </div>
  );
}
