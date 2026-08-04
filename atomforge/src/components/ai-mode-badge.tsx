'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { AiStatus } from '@/lib/ai/llm';
import { cn } from '@/lib/utils';

interface AiModeBadgeProps {
  className?: string;
  compact?: boolean;
}

/**
 * 展示当前 AI 模式：拉取 /api/health/ai 并渲染 OpenAI 或 Fallback 标签。
 */
export function AiModeBadge({ className, compact = false }: AiModeBadgeProps) {
  const [status, setStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch('/api/health/ai');
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { data?: AiStatus };
        if (!cancelled && payload.data) {
          setStatus(payload.data);
        }
      } catch {
        // 忽略网络错误，保持不展示
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) {
    return null;
  }

  const isOpenAi = status.mode === 'openai';
  const label = isOpenAi
    ? compact
      ? 'OpenAI'
      : `OpenAI · ${status.model}`
    : compact
      ? 'Fallback'
      : 'Fallback 模板';

  const title = isOpenAi
    ? `当前使用 OpenAI 真实模型（${status.model}）生成内容`
    : '未配置 OPENAI_API_KEY，当前使用预置模板生成内容';

  return (
    <Badge
      variant="outline"
      title={title}
      className={cn(
        'shrink-0 text-xs font-normal',
        isOpenAi
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-400',
        className,
      )}
    >
      AI: {label}
    </Badge>
  );
}
