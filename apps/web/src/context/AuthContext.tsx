'use client';

/**
 * AuthContext — current user session and profile.
 *
 * Wraps Supabase Auth listener so every client component can access:
 *   - user       — raw Supabase auth user (email, id, etc.)
 *   - profile    — row from the public.profiles table
 *   - loading    — true until the initial session check resolves
 *   - signOut    — call to sign the user out and redirect to /auth
 *
 * Phase 5 upgrade: add role-based helpers (isAdmin, canEdit, etc.) here.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { type Role, isFullAccess as checkFullAccess } from '@/lib/roles';

// ─── Profile type (mirrors public.profiles table) ─────────────────────────────

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  committee: string | null;
  role: Role;
  created_at: string;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Handy display name — falls back gracefully if profile not yet loaded */
  displayName: string;
  /** Two-character initials for avatar */
  initials: string;
  /** True for admin, president, vice_president — false for member or unauthenticated */
  isFullAccess: boolean;
}

// ─── Context + hook ───────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch profile row from DB ─────────────────────────────────────────────

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
  }, []);

  // ── Auth state listener ───────────────────────────────────────────────────

  useEffect(() => {
    // getUser validates the session against the server (more secure than getSession)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // ── Sign out ──────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/auth');
  }, [router]);

  // ── Derived display values ────────────────────────────────────────────────

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const initials = getInitials(displayName);
  const isFullAccessUser = checkFullAccess(profile?.role);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, displayName, initials, isFullAccess: isFullAccessUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
