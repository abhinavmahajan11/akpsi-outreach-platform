/**
 * Data access layer — calendar events.
 * All Supabase queries for calendar_events live here.
 */

import { supabase } from '@/lib/supabase';
import type { CalendarEvent, EventType, EventStatus } from '@/types';

// ─── DB row shape ─────────────────────────────────────────────────────────────

interface DbCalendarEvent {
  id: string;
  organization_id: string | null;
  organizations: { name: string } | null;
  title: string;
  description: string;
  event_type: string;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  location: string;
  meeting_link: string;
  assigned_to_user_id: string | null;
  created_by_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapEvent(row: DbCalendarEvent): CalendarEvent {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationName: row.organizations?.name ?? null,
    title: row.title,
    description: row.description,
    eventType: row.event_type as EventType,
    startAt: row.start_at,
    endAt: row.end_at,
    allDay: row.all_day,
    location: row.location,
    meetingLink: row.meeting_link,
    assignedToUserId: row.assigned_to_user_id,
    createdByUserId: row.created_by_user_id,
    status: row.status as EventStatus,
    createdAt: row.created_at,
  };
}

const EVENT_SELECT = '*, organizations(name)' as const;

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchAllEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(EVENT_SELECT)
    .order('start_at', { ascending: true });

  if (error) throw new Error(`fetchAllEvents: ${error.message}`);
  return (data as DbCalendarEvent[]).map(mapEvent);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function insertCalendarEvent(
  event: CalendarEvent,
): Promise<void> {
  const { error } = await supabase.from('calendar_events').insert({
    id: event.id,
    organization_id: event.organizationId,
    title: event.title,
    description: event.description,
    event_type: event.eventType,
    start_at: event.startAt,
    end_at: event.endAt,
    all_day: event.allDay,
    location: event.location,
    meeting_link: event.meetingLink,
    assigned_to_user_id: event.assignedToUserId,
    created_by_user_id: event.createdByUserId,
    status: event.status,
  });
  if (error) throw new Error(`insertCalendarEvent: ${error.message}`);
}

/** Partial update — pass only the fields that changed, already in snake_case. */
export async function patchCalendarEvent(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    event_type: string;
    start_at: string;
    end_at: string | null;
    all_day: boolean;
    location: string;
    meeting_link: string;
    status: string;
    organization_id: string | null;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`patchCalendarEvent: ${error.message}`);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`deleteCalendarEvent: ${error.message}`);
}
