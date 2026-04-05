'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Organization, OrganizationType, CommitteeType, OutreachStatus } from '@/types';
import StatCard from '@/components/ui/StatCard';
import OrganizationCard from '@/features/organizations/OrganizationCard';
import OrgCommandPanel from './OrgCommandPanel';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { dashboardStats } from '@/data/dashboard';

const TYPE_FILTERS: Array<{ label: string; value: OrganizationType | 'All' }> =
  [
    { label: 'All', value: 'All' },
    { label: 'Corporate', value: 'Corporate' },
    { label: 'Nonprofit', value: 'Nonprofit' },
    { label: 'Sponsor', value: 'Sponsor' },
    { label: 'Service Partner', value: 'Service Partner' },
  ];

const CATEGORY_TABS = [
  { label: 'Recruiting', tag: 'recruiting' },
  { label: 'Sponsorship', tag: 'sponsor' },
  { label: 'Workshop / Speaker', tag: 'info-session' },
  { label: 'Service', tag: 'service' },
];

const COMMITTEES: Array<{ label: string; value: CommitteeType | 'All' }> = [
  { label: 'All Committees', value: 'All' },
  { label: 'Professional Development', value: 'Professional Development' },
  { label: 'Community Service', value: 'Community Service' },
  { label: 'Brotherhood', value: 'Brotherhood' },
  { label: 'Fundraising', value: 'Fundraising' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Alumni Relations', value: 'Alumni Relations' },
];

const STATUSES: Array<{ label: string; value: OutreachStatus | 'All' }> = [
  { label: 'All Status', value: 'All' },
  { label: 'Active Partner', value: 'active_partner' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Awaiting Response', value: 'pending_response' },
  { label: 'No Contact', value: 'no_contact' },
  { label: 'Declined', value: 'declined' },
  { label: 'Completed', value: 'completed' },
];

interface DashboardViewProps {
  organizations: Organization[];
}

export default function DashboardView({ organizations }: DashboardViewProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.id ?? ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<OrganizationType | 'All'>('All');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [committeeFilter, setCommitteeFilter] = useState<CommitteeType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'lastContacted' | 'status'>('name');

  // Dropdown open states
  const [committeeOpen, setCommitteeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  const filteredOrgs = useMemo(() => {
    const filtered = organizations.filter((org) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.committeeOwner.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = activeType === 'All' || org.type === activeType;

      const matchesCategory =
        activeCategoryTab === null ||
        org.tags.some((t) => t.includes(activeCategoryTab));

      const matchesCommittee =
        committeeFilter === 'All' || org.committeeOwner === committeeFilter;

      const matchesStatus =
        statusFilter === 'All' || org.status === statusFilter;

      return matchesSearch && matchesType && matchesCategory && matchesCommittee && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'lastContacted') {
        const aDate = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
        const bDate = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
        return bDate - aDate;
      }
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });
  }, [organizations, searchQuery, activeType, activeCategoryTab, committeeFilter, statusFilter, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Page header — inside white card area */}
      <div className="px-6 pt-5 pb-0">
        {/* Title row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Outreach Management Platform
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1.5">
              Professional Business Fraternity
              <span className="text-slate-300">·</span>
              University Chapter
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </p>
          </div>
          <Link
            href="/organizations/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#0d1f3c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Organization
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>

      {/* Organizations workspace */}
      <div className="flex-1 min-h-0 px-6 pb-6 flex flex-col">
        {/* Section header + filter dropdowns */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Organizations</h2>
          <div className="flex items-center gap-2">
            {/* All Committees dropdown */}
            <div className="relative">
              <button
                onClick={() => { setCommitteeOpen((v) => !v); setStatusOpen(false); setMoreOpen(false); }}
                className={`flex items-center gap-1.5 rounded-lg bg-white border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                  committeeFilter !== 'All'
                    ? 'border-[#0d1f3c]/30 text-[#0d1f3c]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {committeeFilter === 'All' ? 'All Committees' : committeeFilter}
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <DropdownMenu
                open={committeeOpen}
                onClose={() => setCommitteeOpen(false)}
                position="right-0 top-full mt-1"
                minWidth="min-w-[200px]"
                items={COMMITTEES.map((c) => ({
                  label: c.label,
                  onClick: () => setCommitteeFilter(c.value),
                }))}
              />
            </div>

            {/* All Status dropdown */}
            <div className="relative">
              <button
                onClick={() => { setStatusOpen((v) => !v); setCommitteeOpen(false); setMoreOpen(false); }}
                className={`flex items-center gap-1.5 rounded-lg bg-white border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors ${
                  statusFilter !== 'All'
                    ? 'border-[#0d1f3c]/30 text-[#0d1f3c]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {statusFilter === 'All' ? 'All Status' : STATUSES.find((s) => s.value === statusFilter)?.label ?? 'All Status'}
                <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <DropdownMenu
                open={statusOpen}
                onClose={() => setStatusOpen(false)}
                position="right-0 top-full mt-1"
                minWidth="min-w-[180px]"
                items={STATUSES.map((s) => ({
                  label: s.label,
                  onClick: () => setStatusFilter(s.value),
                }))}
              />
            </div>

            {/* More / sort menu */}
            <div className="relative">
              <button
                onClick={() => { setMoreOpen((v) => !v); setCommitteeOpen(false); setStatusOpen(false); }}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-slate-300 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </button>
              <DropdownMenu
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                position="right-0 top-full mt-1"
                minWidth="min-w-[180px]"
                items={[
                  { label: 'Sort A → Z', onClick: () => setSortBy('name') },
                  { label: 'Sort by Last Contacted', onClick: () => setSortBy('lastContacted') },
                  { label: 'Sort by Status', onClick: () => setSortBy('status') },
                  {
                    label: 'Clear All Filters',
                    dividerBefore: true,
                    onClick: () => {
                      setCommitteeFilter('All');
                      setStatusFilter('All');
                      setActiveCategoryTab(null);
                      setActiveType('All');
                      setSearchQuery('');
                      setSortBy('name');
                    },
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Category tab chips */}
        <div className="flex items-center gap-2 mb-4">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategoryTab === tab.tag;
            return (
              <button
                key={tab.tag}
                onClick={() =>
                  setActiveCategoryTab(isActive ? null : tab.tag)
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0d1f3c] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-[#c9a84c]' : 'bg-slate-300'
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            {filteredOrgs.length} org{filteredOrgs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Main workspace — org list + command panel */}
        <div className="flex flex-1 min-h-0 gap-4">
          {/* Org list */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0">
            {/* Inline search */}
            <div className="relative mb-3">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search organizations, committees…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white pl-8 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:border-[#0d1f3c]/30 focus:bg-white shadow-sm transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    org={org}
                    isSelected={org.id === selectedOrgId}
                    onClick={() => setSelectedOrgId(org.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2.5">
                    <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">No results</p>
                  <p className="mt-0.5 text-xs text-slate-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* View all link */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <Link
                href="/organizations"
                className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f] flex items-center gap-1"
              >
                View all organizations
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right command panel */}
          {selectedOrg ? (
            <div className="w-[320px] flex-shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <OrgCommandPanel org={selectedOrg} />
            </div>
          ) : (
            <div className="w-[320px] flex-shrink-0 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
              <p className="text-xs text-slate-400">Select an organization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
