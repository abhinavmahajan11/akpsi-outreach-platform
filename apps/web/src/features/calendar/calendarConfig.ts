import type { CalendarEvent, EventType } from '@/types';

// ─── Event type visual config ─────────────────────────────────────────────────

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  {
    label: string;
    dot: string;       // solid dot bg class
    chipBg: string;    // light bg for chips
    chipText: string;  // text color
    chipBorder: string; // left border
  }
> = {
  follow_up: {
    label: 'Follow-Up',
    dot: 'bg-orange-400',
    chipBg: 'bg-orange-50',
    chipText: 'text-orange-700',
    chipBorder: 'border-orange-400',
  },
  meeting: {
    label: 'Meeting',
    dot: 'bg-violet-400',
    chipBg: 'bg-violet-50',
    chipText: 'text-violet-700',
    chipBorder: 'border-violet-400',
  },
  recruiter_call: {
    label: 'Recruiter Call',
    dot: 'bg-blue-400',
    chipBg: 'bg-blue-50',
    chipText: 'text-blue-700',
    chipBorder: 'border-blue-400',
  },
  sponsor_checkin: {
    label: 'Sponsor Check-in',
    dot: 'bg-emerald-400',
    chipBg: 'bg-emerald-50',
    chipText: 'text-emerald-700',
    chipBorder: 'border-emerald-400',
  },
  workshop_planning: {
    label: 'Workshop Planning',
    dot: 'bg-amber-400',
    chipBg: 'bg-amber-50',
    chipText: 'text-amber-700',
    chipBorder: 'border-amber-400',
  },
  service_partner_meeting: {
    label: 'Service Partner',
    dot: 'bg-teal-400',
    chipBg: 'bg-teal-50',
    chipText: 'text-teal-700',
    chipBorder: 'border-teal-400',
  },
  deadline: {
    label: 'Deadline',
    dot: 'bg-rose-400',
    chipBg: 'bg-rose-50',
    chipText: 'text-rose-700',
    chipBorder: 'border-rose-400',
  },
  general_task: {
    label: 'Task',
    dot: 'bg-slate-400',
    chipBg: 'bg-slate-100',
    chipText: 'text-slate-600',
    chipBorder: 'border-slate-400',
  },
};

export const EVENT_TYPES: EventType[] = [
  'follow_up',
  'meeting',
  'recruiter_call',
  'sponsor_checkin',
  'workshop_planning',
  'service_partner_meeting',
  'deadline',
  'general_task',
];

// ─── Overdue helper ───────────────────────────────────────────────────────────

export function isOverdue(event: CalendarEvent): boolean {
  return event.status === 'scheduled' && new Date(event.startAt) < new Date();
}

// ─── Date / time formatting ───────────────────────────────────────────────────

/** Formats a date as "Apr 8" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Formats a date as "Apr 8, 2026" */
export function fmtDateFull(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Formats a time as "2:30 PM" */
export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** True if two Dates fall on the same calendar day (local time). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "YYYY-MM-DD" string for a Date in local time — matches <input type="date"> values. */
export function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** "HH:MM" string for a Date in local time — matches <input type="time"> values. */
export function toTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

/** Combine a date-input string + time-input string → ISO UTC string. */
export function localInputsToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

// ─── Month grid ───────────────────────────────────────────────────────────────

export interface GridDay {
  date: Date;
  isCurrentMonth: boolean;
}

/**
 * Returns exactly 42 GridDay objects (6 rows × 7 cols) for the given month.
 * Weeks start on Sunday.
 */
export function getMonthGrid(year: number, month: number): GridDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startPad = firstOfMonth.getDay(); // 0 = Sun
  const days: GridDay[] = [];

  // Padding days from previous month
  for (let i = startPad - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Padding days for next month to fill 42
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
  }

  return days;
}

// ─── Agenda grouping ──────────────────────────────────────────────────────────

export type AgendaGroup =
  | 'overdue'
  | 'today'
  | 'tomorrow'
  | 'this_week'
  | 'next_week'
  | 'later';

export interface AgendaSection {
  group: AgendaGroup;
  label: string;
  events: CalendarEvent[];
}

export function groupEventsForAgenda(events: CalendarEvent[]): AgendaSection[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const endOfThisWeek = new Date(today);
  endOfThisWeek.setDate(today.getDate() + 7);
  const endOfNextWeek = new Date(today);
  endOfNextWeek.setDate(today.getDate() + 14);

  const buckets: Record<AgendaGroup, CalendarEvent[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    this_week: [],
    next_week: [],
    later: [],
  };

  for (const evt of events) {
    if (evt.status === 'completed' || evt.status === 'cancelled') continue;
    const d = new Date(evt.startAt);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (isOverdue(evt)) {
      buckets.overdue.push(evt);
    } else if (isSameDay(dayStart, today)) {
      buckets.today.push(evt);
    } else if (isSameDay(dayStart, tomorrow)) {
      buckets.tomorrow.push(evt);
    } else if (dayStart < endOfThisWeek) {
      buckets.this_week.push(evt);
    } else if (dayStart < endOfNextWeek) {
      buckets.next_week.push(evt);
    } else {
      buckets.later.push(evt);
    }
  }

  const LABELS: Record<AgendaGroup, string> = {
    overdue: 'Overdue',
    today: 'Today',
    tomorrow: 'Tomorrow',
    this_week: 'This Week',
    next_week: 'Next Week',
    later: 'Later',
  };

  const order: AgendaGroup[] = ['overdue', 'today', 'tomorrow', 'this_week', 'next_week', 'later'];
  return order
    .filter((g) => buckets[g].length > 0)
    .map((g) => ({ group: g, label: LABELS[g], events: buckets[g] }));
}
