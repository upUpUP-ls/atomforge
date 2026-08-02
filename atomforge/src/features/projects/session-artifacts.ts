import type { ChatMessage } from '@/features/agents/lib/editor-state';
import type { WorkflowStep } from '@/features/agents/lib/editor-state-types';
import type { ArtifactType } from '@/types';

export const SESSION_ARTIFACT_TYPES = ['workflow', 'chat'] as const;
export type SessionArtifactType = (typeof SESSION_ARTIFACT_TYPES)[number];

/**
 * 解析 workflow 产物 JSON。
 */
export function parseWorkflowArtifact(content?: string): WorkflowStep[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content) as WorkflowStep[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((step) => ({ ...step, status: 'done' as const }));
  } catch {
    return [];
  }
}

/**
 * 解析 chat 产物 JSON。
 */
export function parseChatArtifact(content?: string): ChatMessage[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((msg) => ({ ...msg, streaming: false }));
  } catch {
    return [];
  }
}

/**
 * 序列化对话消息（去掉 streaming 状态）。
 */
export function serializeChatMessages(messages: ChatMessage[]): string {
  return JSON.stringify(
    messages.map((msg) => ({ ...msg, streaming: false })),
  );
}

/**
 * 序列化工作流程步骤（持久化均为已完成）。
 */
export function serializeWorkflowSteps(steps: WorkflowStep[]): string {
  return JSON.stringify(
    steps.map((step) => ({ ...step, status: 'done' as const })),
  );
}

/**
 * 判断是否为会话类产物（不参与代码仓库 docs/ 导出）。
 */
export function isSessionArtifactType(type: string): type is SessionArtifactType {
  return SESSION_ARTIFACT_TYPES.includes(type as SessionArtifactType);
}

/**
 * 合并已有步骤与本次运行新增步骤。
 */
export function mergeWorkflowSteps(
  existing: WorkflowStep[],
  incoming: WorkflowStep[],
): WorkflowStep[] {
  const seen = new Set(existing.map((step) => step.id));
  const appended = incoming.filter((step) => !seen.has(step.id));
  return [...existing, ...appended];
}
