'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [committee, setCommittee] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function resetForm() {
    setFullName('');
    setEmail('');
    setPassword('');
    setCommittee('');
    setError('');
    setSuccess('');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // If email confirmation is disabled in Supabase, session is available now
    // and we can create the profile row immediately.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        committee: committee.trim() || null,
        role: 'member',
      });

      setLoading(false);

      if (data.session) {
        // Email confirmation off — signed in immediately
        router.push('/dashboard');
        router.refresh();
      } else {
        // Email confirmation on — tell user to check inbox
        setSuccess(
          'Account created! Check your email to confirm, then sign in.',
        );
        setMode('signin');
        resetForm();
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f3f8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%)',
            }}
          >
            <span className="text-[#0d1f3c] text-[15px] font-black tracking-tighter">
              AKΨ
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AKPsi Outreach Platform
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin'
              ? 'Sign in to your committee account'
              : 'Create your committee account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-6 py-7">
          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
              <p className="text-xs text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {/* Full name — sign up only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  autoFocus
                  className={inputCls}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                autoFocus={mode === 'signin'}
                autoComplete="email"
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className={inputCls}
              />
            </div>

            {/* Committee — sign up only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Committee
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <select
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select your committee…</option>
                  <option>Professional Development</option>
                  <option>Community Service</option>
                  <option>Brotherhood</option>
                  <option>Fundraising</option>
                  <option>Marketing</option>
                  <option>Alumni Relations</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-xl bg-[#0d1f3c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading
                ? mode === 'signin'
                  ? 'Signing in…'
                  : 'Creating account…'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <>
              New to the platform?{' '}
              <button
                onClick={() => { setMode('signup'); resetForm(); }}
                className="font-medium text-[#0d1f3c] hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); resetForm(); }}
                className="font-medium text-[#0d1f3c] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0d1f3c]/40 focus:ring-1 focus:ring-[#0d1f3c]/20 bg-white transition-colors';
