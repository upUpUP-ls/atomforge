import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

/**
 * 全站顶部导航：已登录显示工作台入口，未登录显示登录/注册。
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AtomForge
        </Link>
        <nav className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.email}
              </span>
              <Button render={<Link href="/dashboard" />} nativeButton={false} size="sm">
                工作台
              </Button>
            </>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                登录
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false} size="sm">
                免费开始
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
