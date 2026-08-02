'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Home,
  FolderOpen,
  Library,
  Settings,
  Bell,
} from 'lucide-react';
import { LogoutButton } from '@/features/auth/components/logout-button';
import type { ProjectSummary } from '@/features/projects/templates';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  email?: string | null;
  name?: string | null;
  recentProjects: ProjectSummary[];
}

const navItems = [
  { href: '/dashboard', label: '首页', icon: Home, match: 'home' as const },
  {
    href: '/dashboard?tab=discover',
    label: '资源',
    icon: Library,
    match: 'discover' as const,
  },
  {
    href: '/dashboard?tab=projects',
    label: '我的项目',
    icon: FolderOpen,
    match: 'projects' as const,
  },
];

/**
 * 渲染侧栏导航项：根据路径与 tab 参数高亮当前项。
 */
function NavLink({
  href,
  label,
  icon: Icon,
  match,
  pathname,
  currentTab,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  match: 'home' | 'discover' | 'projects';
  pathname: string;
  currentTab: string | null;
}) {
  const isDashboard = pathname === '/dashboard';
  const active =
    match === 'home'
      ? isDashboard && !currentTab
      : match === 'discover'
        ? isDashboard && currentTab === 'discover'
        : isDashboard && currentTab === 'projects';

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-muted font-medium text-foreground'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

/**
 * 产品侧栏：导航、最近项目、用户区（对齐 Atoms 工作台布局）。
 */
export function AppSidebar({ email, name, recentProjects }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const displayName = name ?? email?.split('@')[0] ?? '用户';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-muted/20 lg:w-60">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <Link href="/dashboard" className="text-base font-bold tracking-tight">
          AtomForge
        </Link>
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            {...item}
            pathname={pathname}
            currentTab={currentTab}
          />
        ))}
      </nav>

      {recentProjects.length > 0 && (
        <div className="mt-2 flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
            最近
          </p>
          <div className="space-y-0.5">
            {recentProjects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className={cn(
                  'block truncate rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
                  pathname === `/project/${project.id}` &&
                    'bg-muted font-medium text-foreground',
                )}
                title={project.title}
              >
                {project.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initial}
            </div>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="设置（Demo）"
              disabled
            >
              <Settings className="size-3.5" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="通知（Demo）"
              disabled
            >
              <Bell className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="[&_button]:w-full">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
