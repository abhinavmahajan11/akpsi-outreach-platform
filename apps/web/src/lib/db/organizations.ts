/**
 * Data access layer — organizations and all nested data.
 *
 * All raw Supabase queries live here. Components import these functions
 * instead of calling `supabase` directly, which makes Phase 4 (auth,
 * server-side fetching, caching) easier to layer in.
 *
 * Naming convention:
 *   DB columns  → snake_case  (e.g. committee_owner)
 *   TypeScript  → camelCase   (e.g. committeeOwner)
 */

import { supabase } from '@/lib/supabase';
import type {
  Organization,
  Contact,
  Note,
  Reminder,
  ActivityItem,
  OrganizationType,
  CommitteeType,
  OutreachStatus,
} from '@/types';

// ─── DB row shapes (what Supabase returns) ────────────────────────────────────

interface DbContact {
  id: string;
  organization_id: string;
  name: string;
  title: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  is_primary: boolean;
  created_at: string;
}

interface DbNote {
  id: string;
  organization_id: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface DbReminder {
  id: string;
  organization_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  assigned_to: string;
  created_at: string;
}

interface DbActivity {
  id: string;
  organization_id: string;
  type: string;
  title: string;
  description: string;
  activity_date: string;
  author_name: string;
  created_at: string;
}

interface DbOrganization {
  id: string;
  name: string;
  logo_initials: string;
  logo_color: string;
  type: string;
  industry: string;
  location: string;
  status: string;
  tags: string[];
  committee_owner: string;
  assigned_member: string;
  description: string;
  website: string | null;
  next_step: string;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
  contacts: DbContact[];
  notes: DbNote[];
  reminders: DbReminder[];
  activities: DbActivity[];
}

// ─── Mappers: DB row → TypeScript type ───────────────────────────────────────

function mapContact(row: DbContact): Contact {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    email: row.email,
    phone: row.phone ?? undefined,
    linkedIn: row.linkedin_url ?? undefined,
    isPrimary: row.is_primary,
  };
}

function mapNote(row: DbNote): Note {
  return {
    id: row.id,
    content: row.content,
    authorName: row.author_name,
    createdAt: row.created_at,
  };
}

function mapReminder(row: DbReminder): Reminder {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    assignedTo: row.assigned_to,
  };
}

function mapActivity(row: DbActivity): ActivityItem {
  return {
    id: row.id,
    type: row.type as ActivityItem['type'],
    title: row.title,
    description: row.description,
    date: row.activity_date,
    authorName: row.author_name,
  };
}

