import { auth } from '@/lib/auth';
import { sseError } from '@/lib/api/response';
import { runPipeline } from '@/features/agents/lib/orchestrator';
import type { PipelineEvent, PipelineMode } from '@/features/agents/lib/types';
import {
  getPipelineRunForProject,
  updatePipelineRunStatus,
} from '@/features/projects/pipeline-runs';

/**
 * 将 Pipeline 事件编码为 SSE 数据帧。
 */
function encodeSseEvent(event: PipelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * GET /api/projects/:id/pipeline-runs/:runId/events — SSE 流式事件。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; runId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return sseError('未登录', 401);
  }

  const { id: projectId, runId } = await params;
  const run = await getPipelineRunForProject(
    projectId,
    runId,
    session.user.id,
  );

  if (!run) {
    return sseError('流水线运行不存在', 404);
  }

  if (run.status === 'running') {
    return sseError('流水线正在执行中', 409);
  }

  if (run.status !== 'pending') {
    return sseError('流水线已结束，请创建新的运行', 409);
  }

  const mode = run.mode as PipelineMode;
  const feedback = run.feedback ?? undefined;
  const planOverride = run.planOverride ?? undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      await updatePipelineRunStatus(runId, 'running');

      try {
        for await (const event of runPipeline(
          projectId,
          run.project.prompt,
          mode,
          feedback,
          planOverride,
        )) {
          controller.enqueue(encoder.encode(encodeSseEvent(event)));

          if (event.type === 'error') {
            await updatePipelineRunStatus(runId, 'error');
            return;
          }

          if (event.type === 'plan_ready') {
            await updatePipelineRunStatus(runId, 'done');
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            return;
          }
        }

        await updatePipelineRunStatus(runId, 'done');
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        await updatePipelineRunStatus(runId, 'error');
        const message =
          error instanceof Error ? error.message : '流水线执行失败';
        controller.enqueue(
          encoder.encode(encodeSseEvent({ type: 'error', message })),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
