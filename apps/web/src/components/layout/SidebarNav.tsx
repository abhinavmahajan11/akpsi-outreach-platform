'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/types';
import NavIcon from './NavIcons';

interface SidebarNavProps {
  items: NavItem[];
}

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="px-3 py-3 flex-1">
      {items.map((item) => {
        const isActive = isNavItemActive(item.href, pathname);

        return (
          <div key={item.href}>
            {item.dividerBefore && (
              <div className="mx-3 my-2 border-t border-white/[0.07]" />
            )}
            <Link
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all mb-0.5 ${
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
          </div>
        );
      })}
    </nav>
  );
}
