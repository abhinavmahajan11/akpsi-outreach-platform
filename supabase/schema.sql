-- =============================================================================
-- AKPsi Outreach Platform — Supabase Schema
-- Apply this in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ─── 1. Tables ───────────────────────────────────────────────────────────────

-- Organizations
-- Using TEXT primary key (slug-based, e.g. "google", "deloitte-abc123")
-- so IDs match URLs directly without an extra lookup.
CREATE TABLE IF NOT EXISTS organizations (
  id                TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  logo_initials     TEXT        NOT NULL  DEFAULT '',
  logo_color        TEXT        NOT NULL  DEFAULT 'bg-blue-500',
  type              TEXT        NOT NULL  DEFAULT 'Corporate',
  industry          TEXT        NOT NULL  DEFAULT '',
  location          TEXT        NOT NULL  DEFAULT '',
  status            TEXT        NOT NULL  DEFAULT 'no_contact',
  tags              TEXT[]      NOT NULL  DEFAULT '{}',
  committee_owner   TEXT        NOT NULL  DEFAULT '',
  assigned_member   TEXT        NOT NULL  DEFAULT 'Unassigned',
  description       TEXT        NOT NULL  DEFAULT '',
  website           TEXT,
  next_step         TEXT        NOT NULL  DEFAULT '',
  last_contacted_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL  DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id               TEXT        PRIMARY KEY,
  organization_id  TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  title            TEXT        NOT NULL DEFAULT '',
  email            TEXT        NOT NULL DEFAULT '',
  phone            TEXT,
  linkedin_url     TEXT,
  is_primary       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id               TEXT        PRIMARY KEY,
  organization_id  TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  content          TEXT        NOT NULL,
  author_name      TEXT        NOT NULL DEFAULT 'Priya Nair',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id               TEXT        PRIMARY KEY,
  organization_id  TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  due_date         TIMESTAMPTZ NOT NULL,
  is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
  assigned_to      TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activities (outreach history)
CREATE TABLE IF NOT EXISTS activities (
  id               TEXT        PRIMARY KEY,
  organization_id  TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type             TEXT        NOT NULL, -- email | call | meeting | note | status_change | follow_up
  title            TEXT        NOT NULL,
  description      TEXT        NOT NULL DEFAULT '',
  activity_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name      TEXT        NOT NULL DEFAULT 'Priya Nair',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_contacts_org    ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_notes_org       ON notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_reminders_org   ON reminders(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_org  ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgs_status     ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_orgs_committee  ON organizations(committee_owner);

-- ─── 3. Auto-update updated_at trigger ───────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. Row Level Security ────────────────────────────────────────────────────
-- Phase 3: RLS is disabled so the anon key can read/write freely.
-- Phase 4: Enable RLS and add per-user policies once auth is added.

ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts      DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders     DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities    DISABLE ROW LEVEL SECURITY;

-- ─── 5. Seed data (the 5 mock organizations from Phase 2) ─────────────────────
-- Run this block after the tables are created to pre-populate the database.
-- Safe to skip if you prefer to start fresh and add orgs via the UI.

-- Google
INSERT INTO organizations VALUES (
  'google','Google','G','bg-blue-500','Corporate','Technology','Sunnyvale, CA','active_partner',
  ARRAY['tech','recruiting','info-session'],'Professional Development','Priya Nair',
  'Technology partnership focused on campus recruiting and info sessions. Long-standing relationship with the university relations team.',
  'google.com','Confirm Spring Info Session date and send logistics form to Taylor.',
  '2024-03-20T14:00:00Z', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts VALUES
  ('g-contact-1','google','Taylor Kim','University Relations Manager','tkim@google.com',NULL,'linkedin.com/in/taylorkim',TRUE,NOW()),
  ('g-contact-2','google','Jordan Lee','Campus Recruiting Coordinator','jlee@google.com',NULL,NULL,FALSE,NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO notes VALUES
  ('g-note-1','google','Taylor confirmed interest in hosting a Spring info session and a networking mixer. Prefers mid-April dates. Budget approved on their end.','Priya Nair','2024-03-20T14:30:00Z','2024-03-20T14:30:00Z'),
  ('g-note-2','google','Google requires 60-day advance notice for room booking. Need to finalize headcount estimate before sending logistics form.','Priya Nair','2024-02-15T10:00:00Z','2024-02-15T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders VALUES
  ('g-rem-1','google','Send logistics form to Taylor Kim','2024-03-28T09:00:00Z',FALSE,'Priya Nair',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities VALUES
  ('g-act-1','google','meeting','Intro call with Taylor Kim','Discussed Spring recruiting calendar and info session format. Strong interest confirmed.','2024-03-20T14:00:00Z','Priya Nair',NOW()),
  ('g-act-2','google','email','Sent follow-up with event proposal','Emailed event proposal doc with three potential April dates and expected attendance of 40–60 members.','2024-03-15T11:00:00Z','Priya Nair',NOW()),
  ('g-act-3','google','status_change','Status updated to Active Partner','Moved from In Progress after verbal confirmation of partnership intent from Taylor.','2024-03-10T16:00:00Z','Priya Nair',NOW())
ON CONFLICT (id) DO NOTHING;

-- Deloitte
INSERT INTO organizations VALUES (
  'deloitte','Deloitte','D','bg-emerald-600','Corporate','Consulting','New York, NY','in_progress',
  ARRAY['consulting','case-comp','recruiting'],'Professional Development','Marcus Webb',
  'Big Four consulting firm partnership targeting case competition sponsorship and campus recruiting events this Spring.',
  'deloitte.com','Send updated case competition proposal with revised two-round format and prize structure by March 30.',
  '2024-03-18T11:00:00Z', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts VALUES
  ('d-contact-1','deloitte','Morgan Chen','Campus Recruiting Lead','mchen@deloitte.com',NULL,'linkedin.com/in/morganchen',TRUE,NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO notes VALUES
  ('d-note-1','deloitte','Morgan requested we revise the case competition format — they want a two-round structure with a Deloitte-hosted presentation in Round 2. Prize pool should be $1,500 minimum.','Marcus Webb','2024-03-18T12:00:00Z','2024-03-18T12:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders VALUES
  ('d-rem-1','deloitte','Submit revised case comp proposal to Morgan','2024-03-30T09:00:00Z',FALSE,'Marcus Webb',NOW()),
  ('d-rem-2','deloitte','Follow up if no response by April 5','2024-04-05T09:00:00Z',FALSE,'Marcus Webb',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities VALUES
  ('d-act-1','deloitte','call','Call with Morgan Chen','Reviewed preliminary case comp proposal. Morgan requested format revisions.','2024-03-18T11:00:00Z','Marcus Webb',NOW()),
  ('d-act-2','deloitte','email','Initial outreach sent','Sent cold outreach to Deloitte campus recruiting team with AKPsi overview and Spring event calendar.','2024-03-01T09:00:00Z','Marcus Webb',NOW())
ON CONFLICT (id) DO NOTHING;

-- Goldman Sachs
INSERT INTO organizations VALUES (
  'goldman-sachs','Goldman Sachs','GS','bg-slate-700','Sponsor','Finance','New York, NY','pending_response',
  ARRAY['finance','sponsor','high-priority'],'Fundraising','Aisha Thompson',
  'Pursuing a chapter sponsorship for Spring Formal and a finance workshop series. High-value target for Fundraising committee.',
  'goldmansachs.com','Follow up on $2,500 sponsorship proposal — sent 10 days ago with no response. Lead with finance workshop angle.',
  '2024-03-12T10:00:00Z', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts VALUES
  ('gs-contact-1','goldman-sachs','Avery Brooks','Community Affairs Manager','abrooks@gs.com',NULL,'linkedin.com/in/averybrooks',TRUE,NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO notes VALUES
  ('gs-note-1','goldman-sachs','Avery responded positively when we mentioned the finance workshop component in our intro meeting. Recommend leading with that angle in the follow-up.','Aisha Thompson','2024-03-12T10:30:00Z','2024-03-12T10:30:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders VALUES
  ('gs-rem-1','goldman-sachs','Follow up on sponsorship proposal — overdue','2024-03-25T09:00:00Z',FALSE,'Aisha Thompson',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities VALUES
  ('gs-act-1','goldman-sachs','email','Sent full sponsorship deck','Delivered sponsorship proposal with three tiers — Gold ($5K), Silver ($2.5K), Bronze ($1K).','2024-03-12T10:00:00Z','Aisha Thompson',NOW()),
  ('gs-act-2','goldman-sachs','meeting','Intro meeting at Goldman NYC office','Met Avery and her team to introduce AKPsi and share our Spring event calendar.','2024-03-05T15:00:00Z','Aisha Thompson',NOW())
ON CONFLICT (id) DO NOTHING;

-- Make-A-Wish Foundation
INSERT INTO organizations VALUES (
  'make-a-wish','Make-A-Wish Foundation','MW','bg-violet-500','Nonprofit','Nonprofit','Phoenix, AZ (National)','active_partner',
  ARRAY['nonprofit','service','fundraising','community'],'Community Service','Sofia Reyes',
  'Annual community service partner. Chapter runs a fundraising drive each Spring semester. Last year raised $3,200 — goal this year is $4,500.',
  'wish.org','Finalize Spring fundraiser logistics — confirm venue, set date, and open member signup.',
  '2024-03-22T09:00:00Z', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts VALUES
  ('mw-contact-1','make-a-wish','Casey Rivera','Corporate Partnerships Coordinator','crivera@wish.org','(602) 555-0183',NULL,TRUE,NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO notes VALUES
  ('mw-note-1','make-a-wish','Casey confirmed they can provide Make-A-Wish branded materials for our event. Need to submit order by April 1 to receive in time.','Sofia Reyes','2024-03-22T09:30:00Z','2024-03-22T09:30:00Z'),
  ('mw-note-2','make-a-wish','Consider adding a silent auction element this year to increase fundraising ceiling. Student union venue is preferred — check availability.','Sofia Reyes','2024-02-28T11:00:00Z','2024-02-28T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders VALUES
  ('mw-rem-1','make-a-wish','Order Make-A-Wish branded materials by April 1','2024-04-01T09:00:00Z',FALSE,'Sofia Reyes',NOW()),
  ('mw-rem-2','make-a-wish','Open member signup for Spring fundraiser','2024-03-29T09:00:00Z',FALSE,'Sofia Reyes',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities VALUES
  ('mw-act-1','make-a-wish','call','Spring planning call with Casey Rivera','Aligned on Spring fundraiser format. Venue options discussed — student union preferred, ballroom as backup.','2024-03-22T09:00:00Z','Sofia Reyes',NOW()),
  ('mw-act-2','make-a-wish','email','Sent event overview for review','Shared draft event plan with Casey for approval.','2024-03-10T14:00:00Z','Sofia Reyes',NOW()),
  ('mw-act-3','make-a-wish','status_change','Partnership renewed for Spring semester','Carried over from Fall. Casey confirmed continuation.','2024-01-15T10:00:00Z','Sofia Reyes',NOW())
ON CONFLICT (id) DO NOTHING;

-- Accenture
INSERT INTO organizations VALUES (
  'accenture','Accenture','AC','bg-purple-600','Corporate','Consulting / Technology','Chicago, IL','no_contact',
  ARRAY['consulting','tech','target'],'Professional Development','Unassigned',
  'Priority outreach target for Professional Development. Strong AKPsi alumni presence at Accenture Chicago.',
  'accenture.com','Reach out to AKPsi alumni at Accenture for a warm intro to campus recruiting team.',
  NULL, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO notes VALUES
  ('ac-note-1','accenture','Three AKPsi alumni currently work at Accenture Chicago — two in Strategy & Consulting, one in Technology. Worth asking them for a direct intro rather than cold outreach.','Marcus Webb','2024-03-05T09:00:00Z','2024-03-05T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reminders VALUES
  ('ac-rem-1','accenture','Contact AKPsi alumni at Accenture for warm intro','2024-04-01T09:00:00Z',FALSE,'Marcus Webb',NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO activities VALUES
  ('ac-act-1','accenture','note','Added to Professional Development target list','Identified as a priority outreach target based on alumni network density.','2024-03-05T09:00:00Z','Marcus Webb',NOW())
ON CONFLICT (id) DO NOTHING;
