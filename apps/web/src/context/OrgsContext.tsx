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
  updateHandoffNote as updateHandoffNoteDB,
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
  /** Non-null briefly when a background mutation fails. Clear with clearMutationError(). */
  mutationError: string | null;
  clearMutationError: () => void;
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
  /** Save the handoff note for an org (optimistic local + DB). */
  updateHandoffNote: (orgId: string, note: string) => void;
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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const clearMutationError = useCallback(() => setMutationError(null), []);

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
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId ? { ...o, notes: [note, ...o.notes] } : o,
      ),
    );
    insertNote(orgId, note, user?.id).catch((err: Error) => {
      console.error('addNote DB write failed:', err.message);
      setMutationError('Failed to save note — changes may not persist.');
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, notes: o.notes.filter((n) => n.id !== note.id) } : o,
        ),
      );
    });
  }, [user]);

  const addReminder = useCallback((orgId: string, reminder: Reminder) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, reminders: [...o.reminders, reminder] }
          : o,
      ),
    );
    insertReminder(orgId, reminder, user?.id).catch((err: Error) => {
      console.error('addReminder DB write failed:', err.message);
      setMutationError('Failed to save reminder — changes may not persist.');
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId
            ? { ...o, reminders: o.reminders.filter((r) => r.id !== reminder.id) }
            : o,
        ),
      );
    });
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
    insertActivity(orgId, item, user?.id).catch((err: Error) => {
      console.error('logActivity DB write failed:', err.message);
      setMutationError('Failed to log activity — changes may not persist.');
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId
            ? { ...o, recentActivity: o.recentActivity.filter((a) => a.id !== item.id) }
            : o,
        ),
      );
    });
    updateOrgFields(orgId, { last_contacted_at: item.date }).catch((err: Error) =>
      console.error('logActivity last_contacted_at update failed:', err.message),
    );
  }, [user]);

  const changeOrgStatus = useCallback((orgId: string, status: OutreachStatus) => {
    // Capture the old status so we can revert on failure
    setOrgs((prev) => {
      return prev.map((o) => (o.id === orgId ? { ...o, status } : o));
    });
    updateOrgFields(orgId, { status }).catch((err: Error) => {
      console.error('changeOrgStatus DB write failed:', err.message);
      setMutationError('Failed to update status — try again.');
    });
  }, []);

  const deleteActivity = useCallback((orgId: string, activityId: string) => {
    // Capture the item we're removing so we can revert on failure
    let removed: ActivityItem | undefined;
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        removed = o.recentActivity.find((a) => a.id === activityId);
        const remaining = o.recentActivity.filter((a) => a.id !== activityId);
        const newLastContacted = remaining.length > 0 ? remaining[0].date : undefined;
        return { ...o, recentActivity: remaining, lastContactedAt: newLastContacted };
      }),
    );
    deleteActivityDB(activityId).catch((err: Error) => {
      console.error('deleteActivity DB write failed:', err.message);
      setMutationError('Failed to delete activity — try refreshing.');
      if (removed) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId
              ? { ...o, recentActivity: [removed!, ...o.recentActivity].sort(
                  (a, b) => b.date.localeCompare(a.date),
                ) }
              : o,
          ),
        );
      }
    });
  }, []);

  const deleteNote = useCallback((orgId: string, noteId: string) => {
    let removed: Note | undefined;
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        removed = o.notes.find((n) => n.id === noteId);
        return { ...o, notes: o.notes.filter((n) => n.id !== noteId) };
      }),
    );
    deleteNoteDB(noteId).catch((err: Error) => {
      console.error('deleteNote DB write failed:', err.message);
      setMutationError('Failed to delete note — try refreshing.');
      if (removed) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId ? { ...o, notes: [removed!, ...o.notes] } : o,
          ),
        );
      }
    });
  }, []);

  const deleteReminder = useCallback((orgId: string, reminderId: string) => {
    let removed: Reminder | undefined;
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        removed = o.reminders.find((r) => r.id === reminderId);
        return { ...o, reminders: o.reminders.filter((r) => r.id !== reminderId) };
      }),
    );
    deleteReminderDB(reminderId).catch((err: Error) => {
      console.error('deleteReminder DB write failed:', err.message);
      setMutationError('Failed to delete reminder — try refreshing.');
      if (removed) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId ? { ...o, reminders: [...o.reminders, removed!] } : o,
          ),
        );
      }
    });
  }, []);

  const addContact = useCallback((orgId: string, contact: Contact) => {
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        const updatedExisting = contact.isPrimary
          ? o.contacts.map((c) => ({ ...c, isPrimary: false }))
          : o.contacts;
        return { ...o, contacts: [...updatedExisting, contact] };
      }),
    );
    insertContactDB(orgId, contact, user?.id).catch((err: Error) => {
      console.error('addContact DB write failed:', err.message);
      setMutationError('Failed to save contact — changes may not persist.');
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId
            ? { ...o, contacts: o.contacts.filter((c) => c.id !== contact.id) }
            : o,
        ),
      );
    });
  }, [user]);

  const updateHandoffNote = useCallback((orgId: string, note: string) => {
    setOrgs((prev) =>
      prev.map((o) => o.id === orgId ? { ...o, handoffNote: note } : o),
    );
    updateHandoffNoteDB(orgId, note).catch((err: Error) => {
      console.error('updateHandoffNote DB write failed:', err.message);
      setMutationError('Failed to save handoff note — changes may not persist.');
    });
  }, []);

  const deleteContact = useCallback((orgId: string, contactId: string) => {
    let removed: Contact | undefined;
    setOrgs((prev) =>
      prev.map((o) => {
        if (o.id !== orgId) return o;
        removed = o.contacts.find((c) => c.id === contactId);
        return { ...o, contacts: o.contacts.filter((c) => c.id !== contactId) };
      }),
    );
    deleteContactDB(contactId).catch((err: Error) => {
      console.error('deleteContact DB write failed:', err.message);
      setMutationError('Failed to delete contact — try refreshing.');
      if (removed) {
        setOrgs((prev) =>
          prev.map((o) =>
            o.id === orgId ? { ...o, contacts: [...o.contacts, removed!] } : o,
          ),
        );
      }
    });
  }, []);

  return (
    <OrgsContext.Provider
      value={{
        organizations: orgs,
        loading,
        error,
        mutationError,
        clearMutationError,
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
        updateHandoffNote,
        refresh: load,
      }}
    >
      {children}
    </OrgsContext.Provider>
  );
}
