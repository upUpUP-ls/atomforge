'use client';

import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PlanApprovalCardProps {
  planContent: string;
  onApprove: (plan: string) => void;
  onEdit?: () => void;
}

/**
 * 将计划文本解析为列表项。
 */
function parsePlanItems(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[-*•\d.)\]]+\s*/, '').trim())
    .filter((line) => line.length > 2)
    .slice(0, 8);
}

/**
 * Mike 计划确认卡片：批准 / 编辑后批准（对齐 Atoms 交互）。
 */
export function PlanApprovalCard({
  planContent,
  onApprove,
}: PlanApprovalCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(planContent);
  const items = parsePlanItems(editing ? draft : planContent);

  const handleApprove = () => {
    onApprove(editing ? draft : planContent);
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm text-muted-foreground">
        请查阅以上开发计划，确认无误后批准，Agent 团队将继续执行。
      </p>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          className="mb-3 text-sm"
        />
      ) : (
        <ul className="mb-4 space-y-2">
          {items.length > 0 ? (
            items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground whitespace-pre-wrap">
              {planContent.slice(0, 500)}
            </li>
          )}
        </ul>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            if (editing) {
              setDraft(planContent);
              setEditing(false);
            } else {
              setEditing(true);
            }
          }}
        >
          <Pencil className="size-3.5" />
          {editing ? '取消编辑' : '编辑计划'}
        </Button>
        <Button type="button" size="sm" className="flex-1" onClick={handleApprove}>
          批准
        </Button>
      </div>
    </div>
  );
}
