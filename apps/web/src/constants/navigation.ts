import type { NavItem } from '@/types';

export const navItems: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard',        icon: 'dashboard' },
  { label: 'Organizations',   href: '/organizations',    icon: 'organizations' },
  { label: 'Follow-Ups',      href: '/follow-ups',       icon: 'follow-ups' },
  { label: 'Active Partners', href: '/active-partners',  icon: 'active-partners' },
  { label: 'Pending',         href: '/pending',          icon: 'pending' },
  { label: 'Contacts',        href: '/contacts',         icon: 'contacts',   dividerBefore: true },
  { label: 'Templates',       href: '/templates',        icon: 'templates',  adminOnly: true },
  { label: 'Analytics',       href: '/analytics',        icon: 'analytics',  adminOnly: true },
];
