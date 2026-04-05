'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface AddNoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  orgName?: string;
}

export default function AddNoteModal({
  open,
  onClose,
  onSave,
  orgName,
}: AddNoteModalProps) {
  const [content, setContent] = useState('');

  function handleSave() {
    if (!content.trim()) return;
    onSave(content.trim());
    setContent('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Note">
      {orgName && (
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          For <span className="font-medium text-slate-700">{orgName}</span>
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Note <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add context, observations, or follow-up information…"
            rows={5}
            autoFocus
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 resize-none"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Saved as <span className="font-medium text-slate-600">Priya Nair</span> · visible to all committee members
        </p>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Note
        </button>
      </div>
    </Modal>
  );
}
