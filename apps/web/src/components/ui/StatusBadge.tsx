import type { OutreachStatus } from '@/types';

const statusConfig: Record<
  OutreachStatus,
  { label: string; className: string }
> = {
  active_partner: {
    label: 'Active Partner',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  pending_response: {
    label: 'Pending Response',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  no_contact: {
    label: 'No Contact',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  declined: {
    label: 'Declined',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
};

interface StatusBadgeProps {
  status: OutreachStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${sizeClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
