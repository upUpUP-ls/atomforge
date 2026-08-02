import { db } from '@/lib/db';
import type { ChatMessage } from '@/features/agents/lib/editor-state';
import type { WorkflowStep } from '@/features/agents/lib/editor-state-types';
import {
  mergeWorkflowSteps,
  parseChatArtifact,
  parseWorkflowArtifact,
  serializeChatMessages,
  serializeWorkflowSteps,
} from '@/features/projects/session-artifacts';

/**
 * 读取最新 workflow 产物。
 */
export async function loadWorkflowSteps(
  projectId: string,
): Promise<WorkflowStep[]> {
  const row = await db.artifact.findFirst({
    where: { projectId, type: 'workflow' },
    orderBy: { version: 'desc' },
  });
  return parseWorkflowArtifact(row?.content);
}

/**
 * 读取最新 chat 产物。
 */
export async function loadChatMessages(
  projectId: string,
): Promise<ChatMessage[]> {
  const row = await db.artifact.findFirst({
    where: { projectId, type: 'chat' },
    orderBy: { version: 'desc' },
  });
  return parseChatArtifact(row?.content);
}

/**
 * 保存 workflow 产物。
 */
export async function saveWorkflowSteps(
  projectId: string,
  steps: WorkflowStep[],
): Promise<void> {
  await saveSessionArtifact(projectId, 'workflow', serializeWorkflowSteps(steps));
}

/**
 * 追加 workflow 步骤并保存。
 */
export async function appendWorkflowSteps(
  projectId: string,
  incoming: WorkflowStep[],
): Promise<WorkflowStep[]> {
  const existing = await loadWorkflowSteps(projectId);
  const merged = mergeWorkflowSteps(existing, incoming);
  await saveWorkflowSteps(projectId, merged);
  return merged;
}

/**
 * 保存 chat 产物。
 */
export async function saveChatMessages(
  projectId: string,
  messages: ChatMessage[],
): Promise<void> {
  await saveSessionArtifact(projectId, 'chat', serializeChatMessages(messages));
}

/**
 * 更新 Alex 面向用户的消息，保留用户迭代消息。
 */
export async function saveAlexStatusMessage(
  projectId: string,
  content: string,
): Promise<ChatMessage[]> {
  const existing = await loadChatMessages(projectId);
  const userMessages = existing.filter((msg) => msg.role === 'user');
  const messages: ChatMessage[] = [
    {
      id: 'alex-face',
      role: 'agent',
      agent: 'alex',
      content,
      streaming: false,
    },
    ...userMessages,
  ];
  await saveChatMessages(projectId, messages);
  return messages;
}

/**
 * 写入会话类 artifact。
 */
async function saveSessionArtifact(
  projectId: string,
  type: 'workflow' | 'chat',
  content: string,
): Promise<void> {
  const latest = await db.artifact.findFirst({
    where: { projectId, type },
    orderBy: { version: 'desc' },
  });

  await db.artifact.create({
    data: {
      projectId,
      type,
      content,
      version: (latest?.version ?? 0) + 1,
    },
  });
}
