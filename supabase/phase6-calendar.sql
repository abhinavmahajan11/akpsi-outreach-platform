-- =============================================================================
-- Phase 6: Calendar & Follow-Up Events
--
-- Run ONCE in Supabase Dashboard → SQL Editor → New Query → Run.
-- Run AFTER schema.sql, phase4-auth.sql, and phase5-rls.sql.
-- Safe to re-run: uses IF NOT EXISTS and DROP POLICY IF EXISTS guards.
--
-- Requires the update_updated_at() function from schema.sql
-- Requires get_my_role() and get_my_committee() from phase5-rls.sql
-- =============================================================================

-- ─── 1. calendar_events table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     TEXT        REFERENCES public.organizations(id) ON DELETE SET NULL,
  title               TEXT        NOT NULL,
  description         TEXT        NOT NULL DEFAULT '',
  event_type          TEXT        NOT NULL DEFAULT 'follow_up',
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ,
  all_day             BOOLEAN     NOT NULL DEFAULT FALSE,
  location            TEXT        NOT NULL DEFAULT '',
  meeting_link        TEXT        NOT NULL DEFAULT '',
  assigned_to_user_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status              TEXT        NOT NULL DEFAULT 'scheduled',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cal_type_check CHECK (event_type IN (
    'follow_up', 'meeting', 'recruiter_call', 'sponsor_checkin',
    'workshop_planning', 'service_partner_meeting', 'deadline', 'general_task'
  )),
  CONSTRAINT cal_status_check CHECK (status IN (
    'scheduled', 'completed', 'cancelled'
  ))
);

-- ─── 2. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_cal_start_at    ON public.calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_cal_org         ON public.calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_cal_created_by  ON public.calendar_events(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cal_status      ON public.calendar_events(status);

-- ─── 3. updated_at trigger ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Full-access roles: all operations
DROP POLICY IF EXISTS "cal: full-access all" ON public.calendar_events;
CREATE POLICY "cal: full-access all"
  ON public.calendar_events FOR ALL
  USING  (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

-- Members: see events they created OR events linked to an org in their committee
DROP POLICY IF EXISTS "cal: member select" ON public.calendar_events;
CREATE POLICY "cal: member select"
  ON public.calendar_events FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = calendar_events.organization_id
        AND get_my_committee() IS NOT NULL
        AND o.committee_owner = get_my_committee()
    )
  );

-- Members: insert their own events only
DROP POLICY IF EXISTS "cal: member insert" ON public.calendar_events;
CREATE POLICY "cal: member insert"
  ON public.calendar_events FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by_user_id = auth.uid()
  );

-- Members: update / delete only their own events
DROP POLICY IF EXISTS "cal: member update own" ON public.calendar_events;
CREATE POLICY "cal: member update own"
  ON public.calendar_events FOR UPDATE
  USING    (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

DROP POLICY IF EXISTS "cal: member delete own" ON public.calendar_events;
CREATE POLICY "cal: member delete own"
  ON public.calendar_events FOR DELETE
  USING (created_by_user_id = auth.uid());
