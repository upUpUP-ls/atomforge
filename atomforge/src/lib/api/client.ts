/**
 * 解析 REST API 统一响应体 { data } / { error }。
 */
export async function parseApiResponse<T>(res: Response): Promise<T> {
  const body = await res.json();

  if (!res.ok) {
    const message =
      typeof body.error?.message === 'string'
        ? body.error.message
        : '请求失败';
    throw new Error(message);
  }

  return body.data as T;
}

/**
 * 解析 204 No Content 响应。
 */
export function parseNoContent(res: Response): void {
  if (!res.ok && res.status !== 204) {
    throw new Error('请求失败');
  }
}
