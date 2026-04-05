import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local',
  );
}

/**
 * Single shared Supabase client.
 * Uses the public anon key — safe for client-side use.
 * Phase 4: add a server-side service-role client for admin operations.
 */
export const supabase = createClient(url, key);
