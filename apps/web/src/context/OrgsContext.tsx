'use client';

/**
 * OrgsContext — single source of truth for all organization data.
 *
 * Phase 2: seeded from static mock data, mutated in local state.
 * Phase 3 upgrade path: replace useState initializer with a React Query
 * or SWR hook; replace mutations with API calls. The hook API stays identical.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { organizations as seedData } from '@/data/organizations';
import type { Organization, Note, Reminder, ActivityItem } from '@/types';

// ─── Context value shape ──────────────────────────────────────────────────────

interface OrgsContextValue {
  /** All organizations in current session */
  organizations: Organization[];
  /** Look up a single org by id */
  getOrgById: (id: string) => Organization | undefined;
  /** Add a new org (prepended to list) */
  addOrg: (org: Organization) => void;
  /** Shallow-merge updates into an org */
  updateOrg: (orgId: string, updates: Partial<Organization>) => void;
  /** Prepend a note to an org's notes array */
  addNote: (orgId: string, note: Note) => void;
  /** Append a reminder to an org's reminders array */
  addReminder: (orgId: string, reminder: Reminder) => void;
  /** Prepend an activity item; also updates lastContactedAt */
  logActivity: (orgId: string, item: ActivityItem) => void;
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
  const [orgs, setOrgs] = useState<Organization[]>(seedData);

  const getOrgById = useCallback(
    (id: string) => orgs.find((o) => o.id === id),
    [orgs],
  );

  const addOrg = useCallback((org: Organization) => {
    setOrgs((prev) => [org, ...prev]);
  }, []);

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
  }, []);

  const addReminder = useCallback((orgId: string, reminder: Reminder) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, reminders: [...o.reminders, reminder] }
          : o,
      ),
    );
  }, []);

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
  }, []);

  return (
    <OrgsContext.Provider
      value={{
        organizations: orgs,
        getOrgById,
        addOrg,
        updateOrg,
        addNote,
        addReminder,
        logActivity,
      }}
    >
      {children}
    </OrgsContext.Provider>
  );
}
