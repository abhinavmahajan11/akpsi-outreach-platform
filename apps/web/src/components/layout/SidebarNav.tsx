'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/types';
import NavIcon from './NavIcons';

interface SidebarNavProps {
  items: NavItem[];
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  // Filter out Semester Handoff — handled separately in Sidebar.tsx
  const navItems = items.filter((item) => item.icon !== 'handoff');

  return (
    <nav className="px-3 py-3 space-y-0.5">
      {navItems.map((item) => {
        const isActive =
          item.href === '/' || item.href === '/dashboard'
            ? pathname === '/' || pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/55 hover:bg-white/[0.06] hover:text-white/85'
            }`}
          >
            <NavIcon
              icon={item.icon}
              className={`w-[15px] h-[15px] flex-shrink-0 ${
                isActive
                  ? 'text-[#c9a84c]'
                  : 'text-white/40 group-hover:text-white/60'
              }`}
            />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
