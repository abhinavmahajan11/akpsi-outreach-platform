import type { ActivityItem } from '@/types';

const activityTypeConfig: Record<
  ActivityItem['type'],
  { label: string; dotColor: string; icon: string }
> = {
  email: { label: 'Email', dotColor: 'bg-blue-400', icon: '✉' },
  call: { label: 'Call', dotColor: 'bg-emerald-400', icon: '↗' },
  meeting: { label: 'Meeting', dotColor: 'bg-violet-400', icon: '◎' },
  note: { label: 'Note', dotColor: 'bg-amber-400', icon: '✎' },
  status_change: { label: 'Status', dotColor: 'bg-slate-400', icon: '⇄' },
  follow_up: { label: 'Follow-up', dotColor: 'bg-rose-400', icon: '↩' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  limit?: number;
}

export default function ActivityTimeline({
  items,
  limit,
}: ActivityTimelineProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (displayItems.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {displayItems.map((item, index) => {
        const config = activityTypeConfig[item.type];
        const isLast = index === displayItems.length - 1;

        return (
          <div key={item.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dotColor}`}
              />
              {!isLast && <div className="w-px flex-1 bg-slate-100 my-1" />}
            </div>

            {/* Content */}
            <div className={`pb-4 min-w-0 ${isLast ? '' : ''}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-700">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-50 rounded px-1.5 py-0.5">
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                {item.description}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {item.authorName} · {formatDate(item.date)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
