'use client';

import type { CalendarEvent } from '@/types';
import { useCalendar } from '@/context/CalendarContext';
import {
  EVENT_TYPE_CONFIG,
  groupEventsForAgenda,
  isOverdue,
  fmtDate,
  fmtTime,
} from './calendarConfig';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onEventClick }: AgendaViewProps) {
  const { markComplete, cancelEvent } = useCalendar();
  const sections = groupEventsForAgenda(events);

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-6h.008v.008H12V12zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12v-.008zm-3-6h.008v.008H9V12zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9v-.008zm6-6h.008v.008h-.008V12zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No upcoming events</p>
        <p className="mt-1 text-xs text-slate-400">Click a date on the calendar or use the button above to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {sections.map((section) => (
        <div key={section.group}>
          {/* Section header */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className={[
                'text-xs font-bold uppercase tracking-wider',
                section.group === 'overdue'
                  ? 'text-rose-500'
                  : 'text-slate-400',
              ].join(' ')}
            >
              {section.label}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[11px] text-slate-300 font-medium">
              {section.events.length}
            </span>
          </div>

          {/* Event cards */}
          <div className="space-y-2">
            {section.events.map((evt) => (
              <AgendaEventCard
                key={evt.id}
                event={evt}
                onClick={() => onEventClick(evt)}
                onComplete={() => markComplete(evt.id)}
                onCancel={() => cancelEvent(evt.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Single agenda event card ─────────────────────────────────────────────────

interface AgendaEventCardProps {
  event: CalendarEvent;
  onClick: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

function AgendaEventCard({
  event,
  onClick,
  onComplete,
  onCancel,
}: AgendaEventCardProps) {
  const cfg = EVENT_TYPE_CONFIG[event.eventType];
  const overdue = isOverdue(event);

  return (
    <div
      className={[
        'group flex items-start gap-3 rounded-xl px-4 py-3.5 ring-1 transition-colors cursor-pointer',
        overdue
          ? 'bg-rose-50/60 ring-rose-100 hover:bg-rose-50'
          : 'bg-white ring-slate-100 hover:bg-slate-50/80',
      ].join(' ')}
      onClick={onClick}
    >
      {/* Color dot */}
      <div className="flex-shrink-0 mt-0.5">
        <span
          className={[
            'block w-2.5 h-2.5 rounded-full mt-1',
            overdue ? 'bg-rose-400' : cfg.dot,
          ].join(' ')}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={[
                'text-sm font-semibold leading-snug truncate',
                overdue ? 'text-rose-800' : 'text-slate-800',
              ].join(' ')}
            >
              {event.title}
            </p>
            <div className="mt-1 flex items-center flex-wrap gap-x-2 gap-y-0.5">
              {/* Date / time */}
              <span className="text-xs text-slate-500">
                {event.allDay ? fmtDate(event.startAt) : `${fmtDate(event.startAt)} · ${fmtTime(event.startAt)}`}
              </span>

              {/* Type badge */}
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}
              >
                {cfg.label}
              </span>

              {/* Org badge */}
              {event.organizationName && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full truncate max-w-[120px]">
                  {event.organizationName}
                </span>
              )}

              {/* Overdue badge */}
              {overdue && (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full">
                  Overdue
                </span>
              )}
            </div>

            {/* Location / meeting link */}
            {(event.location || event.meetingLink) && (
              <div className="mt-1.5 flex items-center gap-3">
                {event.location && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {event.location}
                  </span>
                )}
                {event.meetingLink && (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Join
                  </a>
                )}
              </div>
            )}

            {/* Description */}
            {event.description && (
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              title="Mark complete"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              title="Cancel event"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
