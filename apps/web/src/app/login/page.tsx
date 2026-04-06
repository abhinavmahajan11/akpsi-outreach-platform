import AuthForm from '@/features/auth/AuthForm';

export const metadata = {
  title: 'Sign In · AKPsi Outreach',
};

export default function LoginPage() {
  return <AuthForm initialMode="signin" />;
}
