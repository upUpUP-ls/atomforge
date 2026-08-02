'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface ImplementationPlanCardProps {
  planContent: string;
  showApprove?: boolean;
  onApprove?: (plan: string) => void;
}

/**
 * 将计划文本解析为带编号的实施条目。
 */
export function parsePlanItems(content: string): string[] {
  const lines = content.split('\n').map((line) => line.trim());

  const numbered = lines
    .filter((line) => /^\d+[.)]\s/.test(line))
    .map((line) => line.replace(/^\d+[.)]\s*/, '').trim());

  if (numbered.length > 0) return numbered.slice(0, 12);

  return lines
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.replace(/^[-*•]+\s*/, '').trim())
    .filter((line) => line.length > 2)
    .slice(0, 12);
}

/**
 * 实施计划卡片：嵌入 Alex 消息区，对齐 Atoms 编号列表样式。
 */
export function ImplementationPlanCard({
  planContent,
  showApprove = false,
  onApprove,
}: ImplementationPlanCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(planContent);
  const items = parsePlanItems(editing ? draft : planContent);
  const introLine =
    planContent.split('\n').find((l) => l.trim() && !/^\d+[.)]/.test(l.trim())) ??
    '请查阅以下实施计划：';

  const handleApprove = () => {
    onApprove?.(editing ? draft : planContent);
  };

  return (
    <div className="ml-9 space-y-3">
      {!editing && introLine && !introLine.startsWith('1.') && (
        <p className="text-sm leading-relaxed text-foreground/90">{introLine}</p>
      )}

      <div className="rounded-xl border bg-muted/40 p-4">
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            className="text-sm"
          />
        ) : (
          <ol className="space-y-2.5">
            {items.map((item, i) => (
              <li key={`${i}-${item.slice(0, 24)}`} className="flex text-sm leading-relaxed">
                <span className="mr-2 shrink-0 font-medium text-muted-foreground">
                  {i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {showApprove && onApprove && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (editing) {
                setDraft(planContent);
                setEditing(false);
              } else {
                setEditing(true);
              }
            }}
          >
            {editing ? '取消编辑' : '编辑计划'}
          </Button>
          <Button type="button" size="sm" onClick={handleApprove}>
            <Check className="size-3.5" />
            批准计划
          </Button>
        </div>
      )}
    </div>
  );
}
