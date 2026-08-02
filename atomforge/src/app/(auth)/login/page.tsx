import { LoginForm } from '@/features/auth/components/login-form';

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

/**
 * 登录页：Credentials 鉴权，成功后跳转工作台。
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? '/dashboard';

  return <LoginForm callbackUrl={callbackUrl} />;
}
