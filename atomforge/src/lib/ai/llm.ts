import OpenAI from 'openai';

/** 生产环境使用的 OpenAI 模型 ID。 */
export const LLM_MODEL = 'gpt-4o-mini';

export type AiMode = 'openai' | 'fallback';

export interface AiStatus {
  mode: AiMode;
  model: string | null;
  configured: boolean;
}

/**
 * 判断是否配置了 OpenAI API Key。
 */
export function hasLlmKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * 返回当前 AI 运行模式（供 health 接口与 UI 展示）。
 */
export function getAiStatus(): AiStatus {
  const configured = hasLlmKey();
  return {
    configured,
    mode: configured ? 'openai' : 'fallback',
    model: configured ? LLM_MODEL : null,
  };
}

/**
 * 获取 OpenAI 客户端实例。
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置');
  }
  return new OpenAI({ apiKey });
}

/**
 * 流式调用 LLM，逐块 yield 文本 delta。
 */
export async function* streamCompletion(
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      yield delta;
    }
  }
}

/**
 * 非流式调用 LLM，返回完整文本。
 */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  let result = '';
  for await (const delta of streamCompletion(systemPrompt, userPrompt)) {
    result += delta;
  }
  return result;
}

/**
 * 将完整文本模拟为流式 delta 推送（Fallback 模式用）。
 */
export async function* simulateStream(text: string): AsyncGenerator<string> {
  const chunkSize = 24;
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
  }
}
