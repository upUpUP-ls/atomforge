import { db } from '@/lib/db';

import type { PipelineMode } from '@/features/agents/lib/types';

export type { PipelineMode };

export interface CreatePipelineRunInput {
  mode?: PipelineMode;
  feedback?: string;
  planOverride?: string;
}

/**
 * 校验项目归属当前用户。
 */
export async function getOwnedProject(projectId: string, userId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
  });
}

/**
 * 创建流水线运行记录（REST 子资源）。
 */
export async function createPipelineRun(
  projectId: string,
  input: CreatePipelineRunInput,
) {
  const mode = input.mode ?? 'full';

  return db.pipelineRun.create({
    data: {
      projectId,
      mode,
      feedback: input.feedback?.trim() || null,
      planOverride: input.planOverride?.trim() || null,
      status: 'pending',
    },
  });
}

/**
 * 获取项目下流水线运行记录，校验归属。
 */
export async function getPipelineRunForProject(
  projectId: string,
  runId: string,
  userId: string,
) {
  return db.pipelineRun.findFirst({
    where: {
      id: runId,
      projectId,
      project: { userId },
    },
    include: {
      project: { select: { prompt: true, status: true } },
    },
  });
}

/**
 * 列出项目流水线运行历史。
 */
export async function listPipelineRuns(projectId: string, userId: string) {
  const project = await getOwnedProject(projectId, userId);
  if (!project) return null;

  return db.pipelineRun.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      projectId: true,
      mode: true,
      feedback: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 更新流水线运行状态。
 */
export async function updatePipelineRunStatus(
  runId: string,
  status: string,
): Promise<void> {
  await db.pipelineRun.update({
    where: { id: runId },
    data: { status },
  });
}
