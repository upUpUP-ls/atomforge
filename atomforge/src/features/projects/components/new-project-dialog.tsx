'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseApiResponse } from '@/lib/api/client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  PROJECT_TYPE_OPTIONS,
  type ProjectType,
} from '@/features/projects/templates';

/**
 * 新建项目对话框：输入描述与类型，提交后创建并跳转项目页。
 */
export function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('custom');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError('请描述你想构建的应用');
      return;
    }

    const typePrefix =
      projectType !== 'custom'
        ? `[${PROJECT_TYPE_OPTIONS.find((o) => o.value === projectType)?.label}] `
        : '';

    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          prompt: `${typePrefix}${trimmedPrompt}`,
        }),
      });

      const data = await parseApiResponse<{ project: { id: string } }>(res);

      setOpen(false);
      setTitle('');
      setPrompt('');
      setProjectType('custom');
      toast.success('项目已创建');
      router.push(`/project/${data.project.id}`);
      router.refresh();
    } catch {
      toast.error('网络错误，请稍后重试');
      setError('网络错误，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        新建项目
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
          <DialogDescription>
            用自然语言描述你想构建的应用，AI Agent 团队将为你生成。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="project-type">项目类型</Label>
            <select
              id="project-type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-title">项目名称（可选）</Label>
            <Input
              id="project-title"
              placeholder="我的 awesome 应用"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-prompt">应用描述</Label>
            <Textarea
              id="project-prompt"
              placeholder="例如：一个团队任务看板，支持拖拽排序和成员分配..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '创建中...' : '创建并开始'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
