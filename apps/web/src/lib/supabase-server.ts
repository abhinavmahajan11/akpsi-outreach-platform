import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client — reads/writes the auth session from HTTP cookies.
 * Use in:
 *   - Server Components (layout.tsx, page.tsx)
 *   - Route Handlers (app/api/*)
 *
 * Do NOT use in 'use client' files — use the browser client from supabase.ts instead.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll called from a Server Component — cookies are read-only.
          // Middleware handles the refresh, so this is safe to ignore.
        }
      },
    },
  });
}
