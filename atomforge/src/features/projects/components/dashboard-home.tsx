'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateProjectPrompt } from '@/features/projects/components/create-project-prompt';
import { ProjectList } from '@/features/projects/components/project-list';
import { TemplateGrid } from '@/features/projects/components/template-grid';
import { PROJECT_TEMPLATES } from '@/features/projects/templates';
import type { ProjectSummary } from '@/features/projects/templates';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type HomeTab = 'discover' | 'projects' | 'templates';

const tabs: { id: HomeTab; label: string }[] = [
  { id: 'discover', label: '发现' },
  { id: 'projects', label: '我的项目' },
  { id: 'templates', label: '模板' },
];

interface DashboardHomeProps {
  projects: ProjectSummary[];
  defaultTab?: HomeTab;
}

/**
 * 发现 Tab：展示推荐模板与示例项目卡片。
 */
function DiscoverPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PROJECT_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={`border-0 bg-gradient-to-br ${template.gradient} shadow-sm transition-shadow hover:shadow-md`}
        >
          <CardHeader>
            <div className="mb-1 text-2xl">{template.icon}</div>
            <CardTitle className="text-base">{template.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      <Card className="border-dashed bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            更多灵感
          </CardTitle>
          <CardDescription>
            在上方输入框描述想法，或切换到「模板」一键 Remix
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

/**
 * 产品首页：中央 Prompt + 底部 Tab（发现 / 我的项目 / 模板）。
 */
export function DashboardHome({ projects, defaultTab = 'discover' }: DashboardHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as HomeTab | null) ?? defaultTab;

  const setTab = (tab: HomeTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'discover') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : '/dashboard', {
      scroll: false,
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <CreateProjectPrompt />

      <section className="flex-1 border-t bg-muted/10 px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex gap-1 rounded-lg border bg-background p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-sm transition-colors',
                    activeTab === tab.id
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'projects' && projects.length > 0 && (
              <Link
                href="/dashboard?tab=projects"
                className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-foreground"
              >
                查看全部
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>

          {activeTab === 'discover' && <DiscoverPanel />}
          {activeTab === 'projects' && <ProjectList projects={projects} />}
          {activeTab === 'templates' && <TemplateGrid />}
        </div>
      </section>
    </div>
  );
}
