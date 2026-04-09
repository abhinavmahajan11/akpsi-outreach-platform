'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useOrgs } from '@/context/OrgsContext';
import { useAuth } from '@/context/AuthContext';
import { computeAnalytics, type OrgAnalytics, type StatusBreakdownItem, type CommitteeBreakdownItem } from '@/lib/analytics';
import type { Organization } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSinceLabel(iso: string | undefined): string {
  if (!iso) return 'Never contacted';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function formatActivityType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function BigStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${accent ?? 'text-[#0d1f3c]'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ─── CSS bar ──────────────────────────────────────────────────────────────────

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Status breakdown ─────────────────────────────────────────────────────────

function StatusBreakdown({ items }: { items: StatusBreakdownItem[] }) {
  const nonZero = items.filter((i) => i.count > 0);
  if (nonZero.length === 0) return <p className="text-sm text-slate-400 py-2">No data yet.</p>;

  return (
    <div className="space-y-3">
      {nonZero.map((item) => (
        <div key={item.status} className="flex items-center gap-3">
          <div className="w-28 flex-shrink-0">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.label}
            </span>
          </div>
          <Bar pct={item.pct} color={item.color} />
          <span className="w-12 text-right text-xs font-semibold text-slate-700 flex-shrink-0">
            {item.count}
            <span className="font-normal text-slate-400 ml-0.5">({item.pct}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Committee breakdown ──────────────────────────────────────────────────────

function CommitteeBreakdown({ items }: { items: CommitteeBreakdownItem[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400 py-2">No data yet.</p>;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.committee} className="flex items-center gap-3">
          <div className="w-36 flex-shrink-0 text-xs font-medium text-slate-700 truncate">
            {item.committee}
          </div>
          <Bar pct={item.pct} color="#0d1f3c" />
          <div className="w-20 text-right flex-shrink-0">
            <span className="text-xs font-semibold text-slate-700">{item.count}</span>
            <span className="text-[10px] text-slate-400 ml-1">orgs</span>
            {item.activityCount > 0 && (
              <div className="text-[10px] text-slate-400">{item.activityCount} actions</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity summary grid ────────────────────────────────────────────────────

function ActivitySummary({ analytics }: { analytics: OrgAnalytics }) {
  const { activitySummary } = analytics;
  const typeEntries = Object.entries(activitySummary.byType).sort(([, a], [, b]) => b - a);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100 text-center">
          <p className="text-2xl font-bold text-[#0d1f3c]">{activitySummary.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Activities</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100 text-center">
          <p className="text-2xl font-bold text-[#0d1f3c]">{analytics.totalNotes}</p>
          <p className="text-xs text-slate-500 mt-0.5">Notes Logged</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100 text-center">
          <p className="text-2xl font-bold text-[#0d1f3c]">{analytics.openReminders}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open Reminders</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 ring-1 ring-slate-100 text-center">
          <p className="text-2xl font-bold text-[#c9a84c]">{analytics.activePartners}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Partners</p>
        </div>
      </div>

      {typeEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By type</p>
          <div className="space-y-1.5">
            {typeEntries.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{formatActivityType(type)}</span>
                <span className="text-xs font-semibold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Intelligence org row ─────────────────────────────────────────────────────

function IntelRow({ org, meta }: { org: Organization; meta: string }) {
  return (
    <Link
      href={`/organizations/${org.id}`}
      className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ backgroundColor: org.logoColor }}
      >
        {org.logoInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#0d1f3c]">
          {org.name}
        </p>
        <p className="text-[10px] text-slate-400 truncate">{meta}</p>
      </div>
      <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function IntelPanel({
  title,
  description,
  orgs,
  emptyText,
  metaFn,
  accentColor,
}: {
  title: string;
  description: string;
  orgs: Organization[];
  emptyText: string;
  metaFn: (org: Organization) => string;
  accentColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <span
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {orgs.length}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 pl-4">{description}</p>
      </div>

      <div className="px-2.5 py-2">
        {orgs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 px-2.5">{emptyText}</p>
        ) : (
          <div>
            {orgs.slice(0, 6).map((org) => (
              <IntelRow key={org.id} org={org} meta={metaFn(org)} />
            ))}
            {orgs.length > 6 && (
              <p className="text-[10px] text-slate-400 px-2.5 pb-1 pt-0.5">
                +{orgs.length - 6} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Committee-scoped filter ──────────────────────────────────────────────────

function scopeForUser(
  organizations: Organization[],
  isFullAccess: boolean,
  committee: string | null,
): Organization[] {
  if (isFullAccess || !committee) return organizations;
  return organizations.filter((o) => o.committeeOwner === committee);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsView() {
  const { organizations } = useOrgs();
  const { isFullAccess, profile } = useAuth();

  const scoped = useMemo(
    () => scopeForUser(organizations, isFullAccess, profile?.committee ?? null),
    [organizations, isFullAccess, profile],
  );

  const analytics = useMemo(() => computeAnalytics(scoped), [scoped]);

  const scopeLabel = isFullAccess
    ? 'All committees'
    : profile?.committee ?? 'Your committee';

  return (
    <div className="px-6 pt-6 pb-16 space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0d1f3c] tracking-tight">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Outreach health &amp; relationship intelligence
          </p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0d1f3c]/5 text-[#0d1f3c]/70 ring-1 ring-[#0d1f3c]/10">
          {scopeLabel}
        </span>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat label="Total Organizations" value={analytics.totalOrgs} />
        <BigStat
          label="Active Partners"
          value={analytics.activePartners}
          sub={`${analytics.totalOrgs > 0 ? Math.round((analytics.activePartners / analytics.totalOrgs) * 100) : 0}% of pipeline`}
          accent="text-emerald-600"
        />
        <BigStat
          label="Needs Follow-Up"
          value={analytics.needsFollowUp.length}
          sub="Pending response 7+ days"
          accent={analytics.needsFollowUp.length > 0 ? 'text-amber-600' : undefined}
        />
        <BigStat
          label="Never Contacted"
          value={analytics.neverContacted.length}
          sub="No outreach yet"
          accent={analytics.neverContacted.length > 0 ? 'text-slate-500' : undefined}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl ring-1 ring-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Status Breakdown</h2>
          <StatusBreakdown items={analytics.statusBreakdown} />
        </div>

        {/* Committee breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl ring-1 ring-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Committee Distribution</h2>
          {analytics.mostActiveCommittee && (
            <p className="text-[11px] text-slate-400 mb-4">
              Most active: <span className="font-medium text-slate-600">{analytics.mostActiveCommittee}</span>
            </p>
          )}
          {!analytics.mostActiveCommittee && <div className="mb-4" />}
          <CommitteeBreakdown items={analytics.committeeBreakdown} />
        </div>

        {/* Activity summary */}
        <div className="lg:col-span-1 bg-white rounded-2xl ring-1 ring-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Activity Summary</h2>
          <ActivitySummary analytics={analytics} />
        </div>
      </div>

      {/* Relationship intelligence */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Relationship Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <IntelPanel
            title="Needs Follow-Up"
            description="Pending response for 7+ days"
            orgs={analytics.needsFollowUp}
            emptyText="All pending contacts were reached recently."
            metaFn={(o) => `Last contacted ${daysSinceLabel(o.lastContactedAt)}`}
            accentColor="#d97706"
          />
          <IntelPanel
            title="Stale Relationships"
            description="Active / in-progress, no contact in 30+ days"
            orgs={analytics.staleRelationships}
            emptyText="No active relationships have gone quiet."
            metaFn={(o) =>
              o.lastContactedAt
                ? `Last contacted ${daysSinceLabel(o.lastContactedAt)}`
                : 'No contact logged'
            }
            accentColor="#dc2626"
          />
          <IntelPanel
            title="Never Contacted"
            description="Organizations with no outreach on record"
            orgs={analytics.neverContacted}
            emptyText="All organizations have been contacted."
            metaFn={(o) => o.committeeOwner}
            accentColor="#6b7280"
          />
        </div>
      </div>

      {/* Recently active */}
      {analytics.recentlyActive.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-800">Recently Active</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {analytics.recentlyActive.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
            {analytics.recentlyActive.map((org) => (
              <IntelRow
                key={org.id}
                org={org}
                meta={`Contacted ${daysSinceLabel(org.lastContactedAt)}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
