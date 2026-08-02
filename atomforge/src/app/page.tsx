import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AGENTS } from '@/types';

/**
 * 对外入口页：极简品牌 + 登录引导；已登录用户直接进入工作台。
 */
export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center gap-1">
          {AGENTS.map((agent, index) => (
            <div
              key={agent.id}
              className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{
                backgroundColor: agent.color,
                marginLeft: index > 0 ? '-6px' : 0,
              }}
            >
              {agent.name[0]}
            </div>
          ))}
        </div>

        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3" />
          Atoms 风格 Demo
        </p>

        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          AtomForge
        </h1>
        <p className="mb-8 text-muted-foreground">
          多 Agent 协作，将想法锻造成可运行的网页应用
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/register" />} nativeButton={false} size="lg">
            免费开始
          </Button>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            登录
          </Button>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        AtomForge Demo · 模拟 Atoms 多 Agent 应用生成体验
      </footer>
    </div>
  );
}
