import { isErrorResponse, requireSession } from '@/lib/api/auth';
import { jsonData, jsonError } from '@/lib/api/response';
import { db } from '@/lib/db';

/**
 * GET /api/projects/:id/artifacts — 获取项目产物列表（可按 type 过滤）。
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const project = await db.project.findFirst({
    where: { id, userId: user.id },
  });

  if (!project) {
    return jsonError('项目不存在', 404);
  }

  if (type === 'all') {
    const rows = await db.artifact.findMany({
      where: { projectId: id },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        type: true,
        version: true,
        content: true,
        createdAt: true,
      },
    });

    const latestByType = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      if (!latestByType.has(row.type)) {
        latestByType.set(row.type, row);
      }
    }

    return jsonData({
      artifacts: Array.from(latestByType.values()).map((a) => ({
        id: a.id,
        type: a.type,
        version: a.version,
        content: a.content,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  }

  const artifactType = type ?? 'code';

  const artifacts = await db.artifact.findMany({
    where: { projectId: id, type: artifactType },
    orderBy: { version: 'desc' },
    select: {
      id: true,
      type: true,
      version: true,
      content: true,
      createdAt: true,
    },
  });

  return jsonData({
    artifacts: artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      version: a.version,
      content: a.content,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
