'use client';

import { useState, useMemo } from 'react';
import type { Template, TemplateCategory } from '@/types';
import type { TemplateDraft } from '@/lib/db/templates';
import { useTemplates } from '@/context/TemplatesContext';
import TemplateModal from './TemplateModal';
import Toast from '@/components/ui/Toast';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<TemplateCategory, { label: string; color: string }> = {
  sponsorship_outreach: { label: 'Sponsorship',       color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60' },
  recruiter_outreach:   { label: 'Recruiter',          color: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60' },
  follow_up:            { label: 'Follow-Up',          color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60' },
  workshop_speaker:     { label: 'Workshop / Speaker', color: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200/60' },
  service_partnership:  { label: 'Service Partner',    color: 'bg-green-50 text-green-700 ring-1 ring-green-200/60' },
  thank_you:            { label: 'Thank You',          color: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/60' },
  best_practices:       { label: 'Best Practices',     color: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60' },
};

const ALL_CATEGORIES: TemplateCategory[] = [
  'sponsorship_outreach', 'recruiter_outreach', 'follow_up',
  'workshop_speaker', 'service_partnership', 'thank_you', 'best_practices',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: TemplateCategory }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
}

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onCopy: () => void;
}

function TemplateCard({ template, onEdit, onCopy }: TemplateCardProps) {
  const preview = template.body.replace(/\n+/g, ' ').slice(0, 160);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 hover:ring-slate-200 transition-all flex flex-col">
      {/* Top */}
      <div className="px-5 pt-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={template.category} />
            {template.isDefault && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#c9a84c]/15 text-[#8a6f2e] ring-1 ring-[#c9a84c]/30">
                Default
              </span>
            )}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-1">
          {template.title}
        </h3>
        {template.description && (
          <p className="text-xs text-slate-500 mb-2 leading-relaxed">{template.description}</p>
        )}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {preview}{preview.length < template.body.replace(/\n+/g, ' ').length ? '…' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0d1f3c] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
          Copy
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0d1f3c] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function TemplatesView() {
  const { templates, loading, error, addTemplate, updateTemplate, deleteTemplate } = useTemplates();

  const [activeTab, setActiveTab]       = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch]             = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Template | undefined>(undefined);
  const [toastMsg, setToastMsg]         = useState('');
  const [toastOpen, setToastOpen]       = useState(false);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastOpen(true);
  }

  const filtered = useMemo(() => {
    let list = templates;
    if (activeTab !== 'all') list = list.filter((t) => t.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q),
      );
    }
    return list;
  }, [templates, activeTab, search]);

  // Count per tab for badges
  const counts = useMemo(() => {
    const map: Partial<Record<TemplateCategory | 'all', number>> = { all: templates.length };
    for (const cat of ALL_CATEGORIES) {
      map[cat] = templates.filter((t) => t.category === cat).length;
    }
    return map;
  }, [templates]);

  function openNew() {
    setEditTarget(undefined);
    setModalOpen(true);
  }

  function openEdit(t: Template) {
    setEditTarget(t);
    setModalOpen(true);
  }

  async function handleSave(draft: TemplateDraft) {
    if (editTarget) {
      updateTemplate(editTarget.id, draft);
      showToast('Template updated');
    } else {
      await addTemplate(draft);
      showToast('Template created');
    }
  }

  function handleDelete() {
    if (!editTarget) return;
    deleteTemplate(editTarget.id);
    showToast('Template deleted');
  }

  function handleCopy(t: Template) {
    navigator.clipboard.writeText(t.body).then(() => showToast('Copied to clipboard'));
  }

  return (
    <div className="px-8 pt-8 pb-16">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-slate-500">
            Reusable email and outreach templates — copy, customize, and send.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#0d1f3c] text-white rounded-xl hover:bg-[#1e3a5f] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Template
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d1f3c]/20 focus:border-[#0d1f3c]/40 bg-white"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 flex-wrap mb-6 border-b border-slate-100 pb-1">
        {(['all', ...ALL_CATEGORIES] as const).map((tab) => {
          const label = tab === 'all' ? 'All' : CATEGORY_META[tab].label;
          const count = counts[tab] ?? 0;
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                active
                  ? 'bg-[#0d1f3c] text-white'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {label}
              <span className={`text-[10px] tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading templates…</div>
      ) : error ? (
        <div className="text-sm text-rose-500 py-12 text-center">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No templates found</p>
          <p className="text-xs text-slate-400 mb-4">
            {search ? 'Try a different search term.' : 'Create your first template to get started.'}
          </p>
          {!search && (
            <button
              onClick={openNew}
              className="text-xs font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
            >
              + New template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => openEdit(t)}
              onCopy={() => handleCopy(t)}
            />
          ))}
        </div>
      )}

      <TemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        template={editTarget}
        onSave={handleSave}
        onDelete={editTarget && !editTarget.isDefault ? handleDelete : undefined}
      />

      <Toast message={toastMsg} open={toastOpen} onClose={() => setToastOpen(false)} />
    </div>
  );
}
