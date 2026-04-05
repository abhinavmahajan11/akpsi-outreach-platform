import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Supabase client — uses cookies via @supabase/ssr so the session
 * persists across page reloads and is visible to server-side middleware.
 *
 * Call this inside client components or browser-only code.
 * For server components / middleware, use createSupabaseServerClient().
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(url, key);
}

/**
 * Singleton for client-side code that doesn't need a fresh client each render.
 * Import this in the OrgsContext and other client-side data layers.
 */
export const supabase = createSupabaseBrowserClient();
