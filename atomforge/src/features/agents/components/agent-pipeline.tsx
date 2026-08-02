import { AGENTS, type AgentName } from '@/types';
import type { AgentStepStatus } from '../lib/editor-state';

const PIPELINE_LABELS = ['Research', 'Plan', 'Architect', 'Build'];

interface AgentPipelineProps {
  agentStatuses: Record<AgentName, AgentStepStatus>;
  activeAgent: AgentName | null;
  projectStatus: string;
}

/**
 * 计算流水线整体进度百分比。
 */
function calcProgress(
  agentStatuses: Record<AgentName, AgentStepStatus>,
): number {
  const agents: AgentName[] = ['mike', 'emma', 'bob', 'alex'];
  const doneCount = agents.filter(
    (a) => agentStatuses[a] === 'done',
  ).length;
  return Math.round((doneCount / agents.length) * 100);
}

/**
 * Agent 流水线进度条：四步 SOP + 百分比。
 */
export function AgentPipeline({
  agentStatuses,
  activeAgent,
  projectStatus,
}: AgentPipelineProps) {
  const progress = calcProgress(agentStatuses);
  const agents = AGENTS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">流水线进度</span>
        <span className="tabular-nums">
          {progress}% ·{' '}
          {projectStatus === 'done'
            ? 'Done'
            : activeAgent
              ? agents.find((a) => a.id === activeAgent)?.name
              : 'Ready'}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{ width: `${Math.max(progress, activeAgent ? 8 : 0)}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-1">
        {agents.map((agent, i) => {
          const st = agentStatuses[agent.id];
          return (
            <div key={agent.id} className="text-center">
              <div
                className={`mx-auto mb-1 flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  st === 'done'
                    ? 'bg-emerald-500 text-white'
                    : st === 'running'
                      ? 'bg-primary text-primary-foreground animate-pulse'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {st === 'done' ? '✓' : i + 1}
              </div>
              <p className="truncate text-[10px] text-muted-foreground">
                {PIPELINE_LABELS[i]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
