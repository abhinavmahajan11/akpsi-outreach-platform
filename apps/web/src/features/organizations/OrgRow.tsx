import Link from 'next/link';
import type { Organization } from '@/types';
import OrgLogo from '@/components/ui/OrgLogo';
import StatusBadge from '@/components/ui/StatusBadge';
import TagBadge from '@/components/ui/TagBadge';

export default function OrgRow({ org }: { org: Organization }) {
  return (
    <Link href={`/organizations/${org.id}`}>
      <div className="group flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all cursor-pointer">
        <OrgLogo
          name={org.name}
          logoInitials={org.logoInitials}
          logoColor={org.logoColor}
          website={org.website}
          size="md"
        />

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

        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {org.tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>

        <div className="hidden lg:block flex-shrink-0 text-xs text-slate-400 text-right min-w-[140px]">
          {org.committeeOwner}
          <br />
          <span className="text-slate-300">{org.assignedMember}</span>
        </div>

        <div className="flex-shrink-0">
          <StatusBadge status={org.status} />
        </div>

        <svg
          className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </Link>
  );
}
