import { getAiStatus } from '@/lib/ai/llm';
import { jsonData } from '@/lib/api/response';

/**
 * GET /api/health/ai — 公开接口，返回当前 AI 模式（不暴露 Key）。
 */
export async function GET() {
  return jsonData(getAiStatus());
}
