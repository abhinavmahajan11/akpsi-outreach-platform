import Link from 'next/link';
import type { Organization } from '@/types';
import OrgLogo from '@/components/ui/OrgLogo';

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface OrganizationCardProps {
  org: Organization;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function OrganizationCard({
  org,
  isSelected = false,
  onClick,
}: OrganizationCardProps) {
  const status = statusStyles[org.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl transition-all ${
        isSelected
          ? 'bg-[#0d1f3c] shadow-lg ring-2 ring-[#0d1f3c]'
          : 'bg-white shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="px-4 pt-3.5 pb-3">
        {/* Row 1: Logo + Name + Timestamp */}
        <div className="flex items-start gap-3">
          {/* Logo */}
          <OrgLogo
            name={org.name}
            logoInitials={org.logoInitials}
            logoColor={org.logoColor}
            website={org.website}
            size="md"
          />

          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Name navigates to detail page — stops propagation so onClick (panel select) still fires */}
                <Link
                  href={`/organizations/${org.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-[13px] font-semibold truncate hover:underline underline-offset-2 ${
                    isSelected ? 'text-white' : 'text-slate-900 hover:text-[#0d1f3c]'
                  }`}
                >
                  {org.name}
                </Link>
                {/* Verified dot */}
                <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              {/* Timestamp */}
              {org.lastContactedAt && (
                <span
                  className={`text-[10px] flex-shrink-0 ${
                    isSelected ? 'text-white/40' : 'text-slate-400'
                  }`}
                >
                  {timeAgo(org.lastContactedAt)}
                </span>
              )}
            </div>

            {/* Subtitle */}
            <p
              className={`mt-0.5 text-[11px] ${
                isSelected ? 'text-white/50' : 'text-slate-400'
              }`}
            >
              {org.industry} · {org.location}
            </p>
          </div>
        </div>

        {/* Row 2: Tags + Status */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {org.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
                  isSelected
                    ? 'bg-white/10 text-white/60'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white/40' : 'bg-slate-400'
                  }`}
                />
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>

          {/* Status badge */}
          <span
            className={`flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
              isSelected
                ? 'bg-white/10 text-white/80 border border-white/20'
                : status.className
            }`}
          >
            {status.label}
          </span>
        </div>
      </div>
    </button>
  );
}
