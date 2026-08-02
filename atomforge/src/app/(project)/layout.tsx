import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * 项目编辑器布局：全屏两栏，无 App 侧栏。
 */
export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
