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
import type { Organization, Note, Reminder, ActivityItem } from '@/types';
import {
  fetchAllOrgs,
  insertOrg,
  insertNote,
  insertReminder,
  insertActivity,
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
  }, [user]);

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
        refresh: load,
      }}
    >
      {children}
    </OrgsContext.Provider>
  );
}
