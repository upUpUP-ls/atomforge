'use client';

import { AGENTS, type AgentName } from '@/types';
import type { AgentStepStatus } from '../lib/editor-state';

const STEP_LABELS = ['Research', 'Plan', 'Architect', 'Build'];
const AGENT_ORDER: AgentName[] = ['mike', 'emma', 'bob', 'alex'];

interface PipelineProgressBarProps {
  agentStatuses: Record<AgentName, AgentStepStatus>;
  activeAgent: AgentName | null;
  running: boolean;
}

/**
 * 计算流水线进度（含进行中步骤的部分进度）。
 */
function calcProgress(
  agentStatuses: Record<AgentName, AgentStepStatus>,
  activeAgent: AgentName | null,
  running: boolean,
): number {
  const doneCount = AGENT_ORDER.filter((a) => agentStatuses[a] === 'done').length;
  let progress = (doneCount / AGENT_ORDER.length) * 100;
  if (running && activeAgent) {
    progress += 100 / AGENT_ORDER.length / 2;
  }
  return Math.min(Math.round(progress), 100);
}

/**
 * 底部紧凑进度条：步骤标签 + 百分比 + 当前 Agent。
 */
export function PipelineProgressBar({
  agentStatuses,
  activeAgent,
  running,
}: PipelineProgressBarProps) {
  const progress = calcProgress(agentStatuses, activeAgent, running);
  const activeMeta = activeAgent
    ? AGENTS.find((a) => a.id === activeAgent)
    : null;

  return (
    <div className="shrink-0 border-t bg-muted/20 px-4 py-2.5">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex gap-2">
          {STEP_LABELS.map((label, i) => {
            const agent = AGENT_ORDER[i];
            const st = agentStatuses[agent];
            return (
              <span
                key={label}
                className={
                  st === 'done'
                    ? 'font-medium text-emerald-600'
                    : st === 'running'
                      ? 'font-medium text-primary'
                      : ''
                }
              >
                {label}
              </span>
            );
          })}
        </div>
        <span className="tabular-nums">
          {progress}%
          {activeMeta && running ? ` · ${activeMeta.name}` : ''}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${Math.max(progress, running ? 6 : 0)}%` }}
        />
      </div>
    </div>
  );
}
