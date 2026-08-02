import { isErrorResponse, requireSession } from '@/lib/api/auth';
import { jsonData, jsonError } from '@/lib/api/response';
import { getOwnedProject } from '@/features/projects/pipeline-runs';
import {
  parseChatArtifact,
  parseWorkflowArtifact,
} from '@/features/projects/session-artifacts';
import {
  loadChatMessages,
  loadWorkflowSteps,
  saveChatMessages,
  saveWorkflowSteps,
} from '@/features/projects/session-store';
import type { ChatMessage } from '@/features/agents/lib/editor-state';
import type { WorkflowStep } from '@/features/agents/lib/editor-state-types';

interface SessionBody {
  chat?: ChatMessage[];
  workflow?: WorkflowStep[];
}

/**
 * GET /api/projects/:id/session — 读取持久化的对话与工作流程。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id: projectId } = await params;
  const project = await getOwnedProject(projectId, user.id);
  if (!project) {
    return jsonError('项目不存在', 404);
  }

  const [chat, workflow] = await Promise.all([
    loadChatMessages(projectId),
    loadWorkflowSteps(projectId),
  ]);

  return jsonData({ chat, workflow });
}

/**
 * PUT /api/projects/:id/session — 保存对话与工作流程快照。
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id: projectId } = await params;
  const project = await getOwnedProject(projectId, user.id);
  if (!project) {
    return jsonError('项目不存在', 404);
  }

  try {
    const body = (await request.json()) as SessionBody;

    if (body.chat) {
      const chat = parseChatArtifact(JSON.stringify(body.chat));
      await saveChatMessages(projectId, chat);
    }

    if (body.workflow) {
      const workflow = parseWorkflowArtifact(JSON.stringify(body.workflow));
      await saveWorkflowSteps(projectId, workflow);
    }

    const [chat, workflow] = await Promise.all([
      loadChatMessages(projectId),
      loadWorkflowSteps(projectId),
    ]);

    return jsonData({ chat, workflow });
  } catch (error) {
    console.error('Save session error:', error);
    return jsonError('保存会话失败', 500);
  }
}
