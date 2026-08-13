'use client';

import { useState, useEffect } from 'react';
import type { Template, TemplateCategory } from '@/types';
import type { TemplateDraft } from '@/lib/db/templates';

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'sponsorship_outreach', label: 'Sponsorship Outreach' },
  { value: 'recruiter_outreach',   label: 'Recruiter Outreach' },
  { value: 'follow_up',            label: 'Follow-Up' },
  { value: 'workshop_speaker',     label: 'Workshop / Speaker' },
  { value: 'service_partnership',  label: 'Service Partnership' },
  { value: 'thank_you',            label: 'Thank You' },
  { value: 'best_practices',       label: 'Best Practices' },
];

const PLACEHOLDER_VARS = ['{{organization_name}}', '{{contact_name}}', '{{your_name}}'];

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  /** If provided, modal is in edit mode. */
  template?: Template;
  onSave: (draft: TemplateDraft) => Promise<void>;
  onDelete?: () => void;
}

export default function TemplateModal({
  open, onClose, template, onSave, onDelete,
}: TemplateModalProps) {
  const isEdit = !!template;

  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState<TemplateCategory>('sponsorship_outreach');
  const [description, setDescription] = useState('');
  const [body, setBody]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (open) {
      setTitle(template?.title ?? '');
      setCategory(template?.category ?? 'sponsorship_outreach');
      setDescription(template?.description ?? '');
      setBody(template?.body ?? '');
      setSaving(false);
      setConfirmDelete(false);
      setError('');
    }
  }, [open, template]);

  if (!open) return null;

  async function handleSave() {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!body.trim())  { setError('Template body is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), category, description: description.trim(), body: body.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? 'Edit Template' : 'New Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sponsorship Intro Email"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 focus:border-[#0d1f3c]/40"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 focus:border-[#0d1f3c]/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Short description
              <span className="ml-1 font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One-line summary of when to use this template"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 focus:border-[#0d1f3c]/40"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="block text-xs font-medium text-slate-600">
                Template body <span className="text-rose-400">*</span>
              </label>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Write your email template here…"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 focus:border-[#0d1f3c]/40 resize-none font-mono leading-relaxed"
            />
            {/* Variable hints */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                Variables:
              </span>
              {PLACEHOLDER_VARS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBody((prev) => prev + v)}
                  className="text-[10px] font-mono bg-slate-100 hover:bg-[#0d1f3c]/8 text-slate-600 hover:text-[#0d1f3c] px-2 py-0.5 rounded-md transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Delete (edit mode, non-default only) */}
          <div>
            {isEdit && !template?.isDefault && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600">Delete this template?</span>
                  <button
                    onClick={handleDelete}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 underline"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Delete template
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-[#0d1f3c] text-white rounded-xl hover:bg-[#1e3a5f] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
