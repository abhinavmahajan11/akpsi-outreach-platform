-- =============================================================================
-- Phase 5: Role-Based Access Control + Row Level Security
--
-- Run this after schema.sql and phase4-auth.sql have been applied.
-- Safe to re-run: uses CREATE OR REPLACE, IF NOT EXISTS, IF EXISTS guards.
-- =============================================================================

-- ─── 1. Expand profiles.role to support all four roles ───────────────────────

-- Drop the existing CHECK constraint and add the expanded one.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'president', 'vice_president', 'member'));

-- ─── 2. Role helper function ──────────────────────────────────────────────────
-- SECURITY DEFINER so it runs as the table owner and avoids RLS recursion
-- when policies on other tables need to look up the caller's role.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── 3. Enable RLS on all tables ─────────────────────────────────────────────

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities    ENABLE ROW LEVEL SECURITY;

-- ─── 4. profiles policies ────────────────────────────────────────────────────
-- All authenticated users can read their own profile.
-- Full-access roles can read any profile.
-- Users can only update their own profile.

DROP POLICY IF EXISTS "profiles: self read"        ON public.profiles;
DROP POLICY IF EXISTS "profiles: full-access read" ON public.profiles;
DROP POLICY IF EXISTS "profiles: self update"      ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert own"       ON public.profiles;

CREATE POLICY "profiles: self read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: full-access read"
  ON public.profiles FOR SELECT
  USING (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── 5. organizations policies ───────────────────────────────────────────────
-- Full-access: see and modify everything.
-- Members: see records they created OR records with no owner (NULL = legacy/seed data).
--   Insert: any authenticated user (app sets created_by_user_id).
--   Update/Delete: only their own rows.

DROP POLICY IF EXISTS "orgs: full-access all"    ON public.organizations;
DROP POLICY IF EXISTS "orgs: member select"      ON public.organizations;
DROP POLICY IF EXISTS "orgs: member insert"      ON public.organizations;
DROP POLICY IF EXISTS "orgs: member update own"  ON public.organizations;
DROP POLICY IF EXISTS "orgs: member delete own"  ON public.organizations;

CREATE POLICY "orgs: full-access all"
  ON public.organizations FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

CREATE POLICY "orgs: member select"
  ON public.organizations FOR SELECT
  USING (
    created_by_user_id = auth.uid()
    OR created_by_user_id IS NULL
  );

CREATE POLICY "orgs: member insert"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "orgs: member update own"
  ON public.organizations FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "orgs: member delete own"
  ON public.organizations FOR DELETE
  USING (created_by_user_id = auth.uid());

-- ─── 6. notes policies ───────────────────────────────────────────────────────
-- Mirrors org ownership: members can see notes on orgs they can see.
-- Members can insert notes on accessible orgs; update/delete only their own.

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
    OR created_by_user_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = notes.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
    )
  );

CREATE POLICY "notes: member insert"
  ON public.notes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = notes.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
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
    OR created_by_user_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = reminders.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
    )
  );

CREATE POLICY "reminders: member insert"
  ON public.reminders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = reminders.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
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
    OR created_by_user_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = activities.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
    )
  );

CREATE POLICY "activities: member insert"
  ON public.activities FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = activities.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
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
-- Contacts have no created_by_user_id column — access purely through parent org.

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
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
    )
  );

CREATE POLICY "contacts: member insert"
  ON public.contacts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = contacts.organization_id
        AND (o.created_by_user_id = auth.uid() OR o.created_by_user_id IS NULL)
    )
  );
