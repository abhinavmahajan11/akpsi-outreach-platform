'use client';

/**
 * OrgsContext — single source of truth for all organization data.
 *
 * Phase 3: reads from Supabase on mount; mutations write to Supabase
 * then update local state optimistically.
 *
 * Phase 4 upgrade path: wrap fetch calls in React Query / SWR for
 * caching and background revalidation. The hook API stays identical.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Organization, Note, Reminder, ActivityItem, OutreachStatus, Contact } from '@/types';
import {
  fetchAllOrgs,
  insertOrg,
  insertNote,
  insertReminder,
  insertActivity,
  insertContact as insertContactDB,
  deleteContact as deleteContactDB,
  updateOrgFields,
  deleteActivity as deleteActivityDB,
  deleteNote as deleteNoteDB,
  deleteReminder as deleteReminderDB,
} from '@/lib/db/organizations';
import { useAuth } from '@/context/AuthContext';

// ─── Context value shape ──────────────────────────────────────────────────────

interface OrgsContextValue {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  /** Look up a single org by id (from local state — instant, no extra fetch). */
  getOrgById: (id: string) => Organization | undefined;
  /** Add a new org — writes to DB then prepends to local list. Async so forms can await it. */
  addOrg: (org: Organization) => Promise<void>;
  /** Shallow-merge field updates into an org in local state only (DB update via updateOrgFields). */
  updateOrg: (orgId: string, updates: Partial<Organization>) => void;
  /** Prepend a note — writes to DB then updates local state. */
  addNote: (orgId: string, note: Note) => void;
  /** Append a reminder — writes to DB then updates local state. */
  addReminder: (orgId: string, reminder: Reminder) => void;
  /** Prepend an activity and update lastContactedAt — writes to DB then updates local state. */
  logActivity: (orgId: string, item: ActivityItem) => void;
  /** Update org status both locally and in the DB. */
  changeOrgStatus: (orgId: string, status: OutreachStatus) => void;
  /** Remove an activity entry locally and from the DB. */
  deleteActivity: (orgId: string, activityId: string) => void;
  /** Remove a note locally and from the DB. */
  deleteNote: (orgId: string, noteId: string) => void;
  /** Remove a reminder locally and from the DB. */
  deleteReminder: (orgId: string, reminderId: string) => void;
  /** Add a contact to an org — writes to DB then updates local state. If isPrimary, demotes existing primaries. */
  addContact: (orgId: string, contact: Contact) => void;
  /** Remove a contact locally and from the DB. */
  deleteContact: (orgId: string, contactId: string) => void;
  /** Manually re-fetch all orgs from Supabase (e.g. after an external mutation). */
  refresh: () => void;
}

// ─── Context + hook ───────────────────────────────────────────────────────────

const OrgsContext = createContext<OrgsContextValue | null>(null);

