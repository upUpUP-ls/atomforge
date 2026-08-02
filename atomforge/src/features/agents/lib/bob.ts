import { hasLlmKey, streamCompletion, simulateStream } from '@/lib/ai/llm';
import { fallbackBobArchitecture } from './fallback';
import type { AgentContext } from './types';

const SYSTEM = `你是 Bob，AtomForge 的 Architect（架构师）。
你的职责：根据 PRD 设计系统架构，输出：技术选型、组件树、页面结构、数据结构。
输出 Markdown + 可选 JSON 代码块。使用中文。`;

/**
 * 流式输出 Bob 架构设计文本。
 */
export async function* streamBob(ctx: AgentContext): AsyncGenerator<string> {
  const prdContext = ctx.artifacts.prd
    ? `\n\nPRD：\n${ctx.artifacts.prd}`
    : '';

  if (!hasLlmKey()) {
    yield* simulateStream(fallbackBobArchitecture(ctx.userPrompt));
    return;
  }

  yield* streamCompletion(
    SYSTEM,
    `用户需求：\n${ctx.userPrompt}${prdContext}\n\n请输出架构设计。`,
  );
}

/**
 * Bob Agent：产出系统架构设计。
 */
export async function runBob(
  ctx: AgentContext,
  onDelta?: (delta: string) => void,
): Promise<string> {
  let result = '';
  for await (const delta of streamBob(ctx)) {
    result += delta;
    onDelta?.(delta);
  }
  return result;
}
