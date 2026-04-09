'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useCalendar } from '@/context/CalendarContext';
import { useOrgs } from '@/context/OrgsContext';
import type { CalendarEvent, EventType } from '@/types';
import {
  EVENT_TYPE_CONFIG,
  EVENT_TYPES,
  toDateInput,
  toTimeInput,
  localInputsToIso,
} from './calendarConfig';

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  /** If provided, opens in edit mode; otherwise create mode. */
  event?: CalendarEvent | null;
  /** Pre-select date (ISO or 'YYYY-MM-DD') for new events. */
  defaultDate?: string;
  /** Pre-select event type. */
  defaultType?: EventType;
  /** Pre-link to an org. */
  defaultOrgId?: string;
}

export default function EventModal({
  open,
  onClose,
  event,
  defaultDate,
  defaultType = 'follow_up',
  defaultOrgId,
}: EventModalProps) {
  const { addEvent, updateEvent, deleteEvent } = useCalendar();
  const { organizations } = useOrgs();

  const isEdit = !!event;

  // ── Form state ──────────────────────────────────────────────────────────────

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(defaultType);
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [hasEndTime, setHasEndTime] = useState(false);
  const [orgId, setOrgId] = useState<string>('');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled');
  const [saving, setSaving] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (!open) return;

    if (event) {
      // Edit mode — populate from event
      const s = new Date(event.startAt);
      setTitle(event.title);
      setType(event.eventType);
      setAllDay(event.allDay);
      setStartDate(toDateInput(s));
      setStartTime(toTimeInput(s));
      setOrgId(event.organizationId ?? '');
      setLocation(event.location);
      setMeetingLink(event.meetingLink);
      setDescription(event.description);
      setStatus(event.status);
      if (event.endAt) {
        const e = new Date(event.endAt);
        setEndDate(toDateInput(e));
        setEndTime(toTimeInput(e));
        setHasEndTime(true);
      } else {
        setHasEndTime(false);
        setEndDate('');
        setEndTime('10:00');
      }
    } else {
      // Create mode — apply defaults
      const base = defaultDate ? new Date(defaultDate) : new Date();
      setTitle('');
      setType(defaultType);
      setAllDay(false);
      setStartDate(toDateInput(base));
      setStartTime('09:00');
      setEndDate(toDateInput(base));
      setEndTime('10:00');
      setHasEndTime(false);
      setOrgId(defaultOrgId ?? '');
      setLocation('');
      setMeetingLink('');
      setDescription('');
      setStatus('scheduled');
    }
    setSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim() || !startDate) return;
    setSaving(true);
    try {
      const startAt = allDay
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : localInputsToIso(startDate, startTime);
      const endAt =
        hasEndTime && endDate
          ? allDay
            ? new Date(`${endDate}T23:59:59`).toISOString()
            : localInputsToIso(endDate, endTime)
          : null;

      if (isEdit && event) {
        updateEvent(event.id, {
          title: title.trim(),
          eventType: type,
          startAt,
          endAt,
          allDay,
          organizationId: orgId || null,
          location: location.trim(),
          meetingLink: meetingLink.trim(),
          description: description.trim(),
          status,
        });
        onClose();
      } else {
        await addEvent({
          organizationId: orgId || null,
          title: title.trim(),
          description: description.trim(),
          eventType: type,
          startAt,
          endAt,
          allDay,
          location: location.trim(),
          meetingLink: meetingLink.trim(),
          assignedToUserId: null,
          status: 'scheduled',
        });
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!event) return;
    deleteEvent(event.id);
    onClose();
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Event' : 'New Event'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
          />
        </div>

        {/* Event type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EVENT_TYPES.map((t) => {
              const cfg = EVENT_TYPE_CONFIG[t];
              const selected = type === t;
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? `${cfg.chipBg} ${cfg.chipText} ring-1 ring-inset ring-current/20`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date + time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Date & Time
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-slate-300"
              />
              All day
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
            />
            {!allDay && (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-[108px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
              />
            )}
          </div>

          {/* End time toggle */}
          {!hasEndTime ? (
            <button
              onClick={() => setHasEndTime(true)}
              className="mt-1.5 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              + Add end time
            </button>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={endDate || startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
              />
              {!allDay && (
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-[108px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
                />
              )}
              <button
                onClick={() => { setHasEndTime(false); setEndDate(''); }}
                className="text-slate-300 hover:text-rose-500 transition-colors"
                title="Remove end time"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Organization */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Organization <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <select
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
          >
            <option value="">— None —</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location + Meeting link */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, building, city…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Meeting Link
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any context or preparation needed…"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 resize-none"
          />
        </div>

        {/* Status — edit mode only */}
        {isEdit && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex gap-2">
              {(['scheduled', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    status === s
                      ? s === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : s === 'cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-[#0d1f3c] text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
        {isEdit ? (
          <button
            onClick={handleDelete}
            className="text-xs font-medium text-rose-400 hover:text-rose-600 transition-colors"
          >
            Delete event
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !startDate || saving}
            className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
