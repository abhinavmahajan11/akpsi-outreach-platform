import type { Organization, CalendarEvent, ActivityItem, Note } from '@/types';

export type TimelineKind = 'activity' | 'note' | 'calendar_event';

export type TimelineFilter = 'all' | 'activities' | 'notes' | 'events';

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  date: string;          // ISO string — used for sort + display
  title: string;
  body: string;
  authorName: string;

  // kind-specific extras (undefined when not applicable)
  activityType?: ActivityItem['type'];
  eventType?: CalendarEvent['eventType'];
  eventStatus?: CalendarEvent['status'];
  sourceId: string;      // original record id (same as id for activities/notes)
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function fromActivity(a: ActivityItem): TimelineItem {
  return {
    id: a.id,
    kind: 'activity',
    date: a.date,
    title: a.title,
    body: a.description,
    authorName: a.authorName,
    activityType: a.type,
    sourceId: a.id,
  };
}

function fromNote(n: Note): TimelineItem {
  return {
    id: n.id,
    kind: 'note',
    date: n.createdAt,
    title: 'Note',
    body: n.content,
    authorName: n.authorName,
    sourceId: n.id,
  };
}

function fromCalendarEvent(e: CalendarEvent): TimelineItem {
  return {
    id: e.id,
    kind: 'calendar_event',
    date: e.startAt,
    title: e.title,
    body: e.description,
    authorName: '',
    eventType: e.eventType,
    eventStatus: e.status,
    sourceId: e.id,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildOrgTimeline(
  org: Organization,
  calendarEvents: CalendarEvent[],
  filter: TimelineFilter = 'all',
  sortDir: 'newest' | 'oldest' = 'newest',
): TimelineItem[] {
  const items: TimelineItem[] = [];

  if (filter === 'all' || filter === 'activities') {
    for (const a of org.recentActivity) {
      items.push(fromActivity(a));
    }
  }

  if (filter === 'all' || filter === 'notes') {
    for (const n of org.notes) {
      items.push(fromNote(n));
    }
  }

  if (filter === 'all' || filter === 'events') {
    for (const e of calendarEvents) {
      items.push(fromCalendarEvent(e));
    }
  }

  items.sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return sortDir === 'newest' ? -diff : diff;
  });

  return items;
}
