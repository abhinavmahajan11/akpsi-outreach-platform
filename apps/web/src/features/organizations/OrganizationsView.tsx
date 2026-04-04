'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Organization, OutreachStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import OrgLogo from '@/components/ui/OrgLogo';
import TagBadge from '@/components/ui/TagBadge';

const STATUS_FILTERS: Array<{ label: string; value: OutreachStatus | 'All' }> =
  [
    { label: 'All', value: 'All' },
    { label: 'Active Partner', value: 'active_partner' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Pending Response', value: 'pending_response' },
    { label: 'No Contact', value: 'no_contact' },
    { label: 'Declined', value: 'declined' },
  ];

interface OrganizationsViewProps {
  organizations: Organization[];
}

export default function OrganizationsView({
  organizations,
}: OrganizationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<OutreachStatus | 'All'>(
    'All'
  );

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        activeStatus === 'All' || org.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchQuery, activeStatus]);

  return (
    <div className="px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Organizations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All tracked organizations across committees
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#0d1f3c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors shadow-sm">
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
        </button>
      </div>

      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <div className="relative max-w-lg">
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
            placeholder="Search organizations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/30"
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
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
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

      {/* Organization rows */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5">
          {filtered.map((org) => (
            <OrgRow key={org.id} org={org} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">
            No organizations found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  );
}

function OrgRow({ org }: { org: Organization }) {
  return (
    <Link href={`/organizations/${org.id}`}>
      <div className="group flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm ring-1 ring-slate-100 hover:ring-slate-200 hover:shadow-md transition-all cursor-pointer">
        {/* Logo */}
        <OrgLogo
          name={org.name}
          logoInitials={org.logoInitials}
          logoColor={org.logoColor}
          website={org.website}
          size="md"
        />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0d1f3c] transition-colors">
              {org.name}
            </p>
            <span className="text-xs text-slate-400">
              {org.type} · {org.industry}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            <span className="font-medium text-slate-600">Next: </span>
            {org.nextStep}
          </p>
        </div>

        {/* Tags */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {org.tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>

        {/* Committee */}
        <div className="hidden lg:block flex-shrink-0 text-xs text-slate-400 text-right min-w-[140px]">
          {org.committeeOwner}
          <br />
          <span className="text-slate-300">{org.assignedMember}</span>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <StatusBadge status={org.status} />
        </div>

        {/* Arrow */}
        <svg
          className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </Link>
  );
}
