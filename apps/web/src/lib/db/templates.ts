import { supabase } from '@/lib/supabase';
import type { Template, TemplateCategory } from '@/types';

// ─── DB row shape ─────────────────────────────────────────────────────────────

interface DbTemplate {
  id: string;
  title: string;
  description: string;
  body: string;
  category: string;
  is_default: boolean;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapTemplate(row: DbTemplate): Template {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    body: row.body,
    category: row.category as TemplateCategory,
    isDefault: row.is_default,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchAllTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('category')
    .order('created_at');

  if (error) throw new Error(`fetchAllTemplates: ${error.message}`);
  return (data as DbTemplate[]).map(mapTemplate);
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface TemplateDraft {
  title: string;
  description: string;
  body: string;
  category: TemplateCategory;
}

export async function insertTemplate(
  draft: TemplateDraft,
  createdByUserId?: string,
): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      title: draft.title,
      description: draft.description,
      body: draft.body,
      category: draft.category,
      is_default: false,
      ...(createdByUserId ? { created_by_user_id: createdByUserId } : {}),
    })
    .select()
    .single();

  if (error) throw new Error(`insertTemplate: ${error.message}`);
  return mapTemplate(data as DbTemplate);
}

export async function patchTemplate(
  id: string,
  updates: Partial<TemplateDraft>,
): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`patchTemplate: ${error.message}`);
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`deleteTemplate: ${error.message}`);
}
