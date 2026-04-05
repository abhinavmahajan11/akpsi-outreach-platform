'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import TagBadge from '@/components/ui/TagBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import OrgLogo from '@/components/ui/OrgLogo';
import ActivityTimeline from '@/features/activity/ActivityTimeline';
import ReminderModal from '@/features/reminders/ReminderModal';
import AddNoteModal from '@/features/notes/AddNoteModal';
import LogActivityModal from '@/features/activity/LogActivityModal';
import DraftEmailModal from '@/features/email/DraftEmailModal';
import Toast from '@/components/ui/Toast';
import { useOrgs } from '@/context/OrgsContext';

interface OrganizationDetailViewProps {
  orgId: string;
}

export default function OrganizationDetailView({ orgId }: OrganizationDetailViewProps) {
  const { getOrgById, addNote, addReminder, logActivity, loading, error } = useOrgs();
  const org = getOrgById(orgId);

  const primaryContact = org
    ? org.contacts.find((c) => c.isPrimary) ?? org.contacts[0]
    : undefined;

  // Modal open states
  const [reminderOpen, setReminderOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastOpen(true);
  }

  // Loading state — data hasn't arrived yet from Supabase
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#0d1f3c]/20 border-t-[#0d1f3c] rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading organization…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-rose-600 mb-1">Failed to load data</p>
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!org) notFound();

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200/80 px-8 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <Link
            href="/organizations"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Organizations
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">{org.name}</span>
        </div>
      </div>

      <div className="px-8 pt-6 pb-16">
        {/* Organization header */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-6 py-6 mb-5">
          <div className="flex items-start gap-4">
            <OrgLogo
              name={org.name}
              logoInitials={org.logoInitials}
              logoColor={org.logoColor}
              website={org.website}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                    {org.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {org.type} · {org.industry} · {org.location}
                  </p>
                </div>
                <StatusBadge status={org.status} />
              </div>

              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
                {org.description}
              </p>

              <div className="mt-3 flex items-center flex-wrap gap-1.5">
                {org.tags.map((tag) => (
                  <TagBadge key={tag} label={tag} />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
                <span>
                  <span className="font-medium text-slate-700">Committee</span>{' '}
                  {org.committeeOwner}
                </span>
                <span>
                  <span className="font-medium text-slate-700">Assigned to</span>{' '}
                  {org.assignedMember}
                </span>
                {org.lastContactedAt && (
                  <span>
                    <span className="font-medium text-slate-700">
                      Last contact
                    </span>{' '}
                    {new Date(org.lastContactedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {org.website && (
                  <span className="text-blue-600">{org.website}</span>
                )}
              </div>
            </div>
          </div>

          {/* Next step banner */}
          <div className="mt-5 rounded-xl bg-amber-50 ring-1 ring-amber-100 px-4 py-3.5 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-amber-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7.5l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Next Step</p>
              <p className="mt-0.5 text-sm text-amber-700 leading-relaxed">
                {org.nextStep}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setDraftOpen(true)}
                className="rounded-lg bg-[#0d1f3c] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1e3a5f] transition-colors"
              >
                Draft Email
              </button>
              <button
                onClick={() => setLogOpen(true)}
                className="rounded-lg bg-white ring-1 ring-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Log Action
              </button>
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-3 gap-5">
          {/* Left column (2/3) */}
          <div className="col-span-2 space-y-5">
            {/* Contacts */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-6 py-5">
              <SectionHeader
                title="Contacts"
                subtitle={`${org.contacts.length} contact${org.contacts.length !== 1 ? 's' : ''} on file`}
                action={
                  <button
                    onClick={() => showToast('Contact management coming soon')}
                    className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
                  >
                    Add contact
                  </button>
                }
              />
              {org.contacts.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {org.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-slate-600">
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800">
                            {contact.name}
                          </p>
                          {contact.isPrimary && (
                            <span className="rounded-full bg-[#0d1f3c]/8 text-[#0d1f3c] text-[10px] font-medium px-2 py-0.5">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{contact.title}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                          {contact.phone && (
                            <span className="text-xs text-slate-500">
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  No contacts added yet. Add a contact to get started.
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-6 py-5">
              <SectionHeader
                title="Notes"
                subtitle={`${org.notes.length} note${org.notes.length !== 1 ? 's' : ''}`}
                action={
                  <button
                    onClick={() => setNoteOpen(true)}
                    className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
                  >
                    Add note
                  </button>
                }
              />
              {org.notes.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {org.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl bg-slate-50 px-4 py-3.5"
                    >
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {note.content}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {note.authorName} ·{' '}
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No notes yet.</p>
              )}
            </div>

            {/* Relationship timeline */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-6 py-5">
              <SectionHeader
                title="Relationship Timeline"
                subtitle="Full outreach history"
              />
              <div className="mt-4">
                <ActivityTimeline items={org.recentActivity} />
              </div>
            </div>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-5">
            {/* Reminders */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-5 py-5">
              <SectionHeader
                title="Reminders"
                action={
                  <button
                    onClick={() => setReminderOpen(true)}
                    className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
                  >
                    Add
                  </button>
                }
              />
              {org.reminders.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {org.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`rounded-xl px-3.5 py-3 ${
                        reminder.isCompleted
                          ? 'bg-slate-50 opacity-50'
                          : 'bg-amber-50 ring-1 ring-amber-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${
                            reminder.isCompleted
                              ? 'bg-slate-300 border-slate-300'
                              : 'border-amber-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium leading-snug ${
                              reminder.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {reminder.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            Due{' '}
                            {new Date(reminder.dueDate).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                            {' · '}
                            {reminder.assignedTo}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  No reminders set.
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 px-5 py-5">
              <SectionHeader title="Actions" />
              <div className="mt-3 space-y-2">
                <ActionRow
                  label="Send Follow-Up Email"
                  onClick={() => setDraftOpen(true)}
                />
                <ActionRow
                  label="Log Outreach Activity"
                  onClick={() => setLogOpen(true)}
                />
                <ActionRow
                  label="Draft Email with AI"
                  accent
                  onClick={() => setDraftOpen(true)}
                />
                <ActionRow
                  label="Update Status"
                  onClick={() => showToast('Status update coming soon')}
                />
                <ActionRow
                  label="Add to Reminders"
                  onClick={() => setReminderOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        orgName={org.name}
        defaultTitle={org.nextStep}
        onSave={({ title, date, assignedTo }) => {
          addReminder(org.id, {
            id: `rem-${Date.now()}`,
            title,
            dueDate: new Date(date).toISOString(),
            isCompleted: false,
            assignedTo,
          });
          showToast('Reminder saved');
        }}
      />
      <AddNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        orgName={org.name}
        onSave={(content) => {
          addNote(org.id, {
            id: `note-${Date.now()}`,
            content,
            authorName: 'Priya Nair',
            createdAt: new Date().toISOString(),
          });
          showToast('Note added');
        }}
      />
      <LogActivityModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        orgName={org.name}
        onSave={({ type, title, description }) => {
          logActivity(org.id, {
            id: `act-${Date.now()}`,
            type: type as 'email' | 'call' | 'meeting' | 'note' | 'follow_up',
            title,
            description,
            date: new Date().toISOString(),
            authorName: 'Priya Nair',
          });
          showToast('Activity logged');
        }}
      />
      <DraftEmailModal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        orgName={org.name}
        contactName={primaryContact?.name ?? 'there'}
        contactEmail={primaryContact?.email}
        onCopy={() => showToast('Email copied to clipboard')}
      />

      <Toast
        open={toastOpen}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

function ActionRow({
  label,
  accent = false,
  onClick,
}: {
  label: string;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center justify-between group ${
        accent
          ? 'bg-[#0d1f3c] text-white hover:bg-[#1e3a5f]'
          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
      <svg
        className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
          accent ? 'text-white/60' : 'text-slate-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  );
}