function mapOrg(row: DbOrganization): Organization {
  // Sort nested arrays by date descending
  const notes = [...(row.notes ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(mapNote);

  const activities = [...(row.activities ?? [])]
    .sort((a, b) => b.activity_date.localeCompare(a.activity_date))
    .map(mapActivity);

  const reminders = (row.reminders ?? []).map(mapReminder);
  const contacts = (row.contacts ?? []).map(mapContact);

  return {
    id: row.id,
    name: row.name,
    logoInitials: row.logo_initials,
    logoColor: row.logo_color,
    type: row.type as OrganizationType,
    industry: row.industry,
    location: row.location,
    status: row.status as OutreachStatus,
    tags: row.tags ?? [],
    committeeOwner: row.committee_owner as CommitteeType,
    assignedMember: row.assigned_member,
    description: row.description,
    website: row.website ?? undefined,
    nextStep: row.next_step,
    lastContactedAt: row.last_contacted_at ?? undefined,
    contacts,
    notes,
    reminders,
    recentActivity: activities,
  };
}

// ─── The SELECT fragment shared by all org queries ────────────────────────────

const ORG_SELECT = `
  *,
  contacts(*),
  notes(*),
  reminders(*),
  activities(*)
` as const;

// ─── Read operations ──────────────────────────────────────────────────────────

/** Fetch all organizations with nested contacts, notes, reminders, activities. */
export async function fetchAllOrgs(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select(ORG_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`fetchAllOrgs: ${error.message}`);
  return (data as DbOrganization[]).map(mapOrg);
}

/** Fetch a single organization by id. Returns null if not found. */
export async function fetchOrgById(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select(ORG_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116 = "no rows returned" — not a real error
    if (error.code === 'PGRST116') return null;
    throw new Error(`fetchOrgById: ${error.message}`);
  }
  return mapOrg(data as DbOrganization);
}

// ─── Write operations ─────────────────────────────────────────────────────────

/** Insert a new organization (with optional primary contact and first activity). */
export async function insertOrg(
  org: Organization,
  createdByUserId?: string,
): Promise<void> {
  // 1. Insert the org row
  const { error: orgError } = await supabase.from('organizations').insert({
    id: org.id,
    name: org.name,
    logo_initials: org.logoInitials,
    logo_color: org.logoColor,
    type: org.type,
    industry: org.industry,
    location: org.location,
    status: org.status,
    tags: org.tags,
    committee_owner: org.committeeOwner,
    assigned_member: org.assignedMember,
    description: org.description,
    website: org.website ?? null,
    next_step: org.nextStep,
    last_contacted_at: org.lastContactedAt ?? null,
    ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
  });

  if (orgError) throw new Error(`insertOrg: ${orgError.message}`);

  // 2. Insert primary contact if provided
  if (org.contacts.length > 0) {
    const contactRows = org.contacts.map((c) => ({
      id: c.id,
      organization_id: org.id,
      name: c.name,
      title: c.title,
      email: c.email,
      phone: c.phone ?? null,
      linkedin_url: c.linkedIn ?? null,
      is_primary: c.isPrimary,
    }));
    const { error: contactError } = await supabase
      .from('contacts')
      .insert(contactRows);
    if (contactError) throw new Error(`insertOrg contacts: ${contactError.message}`);
  }

  // 3. Insert the initial "added to platform" activity
  if (org.recentActivity.length > 0) {
    const actRows = org.recentActivity.map((a) => ({
      id: a.id,
      organization_id: org.id,
      type: a.type,
      title: a.title,
      description: a.description,
      activity_date: a.date,
      author_name: a.authorName,
      ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
    }));
    const { error: actError } = await supabase
      .from('activities')
      .insert(actRows);
    if (actError) throw new Error(`insertOrg activities: ${actError.message}`);
  }
}

/** Insert a note for an organization. */
export async function insertNote(
  orgId: string,
  note: Note,
  createdByUserId?: string,
): Promise<void> {
  const { error } = await supabase.from('notes').insert({
    id: note.id,
    organization_id: orgId,
    content: note.content,
    author_name: note.authorName,
    created_at: note.createdAt,
    ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
  });
  if (error) throw new Error(`insertNote: ${error.message}`);
}

/** Insert a reminder for an organization. */
export async function insertReminder(
  orgId: string,
  reminder: Reminder,
  createdByUserId?: string,
): Promise<void> {
  const { error } = await supabase.from('reminders').insert({
    id: reminder.id,
    organization_id: orgId,
    title: reminder.title,
    due_date: reminder.dueDate,
    is_completed: reminder.isCompleted,
    assigned_to: reminder.assignedTo,
    ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
  });
  if (error) throw new Error(`insertReminder: ${error.message}`);
}

/** Insert an activity log entry for an organization. */
export async function insertActivity(
  orgId: string,
  item: ActivityItem,
  createdByUserId?: string,
): Promise<void> {
  const { error } = await supabase.from('activities').insert({
    id: item.id,
    organization_id: orgId,
    type: item.type,
    title: item.title,
    description: item.description,
    activity_date: item.date,
    author_name: item.authorName,
    ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
  });
  if (error) throw new Error(`insertActivity: ${error.message}`);
}

/** Mark a reminder as completed. */
export async function completeReminder(reminderId: string): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .update({ is_completed: true })
    .eq('id', reminderId);
  if (error) throw new Error(`completeReminder: ${error.message}`);
}

/** Update top-level org fields (e.g. status, nextStep, lastContactedAt). */
export async function updateOrgFields(
  orgId: string,
  updates: {
    status?: string;
    next_step?: string;
    last_contacted_at?: string | null;
    assigned_member?: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orgId);
  if (error) throw new Error(`updateOrgFields: ${error.message}`);
}
