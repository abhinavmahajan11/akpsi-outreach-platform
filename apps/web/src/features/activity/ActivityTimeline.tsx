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
  /** If provided, a delete button appears on hover for each item. */
  onDelete?: (id: string) => void;
}

export default function ActivityTimeline({
  items,
  limit,
  onDelete,
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
          <div key={item.id} className="flex gap-3 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dotColor}`}
              />
              {!isLast && <div className="w-px flex-1 bg-slate-100 my-1" />}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0 flex-1 flex items-start gap-2">
              <div className="flex-1 min-w-0">
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

              {onDelete && (
                <button
                  onClick={() => onDelete(item.id)}
                  title="Delete this entry"
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
