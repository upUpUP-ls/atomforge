import { hasLlmKey, streamCompletion, simulateStream } from '@/lib/ai/llm';
import { fallbackMikePlan } from './fallback';
import type { AgentContext } from './types';

const SYSTEM = `你是 Mike，AtomForge 的 Team Leader（团队负责人）。
你的职责：收到用户需求后，分解为清晰的执行计划（3-4 步），协调 Emma(PM)、Bob(架构师)、Alex(工程师) 依次工作。
输出简洁的 Markdown 计划，包含步骤列表和预计交付物。使用中文。`;

/**
 * 流式输出 Mike 计划文本。
 */
export async function* streamMike(ctx: AgentContext): AsyncGenerator<string> {
  if (!hasLlmKey()) {
    yield* simulateStream(fallbackMikePlan(ctx.userPrompt));
    return;
  }
  yield* streamCompletion(
    SYSTEM,
    `用户需求：\n${ctx.userPrompt}\n\n请输出项目执行计划。`,
  );
}

/**
 * Mike Agent：分解任务，输出执行计划。
 */
export async function runMike(
  ctx: AgentContext,
  onDelta?: (delta: string) => void,
): Promise<string> {
  let result = '';
  for await (const delta of streamMike(ctx)) {
    result += delta;
    onDelta?.(delta);
  }
  return result;
}
