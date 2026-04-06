import { redirect } from 'next/navigation';

// Legacy route — proxy now redirects to /login, but keep this
// so any hardcoded /auth links resolve cleanly.
export default function AuthPage() {
  redirect('/login');
}
