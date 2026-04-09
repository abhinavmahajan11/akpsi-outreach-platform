'use client';

import { useState } from 'react';
import { useCalendar } from '@/context/CalendarContext';
import type { CalendarEvent, EventType } from '@/types';
import SectionHeader from '@/components/ui/SectionHeader';
import EventModal from './EventModal';
import {
  EVENT_TYPE_CONFIG,
  isOverdue,
  fmtDate,
  fmtTime,
} from './calendarConfig';

interface OrgEventsSectionProps {
  orgId: string;
  orgName: string;
}

export default function OrgEventsSection({ orgId, orgName }: OrgEventsSectionProps) {
  const { getEventsByOrg, markComplete, cancelEvent, deleteEvent } = useCalendar();

  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [newType, setNewType] = useState<EventType | undefined>();
  const [showCompleted, setShowCompleted] = useState(false);

  const allOrgEvents = getEventsByOrg(orgId);
  const upcomingEvents = allOrgEvents.filter(
    (e) => e.status !== 'completed' && e.status !== 'cancelled',
  );
  const completedEvents = allOrgEvents.filter(
    (e) => e.status === 'completed' || e.status === 'cancelled',
  );

  function openNew(type?: EventType) {
    setEditEvent(null);
    setNewType(type);
    setModalOpen(true);
  }

  function openEdit(evt: CalendarEvent) {
    setEditEvent(evt);
    setNewType(undefined);
    setModalOpen(true);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-5 py-5">
      <SectionHeader
        title="Scheduled Events"
        subtitle={
          upcomingEvents.length > 0
            ? `${upcomingEvents.length} upcoming`
            : 'No upcoming events'
        }
        action={
          <button
            onClick={() => openNew('follow_up')}
            className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f] transition-colors"
          >
            Schedule
          </button>
        }
      />

      {/* Upcoming events */}
      {upcomingEvents.length > 0 ? (
        <div className="mt-3 space-y-2">
          {upcomingEvents.map((evt) => (
            <OrgEventRow
              key={evt.id}
              event={evt}
              onEdit={() => openEdit(evt)}
              onComplete={() => markComplete(evt.id)}
              onDelete={() => deleteEvent(evt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col items-center py-4 text-center">
          <p className="text-xs text-slate-400">No events scheduled</p>
          <div className="mt-2 flex gap-2">
            <QuickScheduleBtn label="Follow-Up" type="follow_up" onOpen={openNew} />
            <QuickScheduleBtn label="Meeting" type="meeting" onOpen={openNew} />
            <QuickScheduleBtn label="Call" type="recruiter_call" onOpen={openNew} />
          </div>
        </div>
      )}

      {/* Show/hide completed */}
      {completedEvents.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            {completedEvents.length} past / cancelled
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-1.5 opacity-60">
              {completedEvents.map((evt) => (
                <OrgEventRow
                  key={evt.id}
                  event={evt}
                  onEdit={() => openEdit(evt)}
                  onDelete={() => deleteEvent(evt.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={editEvent}
        defaultOrgId={orgId}
        defaultType={newType}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function OrgEventRow({
  event,
  onEdit,
  onComplete,
  onDelete,
}: {
  event: CalendarEvent;
  onEdit: () => void;
  onComplete?: () => void;
  onDelete: () => void;
}) {
  const cfg = EVENT_TYPE_CONFIG[event.eventType];
  const overdue = isOverdue(event);
  const isDone = event.status === 'completed' || event.status === 'cancelled';

  return (
    <div
      onClick={onEdit}
      className={[
        'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ring-1',
        overdue && !isDone
          ? 'bg-rose-50 ring-rose-100 hover:bg-rose-100/60'
          : 'bg-slate-50 ring-transparent hover:bg-slate-100/60',
      ].join(' ')}
    >
      <span
        className={[
          'w-2 h-2 rounded-full flex-shrink-0',
          isDone ? 'bg-slate-300' : overdue ? 'bg-rose-400' : cfg.dot,
        ].join(' ')}
      />
      <div className="flex-1 min-w-0">
        <p
          className={[
            'text-xs font-medium leading-snug truncate',
            isDone ? 'line-through text-slate-400' : 'text-slate-800',
          ].join(' ')}
        >
          {event.title}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {event.allDay ? fmtDate(event.startAt) : `${fmtDate(event.startAt)} · ${fmtTime(event.startAt)}`}
          {' · '}
          <span className={cfg.chipText}>{cfg.label}</span>
          {overdue && !isDone && <span className="text-rose-500"> · Overdue</span>}
        </p>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onComplete && !isDone && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            title="Mark complete"
            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function QuickScheduleBtn({
  label,
  type,
  onOpen,
}: {
  label: string;
  type: EventType;
  onOpen: (type: EventType) => void;
}) {
  const cfg = EVENT_TYPE_CONFIG[type];
  return (
    <button
      onClick={() => onOpen(type)}
      className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${cfg.chipBg} ${cfg.chipText} hover:opacity-80`}
    >
      {label}
    </button>
  );
}
