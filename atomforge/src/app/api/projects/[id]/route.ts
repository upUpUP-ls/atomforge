import { isErrorResponse, requireSession } from '@/lib/api/auth';
import { jsonData, jsonError } from '@/lib/api/response';
import {
  deleteUserProject,
  getUserProject,
  updateUserProject,
} from '@/features/projects/service';

interface UpdateProjectBody {
  title?: string;
}

/**
 * GET /api/projects/:id — 获取单个项目详情。
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id } = await params;
  const project = await getUserProject(id, user.id);

  if (!project) {
    return jsonError('项目不存在', 404);
  }

  return jsonData({ project });
}

/**
 * PATCH /api/projects/:id — 部分更新项目。
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id } = await params;

  try {
    const body = (await request.json()) as UpdateProjectBody;
    const project = await updateUserProject(id, user.id, body);

    if (!project) {
      return jsonError('项目不存在', 404);
    }

    return jsonData({
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update project error:', error);
    return jsonError('更新项目失败', 500);
  }
}

/**
 * DELETE /api/projects/:id — 删除项目。
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const { id } = await params;
  const deleted = await deleteUserProject(id, user.id);

  if (!deleted) {
    return jsonError('项目不存在', 404);
  }

  return new Response(null, { status: 204 });
}
