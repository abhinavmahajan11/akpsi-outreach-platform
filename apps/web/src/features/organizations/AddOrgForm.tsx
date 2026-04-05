'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrgs } from '@/context/OrgsContext';
import type {
  Organization,
  OrganizationType,
  CommitteeType,
  OutreachStatus,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOGO_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

function pickColor(name: string): string {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now().toString(36)
  );
}

const STATUS_VALUES: Record<string, OutreachStatus> = {
  'No Contact': 'no_contact',
  'In Progress': 'in_progress',
  'Pending Response': 'pending_response',
  'Active Partner': 'active_partner',
  Completed: 'completed',
  Declined: 'declined',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddOrgForm() {
  const router = useRouter();
  const { addOrg } = useOrgs();

  // Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('Corporate');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Ownership
  const [committee, setCommittee] =
    useState<CommitteeType>('Professional Development');
  const [assignedMember, setAssignedMember] = useState('');

  // Status
  const [statusLabel, setStatusLabel] = useState('No Contact');
  const [nextStep, setNextStep] = useState('');
  const [lastContacted, setLastContacted] = useState('');

  // Primary contact
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Organization name is required.';
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errs.contactEmail = 'Enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const id = slugify(name.trim());
    const contacts = contactName.trim()
      ? [
          {
            id: `${id}-contact-1`,
            name: contactName.trim(),
            title: contactTitle.trim() || 'Contact',
            email: contactEmail.trim(),
            isPrimary: true,
          },
        ]
      : [];

    const newOrg: Organization = {
      id,
      name: name.trim(),
      logoInitials: getInitials(name.trim()),
      logoColor: pickColor(name.trim()),
      type,
      industry: industry.trim() || 'Unknown',
      location: location.trim() || 'Unknown',
      status: STATUS_VALUES[statusLabel],
      tags: [],
      committeeOwner: committee,
      assignedMember: assignedMember.trim() || 'Unassigned',
      description: description.trim() || `Outreach tracking for ${name.trim()}.`,
      website: website.trim() || undefined,
      nextStep: nextStep.trim() || 'No next step defined.',
      lastContactedAt: lastContacted
        ? new Date(lastContacted).toISOString()
        : undefined,
      contacts,
      notes: [],
      reminders: [],
      recentActivity: [
        {
          id: `${id}-act-1`,
          type: 'note',
          title: 'Organization added to platform',
          description: 'Created via Add Organization form.',
          date: new Date().toISOString(),
          authorName: assignedMember.trim() || 'Priya Nair',
        },
      ],
    };

    addOrg(newOrg);
    router.push(`/organizations/${id}`);
  }

  const isValid = name.trim().length > 0;

  return (
    <div className="px-8 pt-8 pb-16 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/organizations" className="text-slate-500 hover:text-slate-700">
          Organizations
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-medium">Add Organization</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Add Organization
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track a new company, nonprofit, or partner for outreach.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">

          {/* ── Basic Information ── */}
          <section className="px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <Field
                label="Organization Name"
                required
                error={errors.name}
              >
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
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as OrganizationType)}
                    className={inputCls(false)}
                  >
                    {(
                      [
                        'Corporate',
                        'Nonprofit',
                        'Sponsor',
                        'Service Partner',
                        'Event Host',
                        'Fundraiser Collaborator',
                      ] as OrganizationType[]
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
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
            </div>
          </section>

          {/* ── Ownership ── */}
          <section className="px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Ownership
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Committee Owner">
                <select
                  value={committee}
                  onChange={(e) =>
                    setCommittee(e.target.value as CommitteeType)
                  }
                  className={inputCls(false)}
                >
                  {(
                    [
                      'Professional Development',
                      'Community Service',
                      'Brotherhood',
                      'Fundraising',
                      'Marketing',
                      'Alumni Relations',
                    ] as CommitteeType[]
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
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
          </section>

          {/* ── Outreach Status ── */}
          <section className="px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Outreach Status
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Initial Status">
                <select
                  value={statusLabel}
                  onChange={(e) => setStatusLabel(e.target.value)}
                  className={inputCls(false)}
                >
                  {Object.keys(STATUS_VALUES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
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
            <div className="mt-4">
              <Field label="Next Step">
                <input
                  type="text"
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="e.g. Send intro email to recruiting team"
                  className={inputCls(false)}
                />
              </Field>
            </div>
          </section>

          {/* ── Primary Contact ── */}
          <section className="px-6 py-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              Primary Contact
            </h2>
            <p className="text-xs text-slate-400 mb-4">Optional — add later from the organization detail page.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Name">
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
              <Field label="Email" error={errors.contactEmail}>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. tkim@company.com"
                  className={inputCls(!!errors.contactEmail)}
                />
              </Field>
            </div>
          </section>

          {/* ── Footer actions ── */}
          <section className="px-6 py-4 bg-slate-50 rounded-b-2xl flex items-center justify-between">
            <Link
              href="/organizations"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
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
          </section>
        </div>
      </form>
    </div>
  );
}

// ─── Small field wrapper ───────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-rose-500">{error}</p>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border ${
    hasError ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-[#0d1f3c]/40'
  } px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
    hasError ? 'focus:ring-rose-300/20' : 'focus:ring-[#0d1f3c]/20'
  } bg-white transition-colors`;
}
