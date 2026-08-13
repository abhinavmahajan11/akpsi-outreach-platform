import type { Organization, CommitteeType, CalendarEvent } from '@/types';

// ─── Day helpers ──────────────────────────────────────────────────────────────

export function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

// ─── Handoff signal types ─────────────────────────────────────────────────────

export interface CommitteeHandoff {
  committee: CommitteeType;
  total: number;
  activePartners: number;
  inProgress: number;
  pendingResponse: number;
  noContact: number;
  recentActivityCount: number;
  hasStaleActive: boolean;
}

export interface HandoffData {
  // Intelligence lists
  activePartners: Organization[];
  strongLeads: Organization[];        // in_progress + recent activity (≤14 days)
  needsFollowUp: Organization[];      // pending_response + 7+ days without response
  overdueActive: Organization[];      // active_partner + 30+ days stale
  neverContacted: Organization[];     // no_contact
  recentlyContacted: Organization[];  // any status + contacted ≤7 days

  // Upcoming calendar events (next 14 days)
  upcomingEvents: CalendarEvent[];

  // Committee breakdown
  committeeBreakdown: CommitteeHandoff[];

  // Aggregate counts
  totalOrgs: number;
  totalActivePartners: number;
  totalNeedsFollowUp: number;
  totalStaleActive: number;
  totalNeverContacted: number;
  totalWithHandoffNote: number;
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function computeHandoff(
  organizations: Organization[],
  calendarEvents: CalendarEvent[],
  /** If provided, scope to this committee only (for members) */
  committeeScope: CommitteeType | null = null,
): HandoffData {
  const orgs = committeeScope
    ? organizations.filter((o) => o.committeeOwner === committeeScope)
    : organizations;

  const activePartners: Organization[] = [];
  const strongLeads: Organization[] = [];
  const needsFollowUp: Organization[] = [];
  const overdueActive: Organization[] = [];
  const neverContacted: Organization[] = [];
  const recentlyContacted: Organization[] = [];

  for (const org of orgs) {
    const days = daysSince(org.lastContactedAt);

    if (org.status === 'active_partner') {
      activePartners.push(org);
      if (days === null || days >= 30) overdueActive.push(org);
    }

    if (org.status === 'in_progress' && days !== null && days <= 14) {
      strongLeads.push(org);
    }
    if (org.status === 'pending_response' && days !== null && days <= 14) {
      strongLeads.push(org);
    }

    if (org.status === 'pending_response' && days !== null && days >= 7) {
      needsFollowUp.push(org);
    }

    if (org.status === 'no_contact' && days === null) {
      neverContacted.push(org);
    }

    if (days !== null && days <= 7) {
      recentlyContacted.push(org);
    }
  }

  // Sort by recency where useful
  const byDaysAsc = (a: Organization, b: Organization) =>
    (daysSince(a.lastContactedAt) ?? 999) - (daysSince(b.lastContactedAt) ?? 999);
  const byDaysDesc = (a: Organization, b: Organization) =>
    (daysSince(b.lastContactedAt) ?? 999) - (daysSince(a.lastContactedAt) ?? 999);

  activePartners.sort(byDaysAsc);
  strongLeads.sort(byDaysAsc);
  needsFollowUp.sort(byDaysDesc);
  overdueActive.sort(byDaysDesc);
  recentlyContacted.sort(byDaysAsc);

  // ── Committee breakdown ────────────────────────────────────────────────────
  const allCommittees: CommitteeType[] = [
    'Professional Development', 'Community Service', 'Brotherhood',
    'Fundraising', 'Marketing', 'Alumni Relations',
  ];

  const committeeBreakdown: CommitteeHandoff[] = allCommittees.map((committee) => {
    const co = orgs.filter((o) => o.committeeOwner === committee);
    const recentActivityCount = co.reduce(
      (sum, o) => sum + o.recentActivity.filter((a) => {
        const d = daysSince(a.date);
        return d !== null && d <= 30;
      }).length,
      0,
    );
    return {
      committee,
      total: co.length,
      activePartners: co.filter((o) => o.status === 'active_partner').length,
      inProgress: co.filter((o) => o.status === 'in_progress').length,
      pendingResponse: co.filter((o) => o.status === 'pending_response').length,
      noContact: co.filter((o) => o.status === 'no_contact').length,
      recentActivityCount,
      hasStaleActive: co.some(
        (o) => o.status === 'active_partner' && (daysSince(o.lastContactedAt) ?? 999) >= 30,
      ),
    };
  });

  // ── Upcoming events (next 14 days) ─────────────────────────────────────────
  const now = Date.now();
  const twoWeeks = now + 14 * 86_400_000;
  const upcomingEvents = calendarEvents
    .filter((e) => {
      const t = new Date(e.startAt).getTime();
      return e.status === 'scheduled' && t >= now && t <= twoWeeks;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 10);

  return {
    activePartners,
    strongLeads,
    needsFollowUp,
    overdueActive,
    neverContacted,
    recentlyContacted,
    upcomingEvents,
    committeeBreakdown,
    totalOrgs: orgs.length,
    totalActivePartners: activePartners.length,
    totalNeedsFollowUp: needsFollowUp.length,
    totalStaleActive: overdueActive.length,
    totalNeverContacted: neverContacted.length,
    totalWithHandoffNote: orgs.filter((o) => o.handoffNote && o.handoffNote.trim().length > 0).length,
  };
}
