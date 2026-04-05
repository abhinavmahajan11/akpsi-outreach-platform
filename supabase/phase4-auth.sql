-- ─── Phase 4: Auth — profiles table + ownership columns ──────────────────────
--
-- Run this against your Supabase project after schema.sql has been applied.
-- Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards.

-- ─── 1. Profiles table ────────────────────────────────────────────────────────
-- Mirrors the Supabase auth.users table with app-specific fields.
-- id is a FK to auth.users so the row is automatically cleaned up on user delete.

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  committee   TEXT,
  role        TEXT        NOT NULL DEFAULT 'member'
                          CHECK (role IN ('admin', 'member')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS for now (same policy as other tables in schema.sql).
-- Phase 5: enable RLS and add per-user policies.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ─── 2. Ownership column on organizations ────────────────────────────────────

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- ─── 3. Ownership columns on child tables ────────────────────────────────────

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- ─── 4. Indexes for user-scoped queries ──────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_organizations_created_by
  ON public.organizations(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_notes_created_by
  ON public.notes(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_activities_created_by
  ON public.activities(created_by_user_id);
