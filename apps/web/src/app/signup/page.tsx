import AuthForm from '@/features/auth/AuthForm';

export const metadata = {
  title: 'Create Account · AKPsi Outreach',
};

export default function SignupPage() {
  return <AuthForm initialMode="signup" />;
}
