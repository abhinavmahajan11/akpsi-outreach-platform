'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

const ACTIVITY_TYPES = [
  { value: 'email',   label: 'Email' },
  { value: 'call',    label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note',    label: 'Internal Note' },
  { value: 'follow_up', label: 'Follow-Up' },
];

interface LogActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { type: string; title: string; description: string }) => void;
  orgName?: string;
}

export default function LogActivityModal({
  open,
  onClose,
  onSave,
  orgName,
}: LogActivityModalProps) {
  const [type, setType] = useState('email');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSave() {
    if (!title.trim()) return;
    onSave({ type, title: title.trim(), description: description.trim() });
    setType('email');
    setTitle('');
    setDescription('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Outreach Activity">
      {orgName && (
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          For <span className="font-medium text-slate-700">{orgName}</span>
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Activity type
          </label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  type === t.value
                    ? 'bg-[#0d1f3c] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Summary <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Intro call with Taylor Kim"
            autoFocus
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened? Any key outcomes or next steps?"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 resize-none"
          />
        </div>
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
          disabled={!title.trim()}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Log Activity
        </button>
      </div>
    </Modal>
  );
}
