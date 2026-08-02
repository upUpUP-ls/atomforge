import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProjects } from '@/features/projects/service';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Dashboard 路由组布局：鉴权 + 侧栏壳层。
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const projects = await getUserProjects(session.user.id);

  return (
    <AppShell
      email={session.user.email}
      name={session.user.name}
      recentProjects={projects}
    >
      {children}
    </AppShell>
  );
}
