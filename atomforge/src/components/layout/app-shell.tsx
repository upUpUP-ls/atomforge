'use client';

import { Suspense } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import type { ProjectSummary } from '@/features/projects/templates';

interface AppShellProps {
  email?: string | null;
  name?: string | null;
  recentProjects: ProjectSummary[];
  children: React.ReactNode;
}

/**
 * 已登录产品壳层：左侧栏 + 主内容区。
 */
export function AppShell({
  email,
  name,
  recentProjects,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense
        fallback={
          <aside className="w-56 shrink-0 border-r bg-muted/20 lg:w-60" />
        }
      >
        <AppSidebar
          email={email}
          name={name}
          recentProjects={recentProjects}
        />
      </Suspense>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
