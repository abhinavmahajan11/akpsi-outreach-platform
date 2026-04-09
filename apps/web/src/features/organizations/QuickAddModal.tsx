'use client';

/**
 * QuickAddModal — global quick-add shortcut accessible from the sidebar.
 *
 * Two paths:
 *   1. "New Organization" → navigates to /organizations/new (full form)
 *   2. "Add Contact"      → inline form with org selector + contact fields
 */

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { useOrgs } from '@/context/OrgsContext';
import type { Contact, CommitteeType, OrganizationType, OutreachStatus } from '@/types';

// ─── Mode ─────────────────────────────────────────────────────────────────────

type Mode = 'choose' | 'contact' | 'org';

// ─── Helper ───────────────────────────────────────────────────────────────────

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
];
const LOGO_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#6366f1','#14b8a6','#f97316','#06b6d4',
];
function pickColor(name: string) {
  const h = [...name].reduce((a,c) => a+c.charCodeAt(0),0);
  return LOGO_COLORS[h % LOGO_COLORS.length];
}
function getInitials(n: string) {
  return n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
}
function slugify(n: string) {
  return n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now().toString(36);
}

// ─── Choose screen ────────────────────────────────────────────────────────────

function ChooseScreen({ onMode }: { onMode: (m: Mode) => void }) {
  return (
    <div className="py-2 space-y-3">
      <p className="text-xs text-slate-500 mb-5">What would you like to add?</p>

      <button
        onClick={() => onMode('org')}
        className="w-full flex items-start gap-3.5 rounded-xl bg-[#0d1f3c] px-4 py-4 text-left hover:bg-[#1e3a5f] transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">New Organization</p>
          <p className="mt-0.5 text-xs text-white/50">Company, nonprofit, sponsor, or partner</p>
        </div>
        <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 ml-auto mt-1 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <button
        onClick={() => onMode('contact')}
        className="w-full flex items-start gap-3.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-4 text-left hover:bg-slate-100 hover:ring-slate-300 transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 leading-tight">Add Contact</p>
          <p className="mt-0.5 text-xs text-slate-500">Recruiter, sponsor rep, or nonprofit contact</p>
        </div>
        <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto mt-1 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}

// ─── Quick Org form (inline, minimal — full form is at /organizations/new) ────

function QuickOrgScreen({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addOrg } = useOrgs();

  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('Corporate');
  const [committee, setCommittee] = useState<CommitteeType>('Professional Development');
  const [status, setStatus] = useState<OutreachStatus>('no_contact');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [useFullForm, setUseFullForm] = useState(false);

  if (useFullForm) {
    router.push('/organizations/new');
    onClose();
    return null;
  }

  async function handleSave() {
    if (!name.trim()) { setErrors({ name: 'Name is required.' }); return; }
    setSaving(true);
    const id = slugify(name.trim());
    try {
      await addOrg({
        id,
        name: name.trim(),
        logoInitials: getInitials(name.trim()),
        logoColor: pickColor(name.trim()),
        type,
        industry: 'Unknown',
        location: 'Unknown',
        status,
        tags: [],
        committeeOwner: committee,
        assignedMember: 'Unassigned',
        description: `Outreach tracking for ${name.trim()}.`,
        nextStep: 'No next step defined.',
        contacts: [],
        notes: [],
        reminders: [],
        recentActivity: [{
          id: `${id}-act-1`,
          type: 'note',
          title: 'Organization added to platform',
          description: 'Created via Quick Add.',
          date: new Date().toISOString(),
          authorName: 'Quick Add',
        }],
      });
      onClose();
      router.push(`/organizations/${id}`);
    } catch {
      setErrors({ name: 'Failed to save. Try again.' });
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      <p className="text-xs text-slate-500 mb-1">
        Fill in the essentials — you can add details on the org page.
      </p>

      <Field label="Organization Name" required error={errors.name}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Google, Make-A-Wish Foundation"
          autoFocus
          className={inputCls(!!errors.name)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as OrganizationType)} className={inputCls(false)}>
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as OutreachStatus)} className={inputCls(false)}>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Committee Owner">
        <select value={committee} onChange={(e) => setCommittee(e.target.value as CommitteeType)} className={inputCls(false)}>
          {COMMITTEES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <button
        type="button"
        onClick={() => setUseFullForm(true)}
        className="text-xs text-[#0d1f3c]/60 hover:text-[#0d1f3c] transition-colors"
      >
        Need more fields? Use the full form →
      </button>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save Organization'}
        </button>
      </div>
    </div>
  );
}

