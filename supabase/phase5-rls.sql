-- =============================================================================
-- Phase 5: Role-Based Access Control + Row Level Security
--
-- Run ONCE in Supabase Dashboard → SQL Editor → New Query → Run.
-- Run AFTER schema.sql and phase4-auth.sql have been applied.
-- Safe to re-run: uses CREATE OR REPLACE and DROP POLICY IF EXISTS guards.
--
-- Member access model:
--   A member can see/write any record where ONE of these is true:
--     (a) they personally created it (created_by_user_id = auth.uid())
--     (b) the parent organization's committee_owner matches their profile committee
--   NULL-owner (seed/legacy) rows are NOT visible to members.
-- =============================================================================

-- ─── 1. Expand profiles.role to support all four roles ───────────────────────

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'president', 'vice_president', 'member'));

-- ─── 2. Helper functions ──────────────────────────────────────────────────────
-- Both are SECURITY DEFINER to avoid RLS recursion when policies on other
-- tables call them to look up the current user's role or committee.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_committee()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT committee FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── 3. Enable RLS on all tables ─────────────────────────────────────────────

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities    ENABLE ROW LEVEL SECURITY;

-- ─── 4. profiles policies ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: self read"        ON public.profiles;
DROP POLICY IF EXISTS "profiles: full-access read" ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert own"       ON public.profiles;
DROP POLICY IF EXISTS "profiles: self update"      ON public.profiles;

-- Every user can read their own profile.
CREATE POLICY "profiles: self read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Full-access roles can read any profile (e.g. admin managing members).
CREATE POLICY "profiles: full-access read"
  ON public.profiles FOR SELECT
  USING (get_my_role() IN ('admin', 'president', 'vice_president'));

-- Sign-up flow inserts a profile row for the new user.
CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can only update their own profile.
CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── 5. organizations policies ───────────────────────────────────────────────
-- Member SELECT: own rows OR NULL-owner rows OR committee match.
-- Member INSERT: any authenticated user (app always sets created_by_user_id).
-- Member UPDATE/DELETE: own rows only.

DROP POLICY IF EXISTS "orgs: full-access all"   ON public.organizations;
DROP POLICY IF EXISTS "orgs: member select"     ON public.organizations;
DROP POLICY IF EXISTS "orgs: member insert"     ON public.organizations;
DROP POLICY IF EXISTS "orgs: member update own" ON public.organizations;
DROP POLICY IF EXISTS "orgs: member delete own" ON public.organizations;

CREATE POLICY "orgs: full-access all"
  ON public.organizations FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "orgs: member select"
  ON public.organizations FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR (get_my_committee() IS NOT NULL AND committee_owner = get_my_committee())
  );

CREATE POLICY "orgs: member insert"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orgs: member update own"
  ON public.organizations FOR UPDATE
  USING (
    created_by_user_id = auth.uid()
    OR (get_my_committee() IS NOT NULL AND committee_owner = get_my_committee())
  )
  WITH CHECK (
    created_by_user_id = auth.uid()
    OR (get_my_committee() IS NOT NULL AND committee_owner = get_my_committee())
  );
CREATE POLICY "orgs: member delete own"
  ON public.organizations FOR DELETE
  USING (created_by_user_id = auth.uid());

-- ─── 6. notes policies ───────────────────────────────────────────────────────
-- Member access mirrors org access: if you can see the org, you can see its notes.

DROP POLICY IF EXISTS "notes: full-access all"   ON public.notes;
DROP POLICY IF EXISTS "notes: member select"     ON public.notes;
DROP POLICY IF EXISTS "notes: member insert"     ON public.notes;
DROP POLICY IF EXISTS "notes: member update own" ON public.notes;
DROP POLICY IF EXISTS "notes: member delete own" ON public.notes;

CREATE POLICY "notes: full-access all"
  ON public.notes FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "notes: member select"
  ON public.notes FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = notes.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "notes: member insert"
  ON public.notes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = notes.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "notes: member update own"
  ON public.notes FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "notes: member delete own"
  ON public.notes FOR DELETE
  USING (created_by_user_id = auth.uid());

-- ─── 7. reminders policies ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "reminders: full-access all"   ON public.reminders;
DROP POLICY IF EXISTS "reminders: member select"     ON public.reminders;
DROP POLICY IF EXISTS "reminders: member insert"     ON public.reminders;
DROP POLICY IF EXISTS "reminders: member update own" ON public.reminders;
DROP POLICY IF EXISTS "reminders: member delete own" ON public.reminders;

CREATE POLICY "reminders: full-access all"
  ON public.reminders FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "reminders: member select"
  ON public.reminders FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = reminders.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "reminders: member insert"
  ON public.reminders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = reminders.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "reminders: member update own"
  ON public.reminders FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "reminders: member delete own"
  ON public.reminders FOR DELETE
  USING (created_by_user_id = auth.uid());

-- ─── 8. activities policies ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "activities: full-access all"   ON public.activities;
DROP POLICY IF EXISTS "activities: member select"     ON public.activities;
DROP POLICY IF EXISTS "activities: member insert"     ON public.activities;
DROP POLICY IF EXISTS "activities: member update own" ON public.activities;
DROP POLICY IF EXISTS "activities: member delete own" ON public.activities;

CREATE POLICY "activities: full-access all"
  ON public.activities FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "activities: member select"
  ON public.activities FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = activities.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "activities: member insert"
  ON public.activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = activities.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "activities: member update own"
  ON public.activities FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "activities: member delete own"
  ON public.activities FOR DELETE
  USING (created_by_user_id = auth.uid());

-- ─── 9. contacts policies ────────────────────────────────────────────────────
-- contacts has no created_by_user_id — access is entirely through parent org.

DROP POLICY IF EXISTS "contacts: full-access all" ON public.contacts;
DROP POLICY IF EXISTS "contacts: member select"   ON public.contacts;
DROP POLICY IF EXISTS "contacts: member insert"   ON public.contacts;

CREATE POLICY "contacts: full-access all"
  ON public.contacts FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "contacts: member select"
  ON public.contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = contacts.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "contacts: member insert"
  ON public.contacts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = contacts.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );
