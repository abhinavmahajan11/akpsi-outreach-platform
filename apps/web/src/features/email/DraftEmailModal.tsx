'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface DraftEmailModalProps {
  open: boolean;
  onClose: () => void;
  orgName?: string;
  contactName?: string;
  contactEmail?: string;
  onCopy: () => void;
}

function buildDraft(orgName: string, contactName: string): string {
  const firstName = contactName.split(' ')[0] ?? contactName;
  return `Hi ${firstName},

I hope you're doing well! My name is Priya Nair and I'm reaching out on behalf of Alpha Kappa Psi (AKPsi), the professional business fraternity at our university.

We've been following ${orgName}'s work closely and believe there's a strong alignment between our chapter's goals and what your team is doing. We'd love to explore potential partnership opportunities — whether that's a recruiting info session, workshop, or sponsorship arrangement.

Would you be open to a brief 20-minute call in the next week or two to discuss?

Looking forward to hearing from you.

Best,
Priya Nair
VP, Professional Development — AKPsi`;
}

export default function DraftEmailModal({
  open,
  onClose,
  orgName = 'this organization',
  contactName = 'there',
  contactEmail,
  onCopy,
}: DraftEmailModalProps) {
  const [draft, setDraft] = useState(() => buildDraft(orgName, contactName));

  // Regenerate when org/contact changes
  const freshDraft = buildDraft(orgName, contactName);

  function handleCopy() {
    navigator.clipboard.writeText(draft || freshDraft).then(() => {
      onCopy();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Draft Email" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">
              To:{' '}
              <span className="font-medium text-slate-700">
                {contactName}
                {contactEmail ? ` · ${contactEmail}` : ''}
              </span>
            </p>
          </div>
          <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
            AI Draft
          </span>
        </div>

        <textarea
          value={draft || freshDraft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 leading-relaxed focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 resize-none font-mono text-[12px]"
        />

        <p className="text-[11px] text-slate-400">
          Edit freely — click Copy to clipboard when ready.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setDraft(freshDraft)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          ↺ Regenerate
        </button>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}?subject=AKPsi Partnership Inquiry&body=${encodeURIComponent(draft || freshDraft)}`}
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Open in Mail
            </a>
          )}
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </Modal>
  );
}
