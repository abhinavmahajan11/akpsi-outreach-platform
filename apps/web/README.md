# AKPsi Outreach Platform

Centralized outreach management for Alpha Kappa Psi. Tracks organizations, contacts, relationships, activities, calendar events, templates, and semester handoffs across committees.

**Tech stack:** Next.js 16 App Router · TypeScript strict · Tailwind v4 · Supabase (auth + database + RLS) · pnpm monorepo

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- A Supabase project (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd akpsi-outreach-platform
pnpm install
```

### 2. Configure environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are found in your Supabase project → Settings → API.

### 3. Apply database schema

Run these SQL files **in order** in the Supabase Dashboard → SQL Editor:

| Order | File | Purpose |
|-------|------|---------|
| 1 | `supabase/schema.sql` | Core tables: organizations, contacts, notes, reminders, activities |
| 2 | `supabase/phase4-auth.sql` | Profiles table and auth trigger |
| 3 | `supabase/phase5-rls.sql` | Row Level Security policies |
| 4 | `supabase/phase6-calendar.sql` | Calendar events table + RLS |
| 5 | `supabase/phase9-handoff.sql` | Templates table + handoff_note column + seed data |
| 6 | `supabase/phase10-production-hardening.sql` | RLS fixes for contacts, orgs, and templates |

Each file is idempotent — safe to re-run.

### 4. Run locally

```bash
cd apps/web
pnpm dev
```

Open http://localhost:3000.

---

## Initial Admin Setup

After running all SQL files, **you must manually promote the first admin user**. Sign up normally, then run in Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@university.edu';
```

All new sign-ups default to `role = 'member'`. There is no self-service admin promotion by design.

---

## Role System

| Role | Access |
|------|--------|
| `admin` | Full read/write on all data |
| `president` | Full read/write on all data |
| `vice_president` | Full read/write on all data |
| `member` | Read/write only orgs their committee owns or they created |

Committee assignment happens at sign-up. Members without a committee can only see orgs they personally created.

---

## Production Deployment (Vercel)

### 1. Connect repo to Vercel

```
vercel import
```

Set **Root Directory** to `apps/web` (or configure in `vercel.json` at the monorepo root).

### 2. Add environment variables in Vercel dashboard

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

### 3. Supabase production checklist

Before going live, verify in Supabase:

- [ ] **Auth → URL Configuration** — add your production domain to "Site URL" and "Redirect URLs"
- [ ] **Auth → Email Templates** — customize confirmation email if using email verification
- [ ] **Database → RLS** — confirm RLS is enabled on all tables (it is if you ran all SQL files)
- [ ] **Project Settings → Auth** — set minimum password length to 8 in Supabase auth settings
- [ ] **Database Backups** — enable point-in-time recovery for production data

### 4. Deploy

```bash
git push origin main
```

Vercel deploys automatically on push.

---

## Supabase SQL Files Reference

```
supabase/
├── schema.sql                       # Core tables + indexes
├── phase4-auth.sql                  # Profiles + auth.users trigger
├── phase5-rls.sql                   # RLS policies (v1)
├── phase6-calendar.sql              # Calendar events
├── phase9-handoff.sql               # Templates table + handoff_note + seed templates
└── phase10-production-hardening.sql # RLS fixes (contacts DELETE/UPDATE, templates)
```

All files must be run in order. They are idempotent.

---

## Security Notes

- **Anon key** is intentionally public (NEXT_PUBLIC_). Security relies on Supabase RLS policies, not obscurity.
- **Service role key** is never used in this app and should never be added to client-side code.
- All routes require authentication. The middleware at `src/middleware.ts` enforces this.
- Members can only see/modify data for their own committee or records they created.
- Seed templates (is_default = true) are read-only for all non-admin users.

---

## Development Notes

- TypeScript strict mode is enabled. Run `node_modules/.bin/tsc --noEmit` to check types.
- The app uses optimistic updates for all mutations. Failures are caught and displayed via the `MutationErrorBanner` (bottom of screen).
- No external API calls. No AI features. No third-party analytics.
