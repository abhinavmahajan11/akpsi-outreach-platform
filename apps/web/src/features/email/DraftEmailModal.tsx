'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface DraftEmailModalProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  orgName?: string;
  contactName?: string;
  contactEmail?: string;
  /** Called when user explicitly marks the email as sent. */
  onMarkSent: (subject: string, body: string) => void;
}

const draftKey = (orgId: string) => `email_draft_${orgId}`;

function defaultSubject(orgName: string): string {
  return `AKPsi Partnership Inquiry — ${orgName}`;
}

function defaultBody(orgName: string, contactName: string): string {
  const firstName = contactName.split(' ')[0] ?? contactName;
  return `Hi ${firstName},

I hope you're doing well! I'm reaching out on behalf of Alpha Kappa Psi (AKPsi), the professional business fraternity at our university.

We've been following ${orgName}'s work closely and believe there's a strong alignment between our chapter's goals and what your team is doing. We'd love to explore potential partnership opportunities — whether that's a recruiting info session, workshop, or sponsorship arrangement.

Would you be open to a brief 20-minute call in the next week or two to discuss?

Looking forward to hearing from you.

Best,
[Your Name]
[Committee] — AKPsi`;
}

export default function DraftEmailModal({
  open,
  onClose,
  orgId,
  orgName = 'this organization',
  contactName = 'there',
  contactEmail,
  onMarkSent,
}: DraftEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved draft (or reset to defaults) each time the modal opens
  useEffect(() => {
    if (!open) return;
    const raw = localStorage.getItem(draftKey(orgId));
    if (raw) {
      try {
        const saved = JSON.parse(raw) as { subject: string; body: string };
        setSubject(saved.subject);
        setBody(saved.body);
        setHasDraft(true);
      } catch {
        resetToTemplate();
      }
    } else {
      resetToTemplate();
    }
    setDraftSaved(false);
    setCopied(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orgId]);

  function resetToTemplate() {
    setSubject(defaultSubject(orgName));
    setBody(defaultBody(orgName, contactName));
    setHasDraft(false);
  }

  function handleSaveDraft() {
    localStorage.setItem(draftKey(orgId), JSON.stringify({ subject, body }));
    setHasDraft(true);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }

  function handleClearDraft() {
    localStorage.removeItem(draftKey(orgId));
    resetToTemplate();
  }

  function handleCopy() {
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleMarkSent() {
    onMarkSent(subject, body);
    localStorage.removeItem(draftKey(orgId));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Compose Email" maxWidth="max-w-xl">
      <div className="space-y-3">
        {/* Recipient row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            To:{' '}
            <span className="font-medium text-slate-700">
              {contactName}
              {contactEmail ? ` · ${contactEmail}` : ''}
            </span>
          </p>
          {hasDraft && (
            <button
              onClick={handleClearDraft}
              className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear draft
            </button>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={11}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[12px] text-slate-800 leading-relaxed focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 resize-none font-mono"
          />
        </div>

        <p className="text-[11px] text-slate-400">
          Copy or open externally, then click{' '}
          <span className="font-medium text-slate-500">Mark as Sent</span> to
          log the outreach.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
        {/* Left: save / reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className={`text-xs font-medium transition-colors ${
              draftSaved
                ? 'text-emerald-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {draftSaved ? '✓ Saved' : 'Save draft'}
          </button>
          {hasDraft && (
            <button
              onClick={resetToTemplate}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {contactEmail && (
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Open in Mail
            </a>
          )}

          <button
            onClick={handleMarkSent}
            className="px-3 py-1.5 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors"
          >
            Mark as Sent
          </button>
        </div>
      </div>
    </Modal>
  );
}
