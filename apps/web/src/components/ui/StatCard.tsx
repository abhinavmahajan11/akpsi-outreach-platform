import Link from 'next/link';
import type { DashboardStat, StatIconType } from '@/types';

const iconConfig: Record<
  StatIconType,
  { bg: string; iconColor: string; icon: React.ReactNode }
> = {
  organizations: {
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  pending: {
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  followups: {
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  partners: {
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

interface StatCardProps {
  stat: DashboardStat;
}

function CardContent({ stat }: StatCardProps) {
  const config = iconConfig[stat.iconType];
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${config.bg} ${config.iconColor} mb-3`}>
        {config.icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
        {stat.value}
      </p>
      <p className="mt-1.5 text-xs font-medium text-slate-600">
        {stat.label}
      </p>
      {stat.change && (
        <p
          className={`mt-2 text-[11px] font-medium ${
            stat.changeDirection === 'up'
              ? 'text-emerald-600'
              : stat.changeDirection === 'down'
              ? 'text-rose-600'
              : 'text-slate-400'
          }`}
        >
          {stat.changeDirection === 'up' && '↑ '}
          {stat.changeDirection === 'down' && '↓ '}
          {stat.change}
        </p>
      )}
    </div>
  );
}

export default function StatCard({ stat }: StatCardProps) {
  if (stat.href) {
    return (
      <Link href={stat.href} className="block">
        <CardContent stat={stat} />
      </Link>
    );
  }
  return <CardContent stat={stat} />;
}
