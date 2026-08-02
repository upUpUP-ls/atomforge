import { auth } from '@/lib/auth';
import { jsonError } from '@/lib/api/response';

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

/**
 * 校验登录 Session，未登录返回 401 Response。
 */
export async function requireSession(): Promise<
  SessionUser | Response
> {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError('未登录', 401);
  }
  return session.user as SessionUser;
}

/**
 * 判断 requireSession 是否返回错误 Response。
 */
export function isErrorResponse(
  value: SessionUser | Response,
): value is Response {
  return value instanceof Response;
}
