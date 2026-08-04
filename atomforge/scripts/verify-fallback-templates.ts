/**
 * 验证 Fallback 模式是否为固定模板（无需 API Key）。
 * 运行：npx tsx scripts/verify-fallback-templates.ts
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import {
  fallbackMikePlan,
  fallbackEmmaPrd,
  fallbackBobArchitecture,
  matchFallbackTemplate,
} from '../src/features/agents/lib/fallback';
import { getFallbackHtml } from '../src/features/agents/lib/fallback-html';
import { hasLlmKey } from '../src/lib/ai/llm';

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function section(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
}

/** 主流程：多组 prompt 对比输出哈希与字节长度。 */
function main(): void {
  section('1. 环境检查');
  console.log(`OPENAI_API_KEY 已配置: ${hasLlmKey()}`);
  if (hasLlmKey()) {
    console.warn('⚠️  当前有 API Key，本脚本验证的是 Fallback 函数本身（与 Key 无关）');
  }

  section('2. 模板分类：仅 4 种 + 销售页特殊计划');
  const classifyCases = [
    '做一个 Todo 待办应用',
    '帮我做 landing page',
    '数据 dashboard 仪表盘',
    '做一个博客系统',
    '前端销售网页',
    '电商商城',
  ];
  for (const p of classifyCases) {
    console.log(`  [${matchFallbackTemplate(p).padEnd(9)}] ${p}`);
  }

  section('3. 同类型不同措辞 → HTML 是否完全一致（固定模板铁证）');
  const todoPrompts = [
    '简单的 Todo 待办应用',
    '帮我做一个任务列表 todo app',
    '待办事项管理器，支持增删改',
  ];
  const todoHashes = todoPrompts.map((p) => sha256(getFallbackHtml(p)));
  const todoUnique = new Set(todoHashes);
  console.log('  Todo 类 prompt 数量:', todoPrompts.length);
  console.log('  唯一 HTML 哈希数:', todoUnique.size);
  console.log('  各 prompt 哈希:', todoPrompts.map((p, i) => `\n    "${p}" → ${todoHashes[i]}`).join(''));
  console.log(todoUnique.size === 1 ? '  ✅ 结论：同类型输出 100% 相同 → 固定 HTML 常量' : '  ❌ 输出有差异');

  section('4. 重复运行同一 prompt → 是否 deterministic');
  const fixed = '帮我做一个前端销售网页';
  const run1 = getFallbackHtml(fixed);
  const run2 = getFallbackHtml(fixed);
  const run3 = fallbackMikePlan(fixed);
  const run4 = fallbackMikePlan(fixed);
  console.log(`  HTML 两次哈希相同: ${sha256(run1) === sha256(run2)} (${sha256(run1)})`);
  console.log(`  Plan 两次哈希相同: ${sha256(run3) === sha256(run4)} (${sha256(run3)})`);

  section('5. 跨类型对比 → 仅关键词路由，非 LLM 理解');
  const pairs: Array<[string, string]> = [
    ['Todo 应用', '任务列表 todo'],
    ['SaaS landing 页', '营销首页'],
    ['dashboard KPI', '数据图表仪表盘'],
  ];
  for (const [a, b] of pairs) {
    const same = sha256(getFallbackHtml(a)) === sha256(getFallbackHtml(b));
    console.log(`  "${a}" vs "${b}" → HTML 相同: ${same}`);
  }

  section('6. 销售类 vs landing 类：计划不同但 HTML 可能相同');
  const salesPlan = fallbackMikePlan('前端销售网页');
  const landingPlan = fallbackMikePlan('SaaS landing 落地页');
  const salesHtml = getFallbackHtml('前端销售网页');
  const landingHtml = getFallbackHtml('SaaS landing 落地页');
  console.log(`  销售 prompt 匹配类型: ${matchFallbackTemplate('前端销售网页')}`);
  console.log(`  landing prompt 匹配类型: ${matchFallbackTemplate('SaaS landing 落地页')}`);
  console.log(`  计划文本相同: ${salesPlan === landingPlan}`);
  console.log(`  HTML 相同: ${salesHtml === landingHtml}`);
  console.log('  → 销售类有独立计划模板，但 HTML 仍走 landing 固定页');

  section('7. generic 类型：计划会插入 prompt 片段，HTML 仍固定');
  const g1 = '做一个在线投票系统';
  const g2 = '做一个宠物领养平台';
  const plan1 = fallbackMikePlan(g1);
  const plan2 = fallbackMikePlan(g2);
  const html1 = getFallbackHtml(g1);
  const html2 = getFallbackHtml(g2);
  console.log(`  计划不同: ${plan1 !== plan2}`);
  console.log(`  计划含各自 prompt: ${plan1.includes('在线投票') && plan2.includes('宠物领养')}`);
  console.log(`  HTML 相同: ${html1 === html2}`);
  console.log(`  generic HTML 长度: ${html1.length} bytes（常量）`);

  section('8. 四 Agent 产物来源汇总');
  const sample = 'Todo 待办应用';
  console.log(`  Mike plan  : ${fallbackMikePlan(sample).length} chars, hash=${sha256(fallbackMikePlan(sample))}`);
  console.log(`  Emma PRD   : ${fallbackEmmaPrd(sample).length} chars, hash=${sha256(fallbackEmmaPrd(sample))}`);
  console.log(`  Bob arch   : ${fallbackBobArchitecture(sample).length} chars`);
  console.log(`  Alex HTML  : ${getFallbackHtml(sample).length} bytes, hash=${sha256(getFallbackHtml(sample))}`);

  section('9. 最终结论');
  console.log(`
  Fallback 模式 = 固定模板系统，证据链：

  ① 代码分支：hasLlmKey() === false 时直接调用 fallback*.ts 中的预置字符串
  ② HTML 仅 4 份常量（TODO_HTML / LANDING_HTML / DASHBOARD_HTML / GENERIC_HTML）
  ③ 同关键词类别 → 任意措辞 → 输出字节级相同
  ④ 重复调用 → 哈希不变（无随机性、无网络请求）
  ⑤ 唯一“变化”：matchFallbackTemplate() 正则关键词路由 + generic/销售计划里嵌入 prompt 文本

  因此：无法证明“不是固定模板”；应表述为「关键词路由的预置模板 Demo」。
  要证明真实 AI 生成，必须配置 OPENAI_API_KEY 并对比输出随 prompt 语义变化。
`);
}

main();
