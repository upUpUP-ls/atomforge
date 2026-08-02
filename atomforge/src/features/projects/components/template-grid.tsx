'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseApiResponse } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PROJECT_TEMPLATES, type TemplateId } from '@/features/projects/templates';

/**
 * 模板 Remix 网格：点击模板一键创建项目。
 */
export function TemplateGrid() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<TemplateId | null>(null);

  const handleRemix = async (templateId: TemplateId) => {
    setLoadingId(templateId);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      const data = await parseApiResponse<{ project: { id: string } }>(res);
      toast.success('项目已创建，正在启动 Agent 流水线...');
      router.push(`/project/${data.project.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败');
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PROJECT_TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={`border-0 bg-gradient-to-br ${template.gradient} shadow-sm transition-shadow hover:shadow-md`}
        >
          <CardHeader>
            <div className="mb-2 text-2xl">{template.icon}</div>
            <CardTitle className="text-base">{template.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description}
            </CardDescription>
            <Button
              className="mt-3 w-full"
              variant="outline"
              size="sm"
              disabled={loadingId !== null}
              onClick={() => handleRemix(template.id)}
            >
              {loadingId === template.id ? '创建中...' : 'Remix 模板'}
            </Button>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
