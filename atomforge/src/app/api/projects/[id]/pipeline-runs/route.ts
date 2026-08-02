import { NextResponse } from 'next/server';
import { isErrorResponse, requireSession } from '@/lib/api/auth';
import { jsonCreated, jsonData, jsonError } from '@/lib/api/response';
import {
  createPipelineRun,
  getOwnedProject,
  listPipelineRuns,
  type PipelineMode,
} from '@/features/projects/pipeline-runs';

interface CreatePipelineRunBody {
  mode?: PipelineMode;
  feedback?: string;
  planOverride?: string;
}

/**
 * GET /api/projects/:id/pipeline-runs — 列出项目流水线运行记录。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id: projectId } = await params;
  const runs = await listPipelineRuns(projectId, user.id);

  if (!runs) {
    return jsonError('项目不存在', 404);
  }

  return jsonData({ pipelineRuns: runs });
}

/**
 * POST /api/projects/:id/pipeline-runs — 创建流水线运行，返回 events 链接。
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id: projectId } = await params;

  try {
    const body = (await request.json()) as CreatePipelineRunBody;
    const mode = body.mode ?? 'full';

    if (mode === 'alex-only' && !body.feedback?.trim()) {
      return jsonError('迭代模式需要提供 feedback', 400);
    }

    const project = await getOwnedProject(projectId, user.id);
    if (!project) {
      return jsonError('项目不存在', 404);
    }

    if (project.status === 'building') {
      return jsonError('流水线正在执行中', 409);
    }

    if (mode === 'build' && !['awaiting_approval', 'draft', 'done', 'error'].includes(project.status)) {
      return jsonError('请先完成计划阶段', 400);
    }

    const pipelineRun = await createPipelineRun(projectId, {
      mode,
      feedback: body.feedback,
      planOverride: body.planOverride,
    });

    const location = `/api/projects/${projectId}/pipeline-runs/${pipelineRun.id}`;
    const eventsUrl = `${location}/events`;

    return jsonCreated(
      {
        pipelineRun: {
          id: pipelineRun.id,
          projectId: pipelineRun.projectId,
          mode: pipelineRun.mode,
          status: pipelineRun.status,
          createdAt: pipelineRun.createdAt.toISOString(),
        },
        links: {
          self: location,
          events: eventsUrl,
        },
      },
      location,
    );
  } catch (error) {
    console.error('Create pipeline run error:', error);
    return jsonError('创建流水线失败', 500);
  }
}
