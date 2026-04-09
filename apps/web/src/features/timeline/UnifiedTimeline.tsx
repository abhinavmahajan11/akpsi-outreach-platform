'use client';

import { useState, useMemo } from 'react';
import type { Organization, CalendarEvent } from '@/types';
import { buildOrgTimeline, type TimelineFilter, type TimelineItem } from './timelineUtils';
import { EVENT_TYPE_CONFIG, fmtDateFull, fmtTime } from '@/features/calendar/calendarConfig';
import AddNoteModal from '@/features/notes/AddNoteModal';

// ─── Activity type visual config ──────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; dot: string; badgeBg: string; badgeText: string }
> = {
  email:         { label: 'Email',       dot: 'bg-blue-400',    badgeBg: 'bg-blue-50',    badgeText: 'text-blue-700' },
  call:          { label: 'Call',        dot: 'bg-emerald-400', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
  meeting:       { label: 'Meeting',     dot: 'bg-violet-400',  badgeBg: 'bg-violet-50',  badgeText: 'text-violet-700' },
  note:          { label: 'Note',        dot: 'bg-amber-400',   badgeBg: 'bg-amber-50',   badgeText: 'text-amber-700' },
  status_change: { label: 'Status',      dot: 'bg-slate-400',   badgeBg: 'bg-slate-100',  badgeText: 'text-slate-600' },
  follow_up:     { label: 'Follow-Up',   dot: 'bg-rose-400',    badgeBg: 'bg-rose-50',    badgeText: 'text-rose-700' },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS: { value: TimelineFilter; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'activities', label: 'Activities' },
  { value: 'notes',      label: 'Notes' },
  { value: 'events',     label: 'Events' },
];

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    email: '✉', call: '↗', meeting: '◎', note: '✎', status_change: '⇄', follow_up: '↩',
  };
  return <span className="text-[11px]">{icons[type] ?? '·'}</span>;
}

function NoteIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

// ─── Single item row ──────────────────────────────────────────────────────────

function TimelineRow({
  item,
  isLast,
  onDeleteActivity,
  onDeleteNote,
}: {
  item: TimelineItem;
  isLast: boolean;
  onDeleteActivity?: (id: string) => void;
  onDeleteNote?: (id: string) => void;
}) {
  const canDelete =
    (item.kind === 'activity' && !!onDeleteActivity) ||
    (item.kind === 'note' && !!onDeleteNote);

  function handleDelete() {
    if (item.kind === 'activity') onDeleteActivity?.(item.sourceId);
    if (item.kind === 'note') onDeleteNote?.(item.sourceId);
  }

  // ── Dot styling ──
  let dotClass = 'bg-slate-300';
  let dotContent: React.ReactNode = null;

  if (item.kind === 'activity' && item.activityType) {
    dotClass = ACTIVITY_CONFIG[item.activityType]?.dot ?? 'bg-slate-300';
    dotContent = <ActivityIcon type={item.activityType} />;
  } else if (item.kind === 'note') {
    dotClass = 'bg-amber-400';
    dotContent = <NoteIcon />;
  } else if (item.kind === 'calendar_event' && item.eventType) {
    dotClass = EVENT_TYPE_CONFIG[item.eventType]?.dot ?? 'bg-slate-300';
    dotContent = <CalIcon />;
  }

  // ── Badge ──
  let badge: React.ReactNode = null;

  if (item.kind === 'activity' && item.activityType) {
    const cfg = ACTIVITY_CONFIG[item.activityType];
    badge = (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}>
        {cfg.label}
      </span>
    );
  } else if (item.kind === 'note') {
    badge = (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
        Note
      </span>
    );
  } else if (item.kind === 'calendar_event' && item.eventType) {
    const cfg = EVENT_TYPE_CONFIG[item.eventType];
    badge = (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.chipBg} ${cfg.chipText}`}>
        {cfg.label}
      </span>
    );
  }

  // ── Event status badge ──
  let statusBadge: React.ReactNode = null;
  if (item.kind === 'calendar_event') {
    if (item.eventStatus === 'completed') {
      statusBadge = (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
          Completed
        </span>
      );
    } else if (item.eventStatus === 'cancelled') {
      statusBadge = (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
          Cancelled
        </span>
      );
    }
  }

  const dateStr = item.kind === 'calendar_event'
    ? `${fmtDateFull(item.date)} · ${fmtTime(item.date)}`
    : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const meta = item.authorName ? `${item.authorName} · ${dateStr}` : dateStr;

  return (
    <div className="flex gap-3 group">
      {/* Dot + vertical line */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white ${dotClass}`}
        >
          {dotContent}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-100 my-1 min-h-[12px]" />}
      </div>

      {/* Content */}
      <div className={`pb-4 min-w-0 flex-1 flex items-start gap-2 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {item.title}
            </span>
            {badge}
            {statusBadge}
          </div>
          {item.body && (
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
              {item.body}
            </p>
          )}
          <p className="mt-1 text-[10px] text-slate-400">{meta}</p>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            title="Delete"
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface UnifiedTimelineProps {
  org: Organization;
  calendarEvents: CalendarEvent[];
  onAddNote: (content: string) => void;
  onDeleteActivity: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function UnifiedTimeline({
  org,
  calendarEvents,
  onAddNote,
  onDeleteActivity,
  onDeleteNote,
}: UnifiedTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [sortDir, setSortDir] = useState<'newest' | 'oldest'>('newest');
  const [noteOpen, setNoteOpen] = useState(false);

  const items = useMemo(
    () => buildOrgTimeline(org, calendarEvents, filter, sortDir),
    [org, calendarEvents, filter, sortDir],
  );

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 ring-1 ring-slate-100">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-white text-[#0d1f3c] shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortDir(sortDir === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 ring-1 ring-slate-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            {sortDir === 'newest' ? 'Newest first' : 'Oldest first'}
          </button>

          <button
            onClick={() => setNoteOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#0d1f3c] bg-[#0d1f3c]/5 hover:bg-[#0d1f3c]/10 ring-1 ring-[#0d1f3c]/10 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add note
          </button>
        </div>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center mx-auto mb-2.5">
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No entries yet.</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-1.5 text-xs text-[#0d1f3c]/60 hover:text-[#0d1f3c] transition-colors"
            >
              Show all
            </button>
          )}
        </div>
      ) : (
        <div>
          {items.map((item, i) => (
            <TimelineRow
              key={`${item.kind}-${item.id}`}
              item={item}
              isLast={i === items.length - 1}
              onDeleteActivity={onDeleteActivity}
              onDeleteNote={onDeleteNote}
            />
          ))}
        </div>
      )}

      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSave={(content) => {
          onAddNote(content);
          setNoteOpen(false);
        }}
        orgName={org.name}
      />
    </div>
  );
}
