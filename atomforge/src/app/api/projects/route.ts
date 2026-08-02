import { isErrorResponse, requireSession } from '@/lib/api/auth';
import { jsonCreated, jsonData, jsonError } from '@/lib/api/response';
import { createUserProject, getUserProjects } from '@/features/projects/service';
import { PROJECT_TEMPLATES, type TemplateId } from '@/features/projects/templates';

interface CreateProjectBody {
  title?: string;
  prompt?: string;
  templateId?: TemplateId;
}

/**
 * 解析创建项目请求体，支持模板 ID 或直接 prompt。
 */
function parseCreateBody(body: CreateProjectBody): { title?: string; prompt: string } | string {
  if (body.templateId) {
    const template = PROJECT_TEMPLATES.find((t) => t.id === body.templateId);
    if (!template) {
      return '无效的模板 ID';
    }
    return {
      title: body.title?.trim() || template.title,
      prompt: template.prompt,
    };
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return '请填写项目描述或选择模板';
  }

  return { title: body.title, prompt };
}

/**
 * GET /api/projects — 获取当前用户项目列表。
 */
export async function GET() {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  const projects = await getUserProjects(user.id);
  return jsonData({ projects });
}

/**
 * POST /api/projects — 创建新项目。
 */
export async function POST(request: Request) {
  const user = await requireSession();
  if (isErrorResponse(user)) return user;

  try {
    const body = (await request.json()) as CreateProjectBody;
    const parsed = parseCreateBody(body);

    if (typeof parsed === 'string') {
      return jsonError(parsed, 400);
    }

    const project = await createUserProject(user.id, parsed);
    return jsonCreated(
      {
        project: {
          ...project,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      },
      `/api/projects/${project.id}`,
    );
  } catch (error) {
    console.error('Create project error:', error);
    return jsonError('创建项目失败', 500);
  }
}
