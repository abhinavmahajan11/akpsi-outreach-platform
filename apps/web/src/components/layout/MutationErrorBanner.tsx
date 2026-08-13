'use client';

import { useEffect } from 'react';
import { useOrgs } from '@/context/OrgsContext';

/**
 * Renders a temporary error banner when a background mutation in OrgsContext
 * fails (e.g. addNote, deleteContact, etc.). Auto-dismisses after 6 seconds.
 */
export default function MutationErrorBanner() {
  const { mutationError, clearMutationError } = useOrgs();

  useEffect(() => {
    if (!mutationError) return;
    const t = setTimeout(clearMutationError, 6000);
    return () => clearTimeout(t);
  }, [mutationError, clearMutationError]);

  if (!mutationError) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-rose-600 text-white text-sm font-medium shadow-lg px-4 py-3 max-w-sm w-full"
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span className="flex-1">{mutationError}</span>
      <button
        onClick={clearMutationError}
        aria-label="Dismiss"
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
