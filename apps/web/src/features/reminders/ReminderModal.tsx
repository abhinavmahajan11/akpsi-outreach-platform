'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; date: string; assignedTo: string }) => void;
  orgName?: string;
  defaultTitle?: string;
}

export default function ReminderModal({
  open,
  onClose,
  onSave,
  orgName,
  defaultTitle = '',
}: ReminderModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [date, setDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Priya Nair');

  function handleSave() {
    if (!title.trim() || !date) return;
    onSave({ title: title.trim(), date, assignedTo });
    setTitle('');
    setDate('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Set Reminder">
      {orgName && (
        <p className="text-xs text-slate-500 -mt-1 mb-4">
          For <span className="font-medium text-slate-700">{orgName}</span>
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Reminder title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Follow up with Taylor by Friday"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Due date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Assign to
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#0d1f3c]/40"
            >
              {['Priya Nair', 'Marcus Webb', 'Aisha Thompson', 'Sofia Reyes'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
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
          disabled={!title.trim() || !date}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Reminder
        </button>
      </div>
    </Modal>
  );
}
