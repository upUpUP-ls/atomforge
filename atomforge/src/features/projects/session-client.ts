import { parseApiResponse } from '@/lib/api/client';
import type { ChatMessage } from '@/features/agents/lib/editor-state';
import type { WorkflowStep } from '@/features/agents/lib/editor-state-types';

interface SessionPayload {
  chat?: ChatMessage[];
  workflow?: WorkflowStep[];
}

/**
 * 持久化左侧对话与工作流程快照。
 */
export async function persistProjectSession(
  projectId: string,
  payload: SessionPayload,
): Promise<void> {
  await fetch(`/api/projects/${projectId}/session`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * 读取已持久化的会话状态。
 */
export async function fetchProjectSession(projectId: string): Promise<{
  chat: ChatMessage[];
  workflow: WorkflowStep[];
}> {
  const res = await fetch(`/api/projects/${projectId}/session`);
  return parseApiResponse(res);
}
