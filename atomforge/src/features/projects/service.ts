import { db } from '@/lib/db';
import type { ProjectSummary } from './templates';

interface CreateProjectInput {
  title?: string;
  prompt: string;
}

/**
 * 从 prompt 生成默认项目标题。
 */
function deriveTitle(prompt: string, title?: string): string {
  if (title?.trim()) {
    return title.trim().slice(0, 80);
  }
  const firstLine = prompt.trim().split('\n')[0];
  return firstLine.slice(0, 60) || '未命名项目';
}

/**
 * 查询用户全部项目，按更新时间倒序。
 */
export async function getUserProjects(userId: string): Promise<ProjectSummary[]> {
  return db.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      prompt: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 创建新项目并返回摘要。
 */
export async function createUserProject(
  userId: string,
  input: CreateProjectInput,
): Promise<ProjectSummary> {
  const prompt = input.prompt.trim();
  const title = deriveTitle(prompt, input.title);

  return db.project.create({
    data: {
      userId,
      title,
      prompt,
      status: 'draft',
    },
    select: {
      id: true,
      title: true,
      prompt: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 更新项目字段（标题等）。
 */
export async function updateUserProject(
  projectId: string,
  userId: string,
  data: { title?: string },
) {
  const existing = await getOwnedProjectSummary(projectId, userId);
  if (!existing) return null;

  return db.project.update({
    where: { id: projectId },
    data: {
      title: data.title?.trim() || existing.title,
    },
    select: {
      id: true,
      title: true,
      prompt: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 删除项目（级联删除子资源）。
 */
export async function deleteUserProject(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const existing = await getOwnedProjectSummary(projectId, userId);
  if (!existing) return false;

  await db.project.delete({ where: { id: projectId } });
  return true;
}

/**
 * 校验项目归属并返回摘要字段。
 */
async function getOwnedProjectSummary(projectId: string, userId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true, title: true },
  });
}

/**
 * 获取单个项目，校验归属当前用户。
 */
export async function getUserProject(projectId: string, userId: string) {
  return db.project.findFirst({
    where: { id: projectId, userId },
    include: {
      artifacts: {
        orderBy: { version: 'desc' },
        take: 10,
      },
      agentRuns: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}