export function useOrgs(): OrgsContextValue {
  const ctx = useContext(OrgsContext);
  if (!ctx) throw new Error('useOrgs must be used inside <OrgsProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrgsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchAllOrgs()
      .then(setOrgs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived helpers ───────────────────────────────────────────────────────

  const getOrgById = useCallback(
    (id: string) => orgs.find((o) => o.id === id),
    [orgs],
  );

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addOrg = useCallback(async (org: Organization) => {
    // Optimistic: add to local state immediately so the UI responds fast
    setOrgs((prev) => [org, ...prev]);
    try {
      await insertOrg(org, user?.id);
    } catch (err) {
      // Revert on failure and surface the error
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
      const msg = err instanceof Error ? err.message : 'Failed to save organization';
      setError(msg);
      throw err; // let the form catch it
    }
  }, [user]);

  const updateOrg = useCallback(
    (orgId: string, updates: Partial<Organization>) => {
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, ...updates } : o)),
      );
    },
    [],
  );

  const addNote = useCallback((orgId: string, note: Note) => {
    // Optimistic update
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId ? { ...o, notes: [note, ...o.notes] } : o,
      ),
    );
    // Async DB write (fire-and-forget; error logged to console)
    insertNote(orgId, note, user?.id).catch((err: Error) =>
      console.error('addNote DB write failed:', err.message),
    );
  }, [user]);

  const addReminder = useCallback((orgId: string, reminder: Reminder) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, reminders: [...o.reminders, reminder] }
          : o,
      ),
    );
    insertReminder(orgId, reminder, user?.id).catch((err: Error) =>
      console.error('addReminder DB write failed:', err.message),
    );
  }, [user]);

  const logActivity = useCallback((orgId: string, item: ActivityItem) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
              ...o,
              recentActivity: [item, ...o.recentActivity],
              lastContactedAt: item.date,
            }
          : o,
      ),
    );
    insertActivity(orgId, item, user?.id).catch((err: Error) =>
      console.error('logActivity DB write failed:', err.message),
    );
    // Also persist last_contacted_at to the organizations row
    updateOrgFields(orgId, { last_contacted_at: item.date }).catch((err: Error) =>
      console.error('logActivity last_contacted_at update failed:', err.message),
    );
  }, [user]);

  const changeOrgStatus = useCallback((orgId: string, status: OutreachStatus) => {
    setOrgs((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, status } : o)),
    );
    updateOrgFields(orgId, { status }).catch((err: Error) =>
      console.error('changeOrgStatus DB write failed:', err.message),
    );
  }, []);

  const deleteActivity = useCallback((orgId: string, activityId: string) => {
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        const remaining = o.recentActivity.filter((a) => a.id !== activityId);
        // Recompute lastContactedAt from the next most-recent activity
        const newLastContacted = remaining.length > 0 ? remaining[0].date : undefined;
        return { ...o, recentActivity: remaining, lastContactedAt: newLastContacted };
      }),
    );
    deleteActivityDB(activityId).catch((err: Error) =>
      console.error('deleteActivity DB write failed:', err.message),
    );
  }, []);

  const deleteNote = useCallback((orgId: string, noteId: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, notes: o.notes.filter((n) => n.id !== noteId) }
          : o,
      ),
    );
    deleteNoteDB(noteId).catch((err: Error) =>
      console.error('deleteNote DB write failed:', err.message),
    );
  }, []);

  const deleteReminder = useCallback((orgId: string, reminderId: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, reminders: o.reminders.filter((r) => r.id !== reminderId) }
          : o,
      ),
    );
    deleteReminderDB(reminderId).catch((err: Error) =>
      console.error('deleteReminder DB write failed:', err.message),
    );
  }, []);

  const addContact = useCallback((orgId: string, contact: Contact) => {
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        // If new contact is primary, demote existing primaries
        const updatedExisting = contact.isPrimary
          ? o.contacts.map((c) => ({ ...c, isPrimary: false }))
          : o.contacts;
        return { ...o, contacts: [...updatedExisting, contact] };
      }),
    );
    insertContactDB(orgId, contact, user?.id).catch((err: Error) =>
      console.error('addContact DB write failed:', err.message),
    );
  }, [user]);

  const deleteContact = useCallback((orgId: string, contactId: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, contacts: o.contacts.filter((c) => c.id !== contactId) }
          : o,
      ),
    );
    deleteContactDB(contactId).catch((err: Error) =>
      console.error('deleteContact DB write failed:', err.message),
    );
  }, []);

  return (
    <OrgsContext.Provider
      value={{
        organizations: orgs,
        loading,
        error,
        getOrgById,
        addOrg,
        updateOrg,
        addNote,
        addReminder,
        logActivity,
        changeOrgStatus,
        deleteActivity,
        deleteNote,
        deleteReminder,
        addContact,
        deleteContact,
        refresh: load,
      }}
    >
      {children}
    </OrgsContext.Provider>
  );
}
