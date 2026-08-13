-- =============================================================================
-- Phase 10: Production Hardening — RLS fixes
--
-- Run ONCE in Supabase Dashboard → SQL Editor → New Query → Run.
-- Run AFTER phase5-rls.sql has been applied.
-- Safe to re-run: uses DROP POLICY IF EXISTS guards throughout.
--
-- Changes:
--   1. Fix organizations DELETE policy — add committee ownership check so
--      members can delete orgs they own via committee (matches UPDATE logic).
--   2. Add contacts UPDATE + DELETE policies for members — previously
--      members could add contacts but not remove or update them, causing
--      silent RLS failures when clicking "Delete contact" in the UI.
--   3. Add templates RLS — enable row level security and scope policies.
-- =============================================================================

-- ─── 1. Fix organizations DELETE — add committee match ────────────────────────
--
-- Before: members could only delete orgs they personally created.
-- After:  members can also delete orgs where their committee is the owner.
--         This matches the UPDATE policy and fixes the asymmetry.

DROP POLICY IF EXISTS "orgs: member delete own" ON public.organizations;

CREATE POLICY "orgs: member delete own"
  ON public.organizations FOR DELETE
  USING (
    created_by_user_id = auth.uid()
    OR (get_my_committee() IS NOT NULL AND committee_owner = get_my_committee())
  );

-- ─── 2. Add contacts UPDATE + DELETE for members ──────────────────────────────
--
-- contacts has no created_by_user_id; access is through parent org.
-- Previously only SELECT and INSERT existed for members, causing silent
-- failures on delete/update operations in the UI.

DROP POLICY IF EXISTS "contacts: member update" ON public.contacts;
DROP POLICY IF EXISTS "contacts: member delete" ON public.contacts;

CREATE POLICY "contacts: member update"
  ON public.contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = contacts.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = contacts.organization_id
        AND (
          o.created_by_user_id = auth.uid()
          OR (get_my_committee() IS NOT NULL AND o.committee_owner = get_my_committee())
        )
    )
  );

CREATE POLICY "contacts: member delete"
  ON public.contacts FOR DELETE
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

-- ─── 3. Templates RLS ─────────────────────────────────────────────────────────
--
-- Enable RLS on templates table (created in phase9-handoff.sql).
-- Full-access roles: read/write all templates.
-- Members: read all templates + insert/update/delete their own non-default ones.

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates: full-access all"         ON public.templates;
DROP POLICY IF EXISTS "templates: member select all"       ON public.templates;
DROP POLICY IF EXISTS "templates: member insert own"       ON public.templates;
DROP POLICY IF EXISTS "templates: member update own"       ON public.templates;
DROP POLICY IF EXISTS "templates: member delete own"       ON public.templates;

-- Full-access roles can do everything
CREATE POLICY "templates: full-access all"
  ON public.templates FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

-- All authenticated members can read every template
CREATE POLICY "templates: member select all"
  ON public.templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Members can create their own templates
CREATE POLICY "templates: member insert own"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid());

-- Members can update their own non-default templates
CREATE POLICY "templates: member update own"
  ON public.templates FOR UPDATE
  USING (created_by_user_id = auth.uid() AND is_default = FALSE)
  WITH CHECK (created_by_user_id = auth.uid() AND is_default = FALSE);

-- Members can delete their own non-default templates
CREATE POLICY "templates: member delete own"
  ON public.templates FOR DELETE
  USING (created_by_user_id = auth.uid() AND is_default = FALSE);
