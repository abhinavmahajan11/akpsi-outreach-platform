'use client';

import { useState } from 'react';
import Link from 'next/link';
import DropdownMenu from '@/components/ui/DropdownMenu';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Follow-up overdue',
    body: 'Goldman Sachs — proposal sent 12 days ago with no reply.',
    time: '2h ago',
    unread: true,
    href: '/organizations/goldman-sachs',
  },
  {
    id: '2',
    title: 'Reminder due today',
    body: 'Deloitte — submit revised case comp proposal to Morgan.',
    time: '5h ago',
    unread: true,
    href: '/organizations/deloitte',
  },
  {
    id: '3',
    title: 'Active partner confirmed',
    body: 'Make-A-Wish Foundation renewed for Spring 2024.',
    time: '1d ago',
    unread: false,
    href: '/organizations/make-a-wish',
  },
  {
    id: '4',
    title: 'New contact added',
    body: 'Jordan Lee added to Google as a recruiting coordinator.',
    time: '2d ago',
    unread: false,
    href: '/organizations/google',
  },
];

const QUICK_NAV_ITEMS = [
  { label: 'Dashboard',       href: '/dashboard' },
  { label: 'Organizations',   href: '/organizations' },
  { label: 'Follow-Ups',      href: '/follow-ups' },
  { label: 'Active Partners', href: '/active-partners' },
  { label: 'Pending',         href: '/pending' },
  { label: 'Add Organization',href: '/organizations/new' },
];

export default function Topbar() {
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="h-[60px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4 z-10 relative">
      {/* App title */}
      <Link
        href="/dashboard"
        className="text-[15px] font-semibold text-slate-900 whitespace-nowrap flex-shrink-0 hover:text-[#0d1f3c] transition-colors"
      >
        Outreach Management Platform
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search companies, contacts, notes..."
            className="w-full rounded-lg bg-slate-50 pl-8 pr-4 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:border-[#0d1f3c]/30 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* ── Quick nav grid icon ── */}
        <div className="relative">
          <button
            aria-label="Quick navigation"
            onClick={() => {
              setQuickNavOpen((v) => !v);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              quickNavOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>

          <DropdownMenu
            open={quickNavOpen}
            onClose={() => setQuickNavOpen(false)}
            position="right-0 top-full mt-1"
            minWidth="min-w-[200px]"
            items={QUICK_NAV_ITEMS.map((item) => ({
              label: item.label,
              href: item.href,
            }))}
          />
        </div>

        {/* ── Notifications ── */}
        <div className="relative">
          <button
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            onClick={() => {
              setNotifOpen((v) => !v);
              setQuickNavOpen(false);
              setProfileOpen(false);
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${
              notifOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications panel */}
          {notifOpen && (
            <NotificationsPanel
              notifications={NOTIFICATIONS}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        {/* ── Profile avatar ── */}
        <div className="relative ml-1">
          <button
            aria-label="Account menu"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
              setQuickNavOpen(false);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm transition-opacity ${
              profileOpen ? 'opacity-80' : ''
            }`}
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d1f3c)' }}
          >
            PN
          </button>

          <DropdownMenu
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            position="right-0 top-full mt-1"
            minWidth="min-w-[200px]"
            items={[
              {
                label: 'Priya Nair',
                onClick: () => {},
                icon: (
                  <div className="w-5 h-5 rounded-full bg-[#0d1f3c] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[8px] font-bold">PN</span>
                  </div>
                ),
              },
              {
                label: 'My Profile',
                href: '/profile',
                dividerBefore: true,
                icon: (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              {
                label: 'Settings',
                href: '/settings',
                icon: (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                label: 'Semester Handoff',
                href: '/handoff',
                icon: (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                ),
              },
              {
                label: 'Sign Out',
                dividerBefore: true,
                danger: true,
                onClick: () => {},
                icon: (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                ),
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

/* ── Notifications Panel ── */

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  href: string;
}

function NotificationsPanel({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-[13px] font-semibold text-slate-900">Notifications</p>
        <button
          onClick={onClose}
          className="text-[11px] font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
        >
          Mark all read
        </button>
      </div>

      <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            onClick={onClose}
            className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
              n.unread ? 'bg-blue-50/40' : ''
            }`}
          >
            {n.unread && (
              <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
            {!n.unread && <span className="mt-1.5 w-2 h-2 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-800">{n.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.body}</p>
              <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <Link
          href="/follow-ups"
          onClick={onClose}
          className="text-[12px] font-medium text-[#0d1f3c] hover:text-[#1e3a5f]"
        >
          View all follow-ups →
        </Link>
      </div>
    </div>
  );
}
