import { Suspense } from 'react';
import { getUserProjects } from '@/features/projects/service';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardHome } from '@/features/projects/components/dashboard-home';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomeTab } from '@/features/projects/types';

interface DashboardPageProps {
  searchParams: Promise<{ tab?: string }>;
}

/**
 * 工作台首页 Loading 占位。
 */
function DashboardHomeFallback() {
  return (
    <div className="flex flex-col items-center px-6 pt-16">
      <Skeleton className="mb-6 h-11 w-48 rounded-full" />
      <Skeleton className="mb-8 h-9 w-80" />
      <Skeleton className="h-40 w-full max-w-2xl rounded-2xl" />
    </div>
  );
}

/**
 * 产品首页：对齐 Atoms 创作型工作台（Prompt + Tab）。
 */
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { tab } = await searchParams;
  const validTabs: HomeTab[] = ['discover', 'projects', 'templates'];
  const defaultTab = validTabs.includes(tab as HomeTab)
    ? (tab as HomeTab)
    : 'discover';

  const projects = await getUserProjects(session.user.id);

  return (
    <Suspense fallback={<DashboardHomeFallback />}>
      <DashboardHome projects={projects} defaultTab={defaultTab} />
    </Suspense>
  );
}
