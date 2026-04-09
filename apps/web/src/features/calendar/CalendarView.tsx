'use client';

import { useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import type { CalendarEvent, EventType } from '@/types';
import MonthGrid from './MonthGrid';
import AgendaView from './AgendaView';
import EventModal from './EventModal';
import { toDateInput } from './calendarConfig';

type CalView = 'month' | 'agenda';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarView() {
  const { events, loading, overdueEvents } = useCalendar();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [view, setView] = useState<CalView>('month');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState<string | undefined>();
  const [newEventType, setNewEventType] = useState<EventType | undefined>();

  // ── Navigation ──────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleDayClick(date: Date) {
    setEditEvent(null);
    setNewEventDate(toDateInput(date));
    setNewEventType(undefined);
    setModalOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setEditEvent(event);
    setNewEventDate(undefined);
    setNewEventType(undefined);
    setModalOpen(true);
  }

  function handleNewEvent() {
    setEditEvent(null);
    setNewEventDate(toDateInput(now));
    setNewEventType(undefined);
    setModalOpen(true);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading calendar…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
        {/* Left: nav + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <h2 className="text-base font-bold text-slate-900 w-[168px] text-center">
            {MONTH_NAMES[month]} {year}
          </h2>

          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button
            onClick={goToday}
            className="ml-1 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>

          {/* Overdue badge */}
          {overdueEvents.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {overdueEvents.length} overdue
            </span>
          )}
        </div>

        {/* Right: view toggle + new event */}
        <div className="flex items-center gap-2">
          {/* Month / Agenda toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {(['month', 'agenda'] as CalView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'month' ? 'Month' : 'Agenda'}
              </button>
            ))}
          </div>

          <button
            onClick={handleNewEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0d1f3c] text-xs font-medium text-white hover:bg-[#1e3a5f] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Event
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className={`flex-1 min-h-0 ${view === 'agenda' ? 'overflow-y-auto px-6 py-4' : 'flex flex-col'}`}>
        {view === 'month' ? (
          <MonthGrid
            year={year}
            month={month}
            events={events}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        ) : (
          <AgendaView
            events={events}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Modal */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editEvent}
        defaultDate={newEventDate}
        defaultType={newEventType}
      />
    </div>
  );
}
