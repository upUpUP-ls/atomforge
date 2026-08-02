'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseApiResponse } from '@/lib/api/client';
import { ArrowUp, Loader2, Plus, Sparkles } from 'lucide-react';
import { AGENTS } from '@/types';
import { Button } from '@/components/ui/button';
import {
  PROJECT_TYPE_OPTIONS,
  type ProjectType,
} from '@/features/projects/templates';

/**
 * 创建项目：校验输入并调用 API，成功后跳转项目页。
 */
async function createProject(prompt: string, projectType: ProjectType) {
  const typePrefix =
    projectType !== 'custom'
      ? `[${PROJECT_TYPE_OPTIONS.find((o) => o.value === projectType)?.label}] `
      : '';

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: `${typePrefix}${prompt}` }),
  });

  const data = await parseApiResponse<{ project: { id: string } }>(res);
  return data.project.id;
}

/**
 * 产品首页中央 Prompt：Agent 头像 + 大输入框 + 构建按钮。
 */
export function CreateProjectPrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('custom');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    try {
      const projectId = await createProject(trimmed, projectType);
      toast.success('项目已创建，Agent 团队开始工作…');
      router.push(`/project/${projectId}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="flex flex-col items-center px-6 pt-10 pb-6 sm:pt-16">
      <div className="mb-6 flex items-center gap-1">
        {AGENTS.map((agent, index) => (
          <div
            key={agent.id}
            className="flex size-10 items-center justify-center rounded-full border-2 border-background text-sm font-bold text-white shadow-sm sm:size-11"
            style={{
              backgroundColor: agent.color,
              marginLeft: index > 0 ? '-8px' : 0,
              zIndex: AGENTS.length - index,
            }}
            title={`${agent.name} · ${agent.role}`}
          >
            {agent.name[0]}
          </div>
        ))}
      </div>

      <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="size-3" />
        免费 Demo · Agent 团队就绪
      </p>

      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        准备好打造你的下一个产品了吗？
      </h1>

      <div className="w-full max-w-2xl rounded-2xl border bg-card shadow-sm">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你想构建的应用，例如：一个团队任务看板，支持拖拽和成员分配…"
          rows={4}
          disabled={loading}
          className="w-full resize-none rounded-t-2xl bg-transparent px-4 py-4 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
        />
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled
              title="附件（Demo）"
            >
              <Plus className="size-4" />
            </Button>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              disabled={loading}
              className="h-8 rounded-lg border-0 bg-transparent px-2 text-xs text-muted-foreground outline-none hover:bg-muted sm:text-sm"
            >
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="icon"
            className="rounded-full"
            disabled={!prompt.trim() || loading}
            onClick={handleSubmit}
            title="开始构建 (⌘/Ctrl + Enter)"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Mike → Emma → Bob → Alex 将协作完成规划、PRD、架构与代码生成
      </p>
    </section>
  );
}
