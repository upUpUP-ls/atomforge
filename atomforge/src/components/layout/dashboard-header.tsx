import Link from 'next/link';
import { LogoutButton } from '@/features/auth/components/logout-button';

/**
 * 工作台/项目页共用顶栏。
 */
export function DashboardHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            AtomForge
          </Link>
          <nav className="hidden gap-4 text-sm sm:flex">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              工作台
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {email}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
