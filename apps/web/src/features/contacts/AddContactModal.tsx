'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import type { Contact } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  orgName: string;
  /** Called with the validated contact draft when the user clicks Save. */
  onSave: (contact: Contact) => void;
  /** If true, the "Set as primary" checkbox defaults to checked. */
  defaultPrimary?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddContactModal({
  open,
  onClose,
  orgName,
  onSave,
  defaultPrimary = false,
}: AddContactModalProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [isPrimary, setIsPrimary] = useState(defaultPrimary);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName('');
      setTitle('');
      setEmail('');
      setPhone('');
      setLinkedIn('');
      setIsPrimary(defaultPrimary);
      setErrors({});
    }
  }, [open, defaultPrimary]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const contact: Contact = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      title: title.trim() || 'Contact',
      email: email.trim(),
      phone: phone.trim() || undefined,
      linkedIn: linkedIn.trim() || undefined,
      isPrimary,
    };

    onSave(contact);
    onClose();
  }

  const canSave = name.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} title="Add Contact" maxWidth="max-w-lg">
      <p className="text-xs text-slate-500 -mt-1 mb-5">
        Adding contact to{' '}
        <span className="font-semibold text-slate-700">{orgName}</span>
      </p>

      <div className="space-y-4">
        {/* Name + Title */}
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Full Name" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Taylor Kim"
              autoFocus
              className={inputCls(!!errors.name)}
            />
          </ModalField>
          <ModalField label="Title / Role">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Recruiting Manager"
              className={inputCls(false)}
            />
          </ModalField>
        </div>

        {/* Email */}
        <ModalField label="Email" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. tkim@company.com"
            className={inputCls(!!errors.email)}
          />
        </ModalField>

        {/* Phone + LinkedIn */}
        <div className="grid grid-cols-2 gap-3">
          <ModalField label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-0100"
              className={inputCls(false)}
            />
          </ModalField>
          <ModalField label="LinkedIn URL">
            <input
              type="text"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="linkedin.com/in/…"
              className={inputCls(false)}
            />
          </ModalField>
        </div>

        {/* Primary toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => setIsPrimary((v) => !v)}
            className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
              isPrimary ? 'bg-[#0d1f3c]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                isPrimary ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs font-medium text-slate-700">
            Set as primary contact
          </span>
          {isPrimary && (
            <span className="text-[10px] text-slate-400">(replaces current primary)</span>
          )}
        </label>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-2 rounded-lg bg-[#0d1f3c] text-sm font-medium text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Contact
        </button>
      </div>
    </Modal>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function ModalField({
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
