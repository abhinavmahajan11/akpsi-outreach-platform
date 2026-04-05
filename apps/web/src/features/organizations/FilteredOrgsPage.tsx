'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Organization } from '@/types';
import { useOrgs } from '@/context/OrgsContext';
import OrgRow from './OrgRow';
import EmptyState from '@/components/ui/EmptyState';

// ─── Filter definitions ───────────────────────────────────────────────────────

export type FilterKey = 'active-partners' | 'pending' | 'follow-ups';

const FILTER_CONFIG: Record<
  FilterKey,
  { fn: (org: Organization) => boolean; subtitle: (n: number) => string }
> = {
  'active-partners': {
    fn: (org) => org.status === 'active_partner',
    subtitle: (n) =>
      `${n} confirmed partner${n !== 1 ? 's' : ''} this semester`,
  },
  pending: {
    fn: (org) => org.status === 'pending_response',
    subtitle: (n) =>
      `${n} organization${n !== 1 ? 's' : ''} awaiting a reply`,
  },
  'follow-ups': {
    fn: (org) =>
      org.reminders.some((r) => !r.isCompleted) || org.status === 'in_progress',
    subtitle: (n) =>
      `${n} organization${n !== 1 ? 's' : ''} with open reminders or active outreach`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface FilteredOrgsPageProps {
  title: string;
  filterKey: FilterKey;
  emptyTitle?: string;
  emptyDescription?: string;
  accentColor?: string;
}

export default function FilteredOrgsPage({
  title,
  filterKey,
  emptyTitle = 'Nothing here',
  emptyDescription = 'No organizations match this view.',
  accentColor = 'border-[#0d1f3c]',
}: FilteredOrgsPageProps) {
  const { organizations, loading, error } = useOrgs();
  const [searchQuery, setSearchQuery] = useState('');

  const config = FILTER_CONFIG[filterKey];

  const baseOrgs = useMemo(
    () => organizations.filter(config.fn),
    [organizations, config.fn],
  );

  const filtered = useMemo(() => {
    if (searchQuery.trim() === '') return baseOrgs;
    const q = searchQuery.toLowerCase();
    return baseOrgs.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.industry.toLowerCase().includes(q) ||
        org.committeeOwner.toLowerCase().includes(q) ||
        org.assignedMember.toLowerCase().includes(q),
    );
  }, [baseOrgs, searchQuery]);

  if (error) {
    return (
      <div className="px-8 pt-8">
        <p className="text-sm font-medium text-rose-600">Failed to load data</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className={`pl-4 border-l-4 ${accentColor}`}>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {config.subtitle(baseOrgs.length)}
          </p>
        </div>
        <Link
          href="/organizations/new"
          className="flex items-center gap-2 rounded-xl bg-[#0d1f3c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Organization
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-lg mb-5">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name, committee, or member…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm border border-slate-200 focus:outline-none focus:border-[#0d1f3c]/30"
        />
      </div>

      {/* Count + link */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-400 font-medium">
          {filtered.length} organization{filtered.length !== 1 ? 's' : ''}
        </span>
        <Link
          href="/organizations"
          className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
        >
          View all organizations →
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((org) => (
            <OrgRow key={org.id} org={org} />
          ))}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
}
