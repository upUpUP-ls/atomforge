import { hasLlmKey, streamCompletion, simulateStream } from '@/lib/ai/llm';
import {
  getFallbackHtml,
  extractHtmlFromResponse,
} from './fallback-html';
import type { AgentContext } from './types';

const SYSTEM = `你是 Alex，AtomForge 的 Engineer（全栈工程师）。
你的职责：根据架构设计，生成一个完整可运行的单页 HTML 应用。
要求：
1. 输出单个完整 HTML 文件（内联 CSS 和 JavaScript）
2. 必须包含 <!DOCTYPE html> 和完整 <html>...</html>
3. 应用必须可交互（按钮、输入等真实可用）
4. 现代简洁 UI
5. 只输出 HTML 代码，包裹在 \`\`\`html 代码块中`;

/**
 * 流式输出 Alex 生成的 HTML（LLM 模式流式 raw，Fallback 流式 HTML）。
 */
export async function* streamAlex(ctx: AgentContext): AsyncGenerator<string> {
  const archContext = ctx.artifacts.architecture
    ? `\n\n架构设计：\n${ctx.artifacts.architecture}`
    : '';
  const prdContext = ctx.artifacts.prd
    ? `\n\nPRD：\n${ctx.artifacts.prd.slice(0, 1500)}`
    : '';

  if (!hasLlmKey()) {
    yield* simulateStream(getFallbackHtml(ctx.userPrompt));
    return;
  }

  yield* streamCompletion(
    SYSTEM,
    `用户需求：\n${ctx.userPrompt}${prdContext}${archContext}\n\n请生成完整 HTML 应用。`,
  );
}

/**
 * Alex 迭代流式输出。
 */
export async function* streamAlexIteration(
  ctx: AgentContext,
  feedback: string,
): AsyncGenerator<string> {
  const currentCode = ctx.artifacts.code ?? '';

  if (!hasLlmKey()) {
    yield* simulateStream(getFallbackHtml(`${ctx.userPrompt} ${feedback}`));
    return;
  }

  yield* streamCompletion(
    SYSTEM,
    `原始需求：${ctx.userPrompt}\n\n当前代码：\n\`\`\`html\n${currentCode.slice(0, 8000)}\n\`\`\`\n\n用户修改要求：${feedback}\n\n请输出修改后的完整 HTML。`,
  );
}

/**
 * Alex Agent：生成可运行的单页 HTML 应用。
 */
export async function runAlex(
  ctx: AgentContext,
  onDelta?: (delta: string) => void,
): Promise<string> {
  let result = '';
  for await (const delta of streamAlex(ctx)) {
    result += delta;
    onDelta?.(delta);
  }
  return hasLlmKey() ? extractHtmlFromResponse(result) : result;
}

/**
 * Alex 迭代模式：根据用户反馈重新生成代码。
 */
export async function runAlexIteration(
  ctx: AgentContext,
  feedback: string,
  onDelta?: (delta: string) => void,
): Promise<string> {
  let result = '';
  for await (const delta of streamAlexIteration(ctx, feedback)) {
    result += delta;
    onDelta?.(delta);
  }
  return hasLlmKey() ? extractHtmlFromResponse(result) : result;
}
