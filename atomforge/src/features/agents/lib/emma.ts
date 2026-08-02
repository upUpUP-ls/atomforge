import { hasLlmKey, streamCompletion, simulateStream } from '@/lib/ai/llm';
import { fallbackEmmaPrd } from './fallback';
import type { AgentContext } from './types';

const SYSTEM = `你是 Emma，AtomForge 的 Product Manager（产品经理）。
你的职责：根据用户需求和 Team Leader 的计划，输出精简 PRD，包含：目标用户、核心功能列表、页面列表、用户故事。
输出 Markdown 格式，简洁实用。使用中文。`;

/**
 * 流式输出 Emma PRD 文本。
 */
export async function* streamEmma(ctx: AgentContext): AsyncGenerator<string> {
  const planContext = ctx.artifacts.plan
    ? `\n\nTeam Leader 计划：\n${ctx.artifacts.plan}`
    : '';

  if (!hasLlmKey()) {
    yield* simulateStream(fallbackEmmaPrd(ctx.userPrompt));
    return;
  }

  yield* streamCompletion(
    SYSTEM,
    `用户需求：\n${ctx.userPrompt}${planContext}\n\n请输出 PRD。`,
  );
}

/**
 * Emma Agent：产出 PRD 产品需求文档。
 */
export async function runEmma(
  ctx: AgentContext,
  onDelta?: (delta: string) => void,
): Promise<string> {
  let result = '';
  for await (const delta of streamEmma(ctx)) {
    result += delta;
    onDelta?.(delta);
  }
  return result;
}