// ─── Quick Contact form ───────────────────────────────────────────────────────

function QuickContactScreen({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  const { organizations, addContact } = useOrgs();

  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [orgSearch, setOrgSearch] = useState('');
  const [orgDropOpen, setOrgDropOpen] = useState(false);
  const orgRef = useRef<HTMLDivElement>(null);

  // Sort orgs by name for display
  const filteredOrgs = organizations
    .filter((o) => o.name.toLowerCase().includes(orgSearch.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name))
    .slice(0, 8);

  const selectedOrg = organizations.find((o) => o.id === orgId);

  function handleSave() {
    const errs: Record<string,string> = {};
    if (!orgId) errs.org = 'Select an organization.';
    if (!name.trim()) errs.name = 'Full name is required.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const contact: Contact = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name: name.trim(),
      title: title.trim() || 'Contact',
      email: email.trim(),
      phone: phone.trim() || undefined,
      linkedIn: linkedIn.trim() || undefined,
      isPrimary,
    };
    addContact(orgId, contact);
    onClose();
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />

      {/* Org selector */}
      <Field label="Organization" required error={errors.org}>
        <div className="relative" ref={orgRef}>
          <div
            className={`flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-sm cursor-pointer ${
              errors.org ? 'border-rose-300' : 'border-slate-200 hover:border-slate-300'
            } bg-white transition-colors`}
            onClick={() => setOrgDropOpen(true)}
          >
            {selectedOrg ? (
              <>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: selectedOrg.logoColor }}
                >
                  {selectedOrg.logoInitials}
                </div>
                <span className="flex-1 text-slate-900">{selectedOrg.name}</span>
              </>
            ) : (
              <span className="flex-1 text-slate-400">Select organization…</span>
            )}
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {orgDropOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search…"
                  autoFocus
                  className="w-full text-sm px-2 py-1 rounded-md border border-slate-200 focus:outline-none focus:border-[#0d1f3c]/40"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredOrgs.length === 0 ? (
                  <p className="text-xs text-slate-400 px-3 py-3">No organizations found.</p>
                ) : filteredOrgs.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { setOrgId(o.id); setOrgDropOpen(false); setOrgSearch(''); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: o.logoColor }}
                    >
                      {o.logoInitials}
                    </div>
                    <span className="flex-1 truncate text-slate-800">{o.name}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{o.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Field>

      {/* Contact fields */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" required error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Taylor Kim"
            className={inputCls(!!errors.name)}
          />
        </Field>
        <Field label="Title / Role">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Recruiter"
            className={inputCls(false)}
          />
        </Field>
      </div>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. tkim@company.com"
          className={inputCls(!!errors.email)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" className={inputCls(false)} />
        </Field>
        <Field label="LinkedIn">
          <input type="text" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="linkedin.com/in/…" className={inputCls(false)} />
        </Field>
      </div>

      {/* Primary toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <div
          onClick={() => setIsPrimary((v) => !v)}
          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${isPrimary ? 'bg-[#0d1f3c]' : 'bg-slate-200'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isPrimary ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-xs font-medium text-slate-700">Set as primary contact</span>
      </label>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !orgId}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Contact
        </button>
      </div>
    </div>
  );
}

// ─── Main exported component ─────────────────────────────────────────────────

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

export default function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [mode, setMode] = useState<Mode>('choose');

  // Reset to chooser when modal opens
  useEffect(() => {
    if (open) setMode('choose');
  }, [open]);

  const title =
    mode === 'choose' ? 'Quick Add' :
    mode === 'org'    ? 'New Organization' :
                        'Add Contact';

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      {mode === 'choose' && <ChooseScreen onMode={setMode} />}
      {mode === 'org'    && <QuickOrgScreen onBack={() => setMode('choose')} onClose={onClose} />}
      {mode === 'contact' && <QuickContactScreen onBack={() => setMode('choose')} onClose={onClose} />}
    </Modal>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors -mt-1 mb-1"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back
    </button>
  );
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
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
