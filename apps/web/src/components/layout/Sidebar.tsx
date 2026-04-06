'use client';

import Link from 'next/link';
import { navItems } from '@/constants/navigation';
import SidebarNav from './SidebarNav';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { displayName, initials, profile, signOut, isFullAccess } = useAuth();

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isFullAccess,
  );

  return (
    <aside className="w-[210px] flex-shrink-0 flex flex-col h-full bg-gradient-to-b from-[#0d1f3c] via-[#0f2444] to-[#0b1a31]">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #c9a84c 0%, #e8d5a3 50%, #c9a84c 100%)',
            }}
          >
            <span className="text-[#0d1f3c] text-[11px] font-black tracking-tighter leading-none">
              AKΨ
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-bold leading-tight tracking-tight">
              AKPsi
            </p>
            <p className="text-white/40 text-[10px] leading-tight mt-0.5 truncate">
              Alpha Kappa Psi
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.07]" />

      {/* Navigation */}
      <SidebarNav items={visibleNavItems} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Semester handoff — full-access roles only */}
      {isFullAccess && <div className="mx-3 mb-3">
        <Link
          href="/handoff"
          className="block border border-white/10 rounded-xl px-3 py-3 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#c9a84c]/15 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3.5 h-3.5 text-[#c9a84c]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-[11px] font-medium leading-tight">
                Semester Handoff
              </p>
              <p className="text-white/30 text-[10px] leading-tight mt-0.5">
                Spring 2024
              </p>
            </div>
          </div>
        </Link>
      </div>}

      {/* User section */}
      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b8943a] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0d1f3c] text-[9px] font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/80 text-[11px] font-medium truncate">
              {displayName}
            </p>
            <p className="text-white/35 text-[10px] truncate">
              {profile?.committee ?? profile?.role ?? 'Member'}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
