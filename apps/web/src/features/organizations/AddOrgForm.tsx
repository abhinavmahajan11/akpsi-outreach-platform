'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrgs } from '@/context/OrgsContext';
import { useAuth } from '@/context/AuthContext';
import type {
  Organization,
  OrganizationType,
  CommitteeType,
  OutreachStatus,
  Contact,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOGO_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#06b6d4',
];

function pickColor(name: string): string {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

const ORG_TYPES: OrganizationType[] = [
  'Corporate', 'Nonprofit', 'Sponsor', 'Service Partner', 'Event Host', 'Fundraiser Collaborator',
];

const COMMITTEES: CommitteeType[] = [
  'Professional Development', 'Community Service', 'Brotherhood',
  'Fundraising', 'Marketing', 'Alumni Relations',
];

const STATUS_OPTIONS: { label: string; value: OutreachStatus }[] = [
  { label: 'No Contact',       value: 'no_contact' },
  { label: 'In Progress',      value: 'in_progress' },
  { label: 'Pending Response', value: 'pending_response' },
  { label: 'Active Partner',   value: 'active_partner' },
  { label: 'Completed',        value: 'completed' },
  { label: 'Declined',         value: 'declined' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddOrgForm() {
  const router = useRouter();
  const { addOrg } = useOrgs();
  const { displayName } = useAuth();

  // ── Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('Corporate');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // ── Tags chip input
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);

  // ── Ownership
  const [committee, setCommittee] = useState<CommitteeType>('Professional Development');
  const [assignedMember, setAssignedMember] = useState('');

  // ── Status
  const [status, setStatus] = useState<OutreachStatus>('no_contact');
  const [nextStep, setNextStep] = useState('');
  const [lastContacted, setLastContacted] = useState('');

  // ── Primary contact (optional)
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedIn, setContactLinkedIn] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Tag helpers ─────────────────────────────────────────────────────────────

  function commitTag(raw: string) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Organization name is required.';
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errs.contactEmail = 'Enter a valid email address.';
    }
    if (contactLinkedIn && !contactLinkedIn.includes('linkedin.com') && !contactLinkedIn.startsWith('http')) {
      // Allow partial LinkedIn handles too — only warn on clearly wrong values
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Commit any pending tag
    if (tagInput.trim()) commitTag(tagInput);
    if (!validate()) return;
    setSaving(true);

    const id = slugify(name.trim());

    const contacts: Contact[] = contactName.trim()
      ? [{
          id: `${id}-c1`,
          name: contactName.trim(),
          title: contactTitle.trim() || 'Contact',
          email: contactEmail.trim(),
          phone: contactPhone.trim() || undefined,
          linkedIn: contactLinkedIn.trim() || undefined,
          isPrimary: true,
        }]
      : [];

    const newOrg: Organization = {
      id,
      name: name.trim(),
      logoInitials: getInitials(name.trim()),
      logoColor: pickColor(name.trim()),
      type,
      industry: industry.trim() || 'Unknown',
      location: location.trim() || 'Unknown',
      status,
      tags,
      committeeOwner: committee,
      assignedMember: assignedMember.trim() || 'Unassigned',
      description: description.trim() || `Outreach tracking for ${name.trim()}.`,
      website: website.trim() || undefined,
      nextStep: nextStep.trim() || 'No next step defined.',
      lastContactedAt: lastContacted ? new Date(lastContacted).toISOString() : undefined,
      contacts,
      notes: [],
      reminders: [],
      recentActivity: [{
        id: `${id}-act-1`,
        type: 'note',
        title: 'Organization added to platform',
        description: 'Created via Add Organization form.',
        date: new Date().toISOString(),
        authorName: assignedMember.trim() || displayName,
      }],
    };

    try {
      await addOrg(newOrg);
      router.push(`/organizations/${id}`);
    } catch {
      setErrors({ name: 'Failed to save — please check your connection and try again.' });
      setSaving(false);
    }
  }

  const isValid = name.trim().length > 0;

  return (
    <div className="px-8 pt-8 pb-16 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/organizations" className="text-slate-500 hover:text-slate-700 transition-colors">
          Organizations
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Add Organization</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Add Organization</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track a new company, nonprofit, or partner for outreach.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">

          {/* ── Basic Information ─────────────────────────────────────────── */}
          <Section title="Basic Information">
            <Field label="Organization Name" required error={errors.name}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google, Make-A-Wish Foundation"
                className={inputCls(!!errors.name)}
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select value={type} onChange={(e) => setType(e.target.value as OrganizationType)} className={inputCls(false)}>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Industry">
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology, Finance"
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Website">
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. google.com"
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this organization and the partnership opportunity…"
                rows={3}
                className={`${inputCls(false)} resize-none`}
              />
            </Field>

            {/* Tags */}
            <Field label="Tags" hint="Press Enter or comma to add — e.g. sponsor, tech, recurring">
              <div
                className="flex flex-wrap gap-1.5 min-h-[38px] w-full rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white cursor-text focus-within:border-[#0d1f3c]/40 focus-within:ring-1 focus-within:ring-[#0d1f3c]/20 transition-colors"
                onClick={() => tagRef.current?.focus()}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#0d1f3c]/6 text-[#0d1f3c] text-xs font-medium px-2 py-0.5 rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                      className="text-[#0d1f3c]/40 hover:text-[#0d1f3c]/80 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={tagRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => { if (tagInput.trim()) commitTag(tagInput); }}
                  placeholder={tags.length === 0 ? 'sponsor, tech, recurring…' : ''}
                  className="flex-1 min-w-[80px] text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent py-0.5"
                />
              </div>
            </Field>
          </Section>

          {/* ── Ownership ─────────────────────────────────────────────────── */}
          <Section title="Ownership">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Committee Owner">
                <select
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value as CommitteeType)}
                  className={inputCls(false)}
                >
                  {COMMITTEES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Assigned Member">
                <input
                  type="text"
                  value={assignedMember}
                  onChange={(e) => setAssignedMember(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </Section>

          {/* ── Outreach Status ───────────────────────────────────────────── */}
          <Section title="Outreach Status">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Initial Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OutreachStatus)}
                  className={inputCls(false)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Last Contacted">
                <input
                  type="date"
                  value={lastContacted}
                  onChange={(e) => setLastContacted(e.target.value)}
                  className={inputCls(false)}
                />
              </Field>
            </div>
            <Field label="Next Step">
              <input
                type="text"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="e.g. Send intro email to recruiting team"
                className={inputCls(false)}
              />
            </Field>
          </Section>

          {/* ── Primary Contact ───────────────────────────────────────────── */}
          <Section
            title="Primary Contact"
            subtitle="Optional — add more contacts later from the organization page."
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Taylor Kim"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Title / Role">
                <input
                  type="text"
                  value={contactTitle}
                  onChange={(e) => setContactTitle(e.target.value)}
                  placeholder="e.g. Recruiting Manager"
                  className={inputCls(false)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" error={errors.contactEmail}>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. tkim@company.com"
                  className={inputCls(!!errors.contactEmail)}
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. (555) 555-0100"
                  className={inputCls(false)}
                />
              </Field>
            </div>
            <Field label="LinkedIn URL">
              <input
                type="text"
                value={contactLinkedIn}
                onChange={(e) => setContactLinkedIn(e.target.value)}
                placeholder="e.g. linkedin.com/in/taylorkim"
                className={inputCls(false)}
              />
            </Field>
          </Section>

          {/* ── Footer actions ────────────────────────────────────────────── */}
          <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between">
            <Link
              href="/organizations"
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid || saving}
              className="rounded-xl bg-[#0d1f3c] px-5 py-2 text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : 'Save Organization'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 py-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return `w-full rounded-lg border ${
    hasError ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#0d1f3c]/40'
  } px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
    hasError ? 'focus:ring-rose-300/20' : 'focus:ring-[#0d1f3c]/20'
  } bg-white transition-colors`;
}
