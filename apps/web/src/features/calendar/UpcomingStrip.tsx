'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import type { CalendarEvent } from '@/types';
import { EVENT_TYPE_CONFIG, isOverdue, fmtDate, fmtTime } from './calendarConfig';
import EventModal from './EventModal';

export default function UpcomingStrip() {
  const { upcomingEvents, overdueEvents } = useCalendar();
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Show overdue first (up to 2), then upcoming (up to 3), total max 5
  const overdueSlice = overdueEvents.slice(0, 2);
  const upcomingSlice = upcomingEvents.slice(0, 5 - overdueSlice.length);
  const displayed = [...overdueSlice, ...upcomingSlice];

  if (displayed.length === 0) return null;

  function openEvent(evt: CalendarEvent) {
    setEditEvent(evt);
    setModalOpen(true);
  }

  return (
    <>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming
          </span>
          <Link
            href="/calendar"
            className="text-[11px] font-medium text-[#0d1f3c] hover:text-[#1e3a5f] transition-colors flex items-center gap-1"
          >
            View calendar
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {displayed.map((evt) => (
            <UpcomingChip key={evt.id} event={evt} onClick={() => openEvent(evt)} />
          ))}
        </div>
      </div>

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editEvent}
      />
    </>
  );
}

function UpcomingChip({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const cfg = EVENT_TYPE_CONFIG[event.eventType];
  const overdue = isOverdue(event);

  return (
    <button
      onClick={onClick}
      className={[
        'flex-shrink-0 flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-left transition-colors ring-1',
        'min-w-[180px] max-w-[220px]',
        overdue
          ? 'bg-rose-50 ring-rose-100 hover:bg-rose-100/60'
          : 'bg-white ring-slate-100 hover:bg-slate-50',
      ].join(' ')}
    >
      <span
        className={[
          'mt-0.5 w-2 h-2 rounded-full flex-shrink-0',
          overdue ? 'bg-rose-400' : cfg.dot,
        ].join(' ')}
      />
      <div className="min-w-0">
        <p
          className={[
            'text-xs font-semibold leading-snug truncate',
            overdue ? 'text-rose-800' : 'text-slate-800',
          ].join(' ')}
        >
          {event.title}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-400 leading-snug">
          {event.allDay ? fmtDate(event.startAt) : `${fmtDate(event.startAt)} · ${fmtTime(event.startAt)}`}
        </p>
        {event.organizationName && (
          <p className="mt-0.5 text-[10px] text-slate-400 truncate">{event.organizationName}</p>
        )}
        {overdue && (
          <span className="inline-block mt-1 text-[9px] font-semibold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Overdue
          </span>
        )}
      </div>
    </button>
  );
}
