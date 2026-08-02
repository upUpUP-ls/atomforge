import type { AgentName } from '@/types';
import type { ArtifactType } from '@/types';
import {
  parseChatArtifact,
  parseWorkflowArtifact,
} from '@/features/projects/session-artifacts';
import { reconstructFallbackWorkflow } from './mock-workflow';
import type { WorkflowStep } from './editor-state-types';

export type AgentStepStatus = 'pending' | 'running' | 'done' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  agent?: AgentName;
  content: string;
  streaming?: boolean;
}

export interface InitialArtifacts {
  plan?: string;
  prd?: string;
  architecture?: string;
  code?: string;
  workflow?: string;
  chat?: string;
}

export interface CodeVersion {
  version: number;
  content: string;
  createdAt: string;
}

const AGENT_ARTIFACT_MAP: Record<AgentName, ArtifactType> = {
  mike: 'plan',
  emma: 'prd',
  bob: 'architecture',
  alex: 'code',
};

/** 对外展示的 Agent 固定为 Alex */
export const FACE_AGENT: AgentName = 'alex';

/**
 * 根据已有产物推断各 Agent 初始状态（后台进度用）。
 */
export function buildInitialAgentStatuses(
  artifacts: InitialArtifacts,
): Record<AgentName, AgentStepStatus> {
  return {
    mike: artifacts.plan ? 'done' : 'pending',
    emma: artifacts.prd ? 'done' : 'pending',
    bob: artifacts.architecture ? 'done' : 'pending',
    alex: artifacts.code ? 'done' : 'pending',
  };
}

/**
 * 从持久化 chat 产物或产物状态构建初始 Alex 对话。
 */
export function buildInitialMessages(
  artifacts: InitialArtifacts,
): ChatMessage[] {
  const persisted = parseChatArtifact(artifacts.chat);
  if (persisted.length > 0) {
    return persisted;
  }

  if (artifacts.code) {
    return [
      {
        id: 'alex-face',
        role: 'agent',
        agent: FACE_AGENT,
        content: '✓ 应用已生成，请在右侧 Preview 查看与交互。',
        streaming: false,
      },
    ];
  }

  if (artifacts.plan && !artifacts.prd) {
    return [
      {
        id: 'alex-face',
        role: 'agent',
        agent: FACE_AGENT,
        content: '实施计划已就绪，请查阅下方步骤并批准。',
        streaming: false,
      },
    ];
  }

  return [];
}

/**
 * 从持久化 workflow 产物构建初始工作流程步骤。
 */
export function buildInitialWorkflowSteps(
  artifacts: InitialArtifacts,
  projectPrompt = '',
): WorkflowStep[] {
  const persisted = parseWorkflowArtifact(artifacts.workflow);
  if (persisted.length > 0) {
    return persisted;
  }

  if (artifacts.code && projectPrompt) {
    return reconstructFallbackWorkflow(projectPrompt).map((def, index) => ({
      id: `reconstructed-${index}`,
      kind: def.kind,
      label: def.label,
      detail: def.detail,
      status: 'done' as const,
    }));
  }

  return [];
}

export { AGENT_ARTIFACT_MAP };
