import type { AgentName, ArtifactType } from '@/types';

export interface AgentContext {
  projectId: string;
  userPrompt: string;
  artifacts: Partial<Record<ArtifactType, string>>;
}

export type PipelineMode = 'full' | 'plan-only' | 'build' | 'alex-only';

import type { WorkflowStep } from './editor-state-types';

export type PipelineEventType =
  | 'agent_start'
  | 'agent_delta'
  | 'agent_complete'
  | 'plan_ready'
  | 'workflow_step'
  | 'pipeline_complete'
  | 'error';

export interface PipelineEvent {
  type: PipelineEventType;
  agent?: AgentName;
  artifactType?: ArtifactType;
  content?: string;
  delta?: string;
  message?: string;
  step?: WorkflowStep;
}

export interface AgentStep {
  agent: AgentName;
  artifactType: ArtifactType;
}

/** SOP 流水线顺序：Mike → Emma → Bob → Alex */
export const AGENT_PIPELINE: AgentStep[] = [
  { agent: 'mike', artifactType: 'plan' },
  { agent: 'emma', artifactType: 'prd' },
  { agent: 'bob', artifactType: 'architecture' },
  { agent: 'alex', artifactType: 'code' },
];

export type AgentDeltaCallback = (delta: string) => void;

export type AgentRunner = (
  ctx: AgentContext,
  onDelta?: AgentDeltaCallback,
) => Promise<string>;

/**
 * 根据运行模式返回 Agent 步骤列表。
 */
export function getPipelineSteps(mode: PipelineMode): AgentStep[] {
  switch (mode) {
    case 'plan-only':
      return [AGENT_PIPELINE[0]];
    case 'build':
      return AGENT_PIPELINE.slice(1);
    case 'alex-only':
      return [AGENT_PIPELINE[3]];
    default:
      return AGENT_PIPELINE;
  }
}
