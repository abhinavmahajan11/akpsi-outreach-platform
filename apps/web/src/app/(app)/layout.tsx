import AppShell from '@/components/layout/AppShell';

/**
 * App shell layout — wraps all authenticated app routes with Sidebar + Topbar.
 * The /auth route is outside this group and renders without the shell.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
