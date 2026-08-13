-- =============================================================================
-- AKPsi Outreach Platform — Phase 9: Semester Handoff + Templates
-- Apply in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ─── 1. Add handoff_note column to organizations ──────────────────────────────

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS handoff_note TEXT NOT NULL DEFAULT '';

-- ─── 2. Templates table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS templates (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT        NOT NULL,
  description         TEXT        NOT NULL DEFAULT '',
  body                TEXT        NOT NULL DEFAULT '',
  category            TEXT        NOT NULL DEFAULT 'general',
  -- TRUE for the seeded/built-in templates that ship with the platform
  is_default          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by_user_id  UUID        REFERENCES auth.users ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS trg_templates_updated_at ON templates;
CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 3. RLS for templates ─────────────────────────────────────────────────────

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Leadership: full access to all templates
CREATE POLICY "templates_leadership_all" ON templates
  FOR ALL
  USING (get_my_role() IN ('admin', 'president', 'vice_president'))
  WITH CHECK (get_my_role() IN ('admin', 'president', 'vice_president'));

-- Members: read all templates (they need to use them)
CREATE POLICY "templates_member_select" ON templates
  FOR SELECT
  USING (get_my_role() = 'member');

-- Members: create their own templates
CREATE POLICY "templates_member_insert" ON templates
  FOR INSERT
  WITH CHECK (
    get_my_role() = 'member'
    AND created_by_user_id = auth.uid()
  );

-- Members: edit their own non-default templates
CREATE POLICY "templates_member_update_own" ON templates
  FOR UPDATE
  USING (
    get_my_role() = 'member'
    AND created_by_user_id = auth.uid()
    AND is_default = FALSE
  );

-- Members: delete their own non-default templates
CREATE POLICY "templates_member_delete_own" ON templates
  FOR DELETE
  USING (
    get_my_role() = 'member'
    AND created_by_user_id = auth.uid()
    AND is_default = FALSE
  );

-- ─── 4. Seed default templates ────────────────────────────────────────────────
-- Using fixed UUIDs so this block is idempotent (safe to re-run).

INSERT INTO templates (id, title, description, body, category, is_default) VALUES

-- Sponsorship Outreach
('11111111-0000-0000-0000-000000000001',
 'Sponsorship Cold Outreach',
 'First contact email to a potential sponsor. Works for finance, consulting, and tech companies.',
 E'Hi {{contact_name}},\n\nMy name is {{your_name}}, and I''m reaching out on behalf of Alpha Kappa Psi (AKPsi), the professional business fraternity at [University]. We''re building our Spring semester partner roster and believe {{organization_name}} would be a great fit for a few of our upcoming events.\n\nWe''re planning a [Finance/Consulting/Tech] workshop and are looking for industry partners who would like to:\n- Host a speaking panel or info session with our members\n- Sponsor a networking event (~40–80 attendees)\n- Connect with motivated, business-focused students for recruiting\n\nOur members include a mix of Finance, Accounting, Marketing, and Business majors — many actively exploring internship and full-time opportunities. Past sponsors have reported strong candidate pipelines and positive brand presence on campus.\n\nI''d love to find 20 minutes to share more details. Would any time this week or next work for a quick call?\n\nBest,\n{{your_name}}\nAlpha Kappa Psi — [University Chapter]',
 'sponsorship_outreach', TRUE),

-- Recruiter Outreach
('11111111-0000-0000-0000-000000000002',
 'Recruiter / Hiring Team Outreach',
 'Cold intro email to a company''s campus recruiting or HR team.',
 E'Hi {{contact_name}},\n\nI hope this finds you well. I''m {{your_name}}, a member of Alpha Kappa Psi at [University] — one of the largest and most active professional business fraternities in the country.\n\nWe''re reaching out to companies like {{organization_name}} that align well with our members'' professional interests. Our chapter has 60+ active members across Finance, Marketing, Operations, and Consulting — many actively exploring internship and full-time opportunities.\n\nWe''d love to explore hosting an info session, recruiting mixer, or on-campus interview day with your team. Past recruiting partners have found our members to be well-prepared and genuinely engaged.\n\nWould you be open to a 15–20 minute intro call in the next two weeks?\n\nThank you for your time,\n{{your_name}}\nAlpha Kappa Psi — [University]',
 'recruiter_outreach', TRUE),

-- Follow-Up
('11111111-0000-0000-0000-000000000003',
 'Follow-Up (No Response)',
 'Friendly follow-up when a contact hasn''t replied to the initial email. Send 7–10 days after first contact.',
 E'Hi {{contact_name}},\n\nI wanted to follow up on my previous note about a potential partnership between Alpha Kappa Psi and {{organization_name}}. I know schedules get busy, so I didn''t want this to fall through the cracks.\n\nWe''re still very interested in exploring [event/sponsorship/recruiting] opportunities with your team. If the timing isn''t right for this semester, I''d also love to stay in touch for the Fall.\n\nWould a quick 15-minute call work anytime this week or next? Happy to work around your schedule.\n\nThanks again,\n{{your_name}}\nAlpha Kappa Psi — [University]',
 'follow_up', TRUE),

-- Workshop/Speaker
('11111111-0000-0000-0000-000000000004',
 'Workshop / Speaker Request',
 'Invite someone from a company to speak or run a workshop for members.',
 E'Hi {{contact_name}},\n\nMy name is {{your_name}}, and I''m a member of Alpha Kappa Psi at [University]. I''m reaching out because we''re looking for speakers and workshop leaders for our Spring professional development series.\n\nWe''re interested in hosting someone from {{organization_name}} for a session on [topic — e.g., breaking into consulting, navigating early-career finance, career growth in tech]. Our events typically draw 30–60 engaged members with strong interest in [industry].\n\nThese sessions are designed to be practical and conversational — more workshop than lecture. We handle all logistics and promotion. The time commitment is usually 45–60 minutes on campus or via Zoom.\n\nWould a brief call work this week to explore this further?\n\nBest,\n{{your_name}}\nAlpha Kappa Psi — [University]',
 'workshop_speaker', TRUE),

-- Service Partnership
('11111111-0000-0000-0000-000000000005',
 'Nonprofit / Service Partnership Outreach',
 'Cold intro email to a nonprofit or community organization for a service partnership.',
 E'Hi {{contact_name}},\n\nI''m {{your_name}}, a member of Alpha Kappa Psi at [University]. Our chapter''s Community Service committee is looking to build a meaningful service partnership this semester, and {{organization_name}} stood out as an organization doing impactful work.\n\nWe''re interested in organizing:\n- A one-time volunteer event (15–30 members)\n- An ongoing monthly service commitment\n- A fundraising drive or awareness campaign on campus\n\nOur chapter logs 1,000+ service hours annually and has a strong track record with past service partners. We''re flexible on format and happy to work around your needs.\n\nWould you be open to a brief conversation about what a collaboration might look like?\n\nLooking forward to hearing from you,\n{{your_name}}\nAlpha Kappa Psi — [University]',
 'service_partnership', TRUE),

-- Thank You
('11111111-0000-0000-0000-000000000006',
 'Post-Event Thank You',
 'Thank-you email to send after a successful event or partnership. Keeps the relationship warm.',
 E'Hi {{contact_name}},\n\nThank you so much for [partnering with us / speaking at our event / hosting our members] — it was a great experience for our chapter.\n\n[Add a specific detail about what made it memorable or impactful here.]\n\nOur members genuinely appreciated the opportunity to connect with the team at {{organization_name}}, and many have already [followed up / applied / expressed interest in learning more].\n\nWe hope this is the beginning of an ongoing relationship. We''d love to stay in touch as we plan our Fall semester calendar and explore ways to keep working together.\n\nWith appreciation,\n{{your_name}}\nAlpha Kappa Psi — [University]',
 'thank_you', TRUE),

-- Best Practices Playbook
('11111111-0000-0000-0000-000000000007',
 'Outreach Best Practices Playbook',
 'Guidance on timing, follow-up cadence, sponsor conversations, and handoff tips. Not an email — share with your committee.',
 E'OUTREACH BEST PRACTICES — AKPsi Semester Playbook\n\n─── TIMING ───────────────────────────────────────────────────────\n• Reach out in the first 3 weeks of the semester for best response rates\n• Send follow-ups 7–10 days after the initial email (not sooner)\n• Avoid Fridays and finals/midterms windows\n• Tue–Thu mornings (9am–11am) get the best open rates\n\n─── FIRST CONTACT ────────────────────────────────────────────────\n• Personalize the first line — reference something specific about the company\n• Lead with value to them, not a request from you\n• Keep the initial email under 200 words\n• One clear call-to-action (usually a 15-minute call)\n\n─── FOLLOW-UP CADENCE ────────────────────────────────────────────\n• Day 1: Initial outreach\n• Day 8–10: First follow-up\n• Day 18–21: Second follow-up (final)\n• After 3 attempts with no response → mark "No Contact," revisit next semester\n\n─── SPONSOR CONVERSATIONS ────────────────────────────────────────\n• Know their fiscal year calendar before pitching\n• Lead with event specifics (date, format, attendee count) before pricing\n• Offer tiered options — not everyone can do $5K but many can do $500–$1K\n• Get verbal commitment before sending a formal agreement\n\n─── HANDOFF TIPS ─────────────────────────────────────────────────\n• Log every interaction in the timeline — future chairs depend on this\n• Add handoff notes to any org with 2+ semesters of history\n• Mark strong leads clearly in the status field before end of semester\n• Leave a "next semester" note for any org you couldn''t close this semester\n• The best handoff is a platform full of accurate, up-to-date information',
 'best_practices', TRUE)

ON CONFLICT (id) DO NOTHING;
