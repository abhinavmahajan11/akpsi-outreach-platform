import type { Organization, OutreachStatus, CommitteeType } from '@/types';

// ─── Per-status display config ────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  OutreachStatus,
  { label: string; color: string; bg: string }
> = {
  active_partner:   { label: 'Active Partner',   color: '#16a34a', bg: '#dcfce7' },
  in_progress:      { label: 'In Progress',       color: '#2563eb', bg: '#dbeafe' },
  pending_response: { label: 'Pending Response',  color: '#d97706', bg: '#fef3c7' },
  no_contact:       { label: 'No Contact',        color: '#6b7280', bg: '#f3f4f6' },
  declined:         { label: 'Declined',          color: '#dc2626', bg: '#fee2e2' },
  completed:        { label: 'Completed',         color: '#7c3aed', bg: '#ede9fe' },
};

// ─── Return type ──────────────────────────────────────────────────────────────

export interface StatusBreakdownItem {
  status: OutreachStatus;
  label: string;
  count: number;
  pct: number;       // 0–100
  color: string;
  bg: string;
}

export interface CommitteeBreakdownItem {
  committee: CommitteeType;
  count: number;
  pct: number;
  activityCount: number;
}

export interface ActivitySummary {
  total: number;
  byType: Record<string, number>;
}

export interface OrgAnalytics {
  // Top-line counts
  totalOrgs: number;
  activePartners: number;
  pendingResponse: number;
  inProgress: number;
  noContact: number;
  declined: number;
  completed: number;

  // Charts
  statusBreakdown: StatusBreakdownItem[];
  committeeBreakdown: CommitteeBreakdownItem[];

  // Activity summary
  activitySummary: ActivitySummary;
  totalNotes: number;
  totalReminders: number;
  openReminders: number;

  mostActiveCommittee: CommitteeType | null;

  // Relationship intelligence (org lists)
  recentlyActive: Organization[];    // lastContactedAt within 7 days
  needsFollowUp: Organization[];     // pending_response + 7+ days since contact
  staleRelationships: Organization[]; // active/in_progress + 30+ days without contact
  neverContacted: Organization[];    // no_contact
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function computeAnalytics(organizations: Organization[]): OrgAnalytics {
  const total = organizations.length;

  // ── Status counts ──────────────────────────────────────────────────────────
  const statusCounts = {} as Record<OutreachStatus, number>;
  for (const status of Object.keys(STATUS_CONFIG) as OutreachStatus[]) {
    statusCounts[status] = 0;
  }
  for (const org of organizations) {
    statusCounts[org.status] = (statusCounts[org.status] ?? 0) + 1;
  }

  const statusBreakdown: StatusBreakdownItem[] = (
    Object.keys(STATUS_CONFIG) as OutreachStatus[]
  ).map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: statusCounts[status],
    pct: total > 0 ? Math.round((statusCounts[status] / total) * 100) : 0,
    color: STATUS_CONFIG[status].color,
    bg: STATUS_CONFIG[status].bg,
  }));

  // ── Committee breakdown ────────────────────────────────────────────────────
  const committeeCounts = {} as Record<string, number>;
  const committeeActivity = {} as Record<string, number>;

  for (const org of organizations) {
    const c = org.committeeOwner;
    committeeCounts[c] = (committeeCounts[c] ?? 0) + 1;
    committeeActivity[c] = (committeeActivity[c] ?? 0) + org.recentActivity.length;
  }

  const committeeNames = Object.keys(committeeCounts) as CommitteeType[];
  const maxCommitteeCount = Math.max(...committeeNames.map((c) => committeeCounts[c]), 1);

  const committeeBreakdown: CommitteeBreakdownItem[] = committeeNames
    .sort((a, b) => committeeCounts[b] - committeeCounts[a])
    .map((committee) => ({
      committee,
      count: committeeCounts[committee],
      pct: Math.round((committeeCounts[committee] / maxCommitteeCount) * 100),
      activityCount: committeeActivity[committee] ?? 0,
    }));

  const mostActiveCommittee: CommitteeType | null = committeeNames.length > 0
    ? committeeNames.reduce((best, c) =>
        committeeActivity[c] > (committeeActivity[best] ?? 0) ? c : best
      )
    : null;

  // ── Activity summary ───────────────────────────────────────────────────────
  const byType: Record<string, number> = {};
  let totalActivities = 0;

  for (const org of organizations) {
    for (const act of org.recentActivity) {
      byType[act.type] = (byType[act.type] ?? 0) + 1;
      totalActivities++;
    }
  }

  // ── Notes / reminders ─────────────────────────────────────────────────────
  let totalNotes = 0;
  let totalReminders = 0;
  let openReminders = 0;

  for (const org of organizations) {
    totalNotes += org.notes.length;
    totalReminders += org.reminders.length;
    openReminders += org.reminders.filter((r) => !r.isCompleted).length;
  }

  // ── Relationship intelligence ──────────────────────────────────────────────
  const recentlyActive: Organization[] = [];
  const needsFollowUp: Organization[] = [];
  const staleRelationships: Organization[] = [];
  const neverContacted: Organization[] = [];

  for (const org of organizations) {
    const days = daysSince(org.lastContactedAt);

    if (org.status === 'no_contact' && days === null) {
      neverContacted.push(org);
      continue;
    }

    if (days !== null && days <= 7) {
      recentlyActive.push(org);
    }

    if (org.status === 'pending_response' && days !== null && days >= 7) {
      needsFollowUp.push(org);
    }

    if (
      (org.status === 'active_partner' || org.status === 'in_progress') &&
      (days === null || days >= 30)
    ) {
      staleRelationships.push(org);
    }
  }

  // Sort intelligence lists by days since contact (most urgent first)
  const sortByDays = (a: Organization, b: Organization) => {
    const da = daysSince(a.lastContactedAt) ?? Infinity;
    const db = daysSince(b.lastContactedAt) ?? Infinity;
    return db - da;
  };

  needsFollowUp.sort(sortByDays);
  staleRelationships.sort(sortByDays);

  return {
    totalOrgs: total,
    activePartners: statusCounts.active_partner,
    pendingResponse: statusCounts.pending_response,
    inProgress: statusCounts.in_progress,
    noContact: statusCounts.no_contact,
    declined: statusCounts.declined,
    completed: statusCounts.completed,
    statusBreakdown,
    committeeBreakdown,
    activitySummary: { total: totalActivities, byType },
    totalNotes,
    totalReminders,
    openReminders,
    mostActiveCommittee,
    recentlyActive,
    needsFollowUp,
    staleRelationships,
    neverContacted,
  };
}
