'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { OutreachStatus } from '@/types';
import { useOrgs } from '@/context/OrgsContext';
import OrgRow from './OrgRow';
import EmptyState from '@/components/ui/EmptyState';

const STATUS_FILTERS: Array<{ label: string; value: OutreachStatus | 'All' }> = [
  { label: 'All',              value: 'All' },
  { label: 'Active Partner',   value: 'active_partner' },
  { label: 'In Progress',      value: 'in_progress' },
  { label: 'Pending Response', value: 'pending_response' },
  { label: 'No Contact',       value: 'no_contact' },
  { label: 'Declined',         value: 'declined' },
];

interface OrganizationsViewProps {
  title?: string;
  subtitle?: string;
}

export default function OrganizationsView({
  title = 'Organizations',
  subtitle = 'All tracked organizations across committees',
}: OrganizationsViewProps) {
  const { organizations, loading, error } = useOrgs();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<OutreachStatus | 'All'>('All');

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = activeStatus === 'All' || org.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchQuery, activeStatus]);

  if (error) {
    return (
      <div className="px-8 pt-8">
        <p className="text-sm font-medium text-rose-600">Failed to load organizations</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link
          href="/organizations/new"
          className="flex items-center gap-2 rounded-xl bg-[#0d1f3c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Organization
        </Link>
      </div>

      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <div className="relative max-w-lg">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search organizations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm border border-slate-200 focus:outline-none focus:border-[#0d1f3c]/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveStatus(f.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeStatus === f.value
                  ? 'bg-[#0d1f3c] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {filtered.length} organization{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <EmptyState
          title="No organizations found"
          description="Try adjusting your search or filter."
        />
      )}
    </div>
  );
}
