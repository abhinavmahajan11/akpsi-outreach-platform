'use client';

/**
 * CalendarContext — single source of truth for calendar events.
 *
 * Mirrors the OrgsContext pattern:
 *   - Loads all visible events from Supabase on mount
 *   - Mutations write to Supabase then update local state optimistically
 *   - RLS on the DB enforces per-user access
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { CalendarEvent, EventType, EventStatus } from '@/types';
import {
  fetchAllEvents,
  insertCalendarEvent,
  patchCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/db/calendar';
import { useAuth } from '@/context/AuthContext';
import { isOverdue, isSameDay } from '@/features/calendar/calendarConfig';

// ─── Context shape ────────────────────────────────────────────────────────────

interface CalendarContextValue {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;

  /** Create a new event — id and createdByUserId are generated/injected here. */
  addEvent: (draft: Omit<CalendarEvent, 'id' | 'createdByUserId' | 'organizationName' | 'createdAt'>) => Promise<void>;

  /** Update any mutable fields on an event. */
  updateEvent: (id: string, updates: Partial<Pick<CalendarEvent,
    'title' | 'description' | 'eventType' | 'startAt' | 'endAt' | 'allDay' |
    'location' | 'meetingLink' | 'status' | 'organizationId'
  >>) => void;

  /** Delete an event immediately (optimistic). */
  deleteEvent: (id: string) => void;

  /** Shorthand: set status → 'completed'. */
  markComplete: (id: string) => void;

  /** Shorthand: set status → 'cancelled'. */
  cancelEvent: (id: string) => void;

  /** All scheduled events whose start_at < now (computed, never stored). */
  overdueEvents: CalendarEvent[];

  /** Scheduled events from today forward, sorted by start_at. */
  upcomingEvents: CalendarEvent[];

  /** Events linked to a specific org, sorted by start_at. */
  getEventsByOrg: (orgId: string) => CalendarEvent[];

  /** Events whose start_at falls on the given calendar date (local time). */
  getEventsByDate: (date: Date) => CalendarEvent[];

  refresh: () => void;
}

// ─── Context + hook ───────────────────────────────────────────────────────────

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendar(): CalendarContextValue {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used inside <CalendarProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchAllEvents()
      .then(setEvents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addEvent = useCallback(
    async (draft: Omit<CalendarEvent, 'id' | 'createdByUserId' | 'organizationName' | 'createdAt'>) => {
      if (!user) throw new Error('Not authenticated');
      const event: CalendarEvent = {
        ...draft,
        id: crypto.randomUUID(),
        createdByUserId: user.id,
        organizationName: null, // optimistic — org name resolved on next load
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, event].sort(
        (a, b) => a.startAt.localeCompare(b.startAt),
      ));
      try {
        await insertCalendarEvent(event);
        // Re-fetch to get the joined organizationName
        load();
      } catch (err) {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        throw err;
      }
    },
    [user, load],
  );

  const updateEvent = useCallback(
    (
      id: string,
      updates: Partial<Pick<CalendarEvent,
        'title' | 'description' | 'eventType' | 'startAt' | 'endAt' | 'allDay' |
        'location' | 'meetingLink' | 'status' | 'organizationId'
      >>,
    ) => {
      setEvents((prev) =>
        prev
          .map((e) => (e.id === id ? { ...e, ...updates } : e))
          .sort((a, b) => a.startAt.localeCompare(b.startAt)),
      );

      // Convert camelCase → snake_case for the DB patch
      const dbPatch: Parameters<typeof patchCalendarEvent>[1] = {};
      if (updates.title !== undefined)        dbPatch.title = updates.title;
      if (updates.description !== undefined)  dbPatch.description = updates.description;
      if (updates.eventType !== undefined)    dbPatch.event_type = updates.eventType;
      if (updates.startAt !== undefined)      dbPatch.start_at = updates.startAt;
      if (updates.endAt !== undefined)        dbPatch.end_at = updates.endAt;
      if (updates.allDay !== undefined)       dbPatch.all_day = updates.allDay;
      if (updates.location !== undefined)     dbPatch.location = updates.location;
      if (updates.meetingLink !== undefined)  dbPatch.meeting_link = updates.meetingLink;
      if (updates.status !== undefined)       dbPatch.status = updates.status;
      if (updates.organizationId !== undefined) dbPatch.organization_id = updates.organizationId;

      patchCalendarEvent(id, dbPatch).catch((err: Error) => {
        console.error('updateEvent DB write failed:', err.message);
        setError('Failed to update event — try refreshing.');
      });
    },
    [],
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    deleteCalendarEvent(id).catch((err: Error) => {
      console.error('deleteEvent DB write failed:', err.message);
      setError('Failed to delete event — try refreshing.');
    });
  }, []);

  const markComplete = useCallback(
    (id: string) => updateEvent(id, { status: 'completed' }),
    [updateEvent],
  );

  const cancelEvent = useCallback(
    (id: string) => updateEvent(id, { status: 'cancelled' }),
    [updateEvent],
  );

  // ── Computed collections ──────────────────────────────────────────────────

  const overdueEvents = useMemo(
    () => events.filter(isOverdue),
    [events],
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter(
      (e) => e.status === 'scheduled' && new Date(e.startAt) >= now,
    );
  }, [events]);

  const getEventsByOrg = useCallback(
    (orgId: string) =>
      events
        .filter((e) => e.organizationId === orgId)
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [events],
  );

  const getEventsByDate = useCallback(
    (date: Date) =>
      events.filter((e) => isSameDay(new Date(e.startAt), date)),
    [events],
  );

  return (
    <CalendarContext.Provider
      value={{
        events,
        loading,
        error,
        addEvent,
        updateEvent,
        deleteEvent,
        markComplete,
        cancelEvent,
        overdueEvents,
        upcomingEvents,
        getEventsByOrg,
        getEventsByDate,
        refresh: load,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}
