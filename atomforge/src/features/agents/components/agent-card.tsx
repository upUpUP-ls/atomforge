import type { AgentName } from '@/types';
import { AGENTS } from '@/types';
import type { AgentStepStatus } from '../lib/editor-state';
import { Loader2, Check, Circle } from 'lucide-react';

interface AgentCardProps {
  agentId: AgentName;
  status: AgentStepStatus;
  isActive: boolean;
}

/**
 * 获取 Agent 状态对应的图标。
 */
function StatusIcon({ status }: { status: AgentStepStatus }) {
  if (status === 'running') {
    return <Loader2 className="size-3.5 animate-spin text-primary" />;
  }
  if (status === 'done') {
    return <Check className="size-3.5 text-emerald-600" />;
  }
  if (status === 'error') {
    return <Circle className="size-3.5 fill-destructive text-destructive" />;
  }
  return <Circle className="size-3.5 text-muted-foreground/40" />;
}

/**
 * 单个 Agent 卡片：头像、角色、运行状态。
 */
export function AgentCard({ agentId, status, isActive }: AgentCardProps) {
  const agent = AGENTS.find((a) => a.id === agentId)!;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        isActive
          ? 'border-primary/50 bg-primary/5 shadow-sm'
          : status === 'done'
            ? 'border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
            : 'border-transparent bg-muted/30'
      }`}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: agent.color }}
      >
        {agent.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{agent.name}</p>
        <p className="truncate text-xs text-muted-foreground">{agent.role}</p>
      </div>
      <StatusIcon status={status} />
    </div>
  );
}
