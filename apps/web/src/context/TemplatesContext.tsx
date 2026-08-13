'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Template, TemplateCategory } from '@/types';
import {
  fetchAllTemplates,
  insertTemplate,
  patchTemplate,
  deleteTemplate as deleteTemplateDB,
  type TemplateDraft,
} from '@/lib/db/templates';
import { useAuth } from '@/context/AuthContext';

// ─── Context shape ────────────────────────────────────────────────────────────

interface TemplatesContextValue {
  templates: Template[];
  loading: boolean;
  error: string | null;
  /** Add a new template. Returns the created template. */
  addTemplate: (draft: TemplateDraft) => Promise<Template>;
  /** Patch a template's fields. */
  updateTemplate: (id: string, updates: Partial<TemplateDraft>) => void;
  /** Delete a template by id. */
  deleteTemplate: (id: string) => void;
  /** Filter helpers */
  getByCategory: (cat: TemplateCategory) => Template[];
}

// ─── Context + hook ───────────────────────────────────────────────────────────

const TemplatesContext = createContext<TemplatesContextValue | null>(null);

export function useTemplates(): TemplatesContextValue {
  const ctx = useContext(TemplatesContext);
  if (!ctx) throw new Error('useTemplates must be used inside <TemplatesProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TemplatesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchAllTemplates()
      .then(setTemplates)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const addTemplate = useCallback(async (draft: TemplateDraft): Promise<Template> => {
    const created = await insertTemplate(draft, user?.id);
    setTemplates((prev) => [created, ...prev]);
    return created;
  }, [user]);

  const updateTemplate = useCallback((id: string, updates: Partial<TemplateDraft>) => {
    setTemplates((prev) =>
      prev.map((t) => t.id === id ? { ...t, ...updates } : t),
    );
    patchTemplate(id, updates).catch((err: Error) =>
      console.error('updateTemplate DB write failed:', err.message),
    );
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    deleteTemplateDB(id).catch((err: Error) =>
      console.error('deleteTemplate DB write failed:', err.message),
    );
  }, []);

  const getByCategory = useCallback(
    (cat: TemplateCategory) => templates.filter((t) => t.category === cat),
    [templates],
  );

  return (
    <TemplatesContext.Provider
      value={{ templates, loading, error, addTemplate, updateTemplate, deleteTemplate, getByCategory }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
