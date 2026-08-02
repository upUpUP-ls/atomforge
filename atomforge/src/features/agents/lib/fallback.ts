export type FallbackTemplateKind = 'todo' | 'landing' | 'dashboard' | 'generic';

/**
 * 根据 prompt 关键词匹配 Fallback 模板类型。
 */
export function matchFallbackTemplate(prompt: string): FallbackTemplateKind {
  const lower = prompt.toLowerCase();

  if (/todo|待办|任务列表/.test(lower)) {
    return 'todo';
  }
  if (/landing|落地页|saas|首页|营销/.test(lower)) {
    return 'landing';
  }
  if (/dashboard|仪表盘|图表|kpi|数据/.test(lower)) {
    return 'dashboard';
  }

  return 'generic';
}

/**
 * Mike Fallback：生成面向用户的实施计划（对齐 Atoms 计划卡片）。
 */
export function fallbackMikePlan(prompt: string): string {
  const lower = prompt.toLowerCase();
  const kind = matchFallbackTemplate(prompt);

  if (/销售|电商|shop|store|商城|售卖/.test(lower)) {
    return `请查阅以下网站页面和设计需求，确认是否全部批准，或提出需要调整的部分：

1. **首页** — Hero 横幅、产品亮点展示、客户评价、CTA 按钮
2. **产品展示页** — 网格布局、分类筛选、产品图片/名称/价格
3. **产品详情页** — 大图展示、详细描述、规格参数、「立即购买」按钮
4. **关于我们** — 公司介绍、团队展示、企业文化、发展历程
5. **联系我们** — 联系表单、地址、电话、邮箱信息
6. **响应式设计** — 适配桌面与移动端，现代 UI 风格与动画效果`;
  }

  if (kind === 'todo') {
    return `请查阅以下功能实施计划，确认是否全部批准，或提出需要调整的部分：

1. **任务输入** — 快速添加待办，支持 Enter 提交
2. **任务列表** — 展示全部任务，支持完成/删除
3. **状态筛选** — 全部 / 进行中 / 已完成
4. **本地持久化** — 使用 localStorage 保存数据
5. **响应式布局** — 移动端与桌面端均可流畅使用`;
  }

  if (kind === 'dashboard') {
    return `请查阅以下仪表盘实施计划，确认是否全部批准，或提出需要调整的部分：

1. **KPI 概览** — 4 个核心指标卡片，含环比趋势
2. **数据图表** — Chart.js 柱状图/折线图展示
3. **数据表格** — 最近记录列表与分页
4. **侧边导航** — 模块切换与当前页高亮
5. **响应式设计** — 适配不同屏幕尺寸`;
  }

  if (kind === 'landing') {
    return `请查阅以下落地页实施计划，确认是否全部批准，或提出需要调整的部分：

1. **Hero 区** — 主标题、副文案、主 CTA 按钮
2. **功能特性** — 三列图标 + 说明
3. **定价方案** — 多档价格卡片对比
4. **FAQ** — 折叠问答区块
5. **页脚 CTA** — 二次转化按钮与联系信息
6. **响应式设计** — 移动端优先，现代渐变 UI`;
  }

  return `请查阅以下应用实施计划，确认是否全部批准，或提出需要调整的部分：

1. **核心功能页** — 满足「${prompt.slice(0, 40)}${prompt.length > 40 ? '…' : ''}」的主要交互
2. **导航与布局** — 清晰的信息架构与页面结构
3. **用户交互** — 按钮、表单等可点击/可输入组件
4. **视觉风格** — 现代简洁 UI，统一配色
5. **响应式设计** — 适配桌面与移动端`;
}

/**
 * Emma Fallback：生成 PRD 摘要。
 */
export function fallbackEmmaPrd(prompt: string): string {
  const kind = matchFallbackTemplate(prompt);
  const features: Record<FallbackTemplateKind, string[]> = {
    todo: ['添加待办', '标记完成', '删除任务', 'localStorage 持久化'],
    landing: ['Hero 区', '功能特性', '定价方案', 'FAQ', 'CTA 按钮'],
    dashboard: ['4 个 KPI 卡片', 'Chart.js 柱状图', '响应式布局', '数据刷新'],
    generic: ['核心功能页', '用户交互', '响应式设计', '现代 UI'],
  };

  const list = features[kind]
    .map((f, i) => `${i + 1}. ${f}`)
    .join('\n');

  return `# PRD 产品需求文档

## 目标用户
需要快速验证想法的独立开发者与小团队

## 核心功能
${list}

## 页面列表
- 主页（单页应用）

## 用户故事
- 作为用户，我希望打开页面即可使用核心功能，无需额外配置
- 作为用户，我希望界面简洁现代，操作直观

## 原始需求
${prompt}`;
}

/**
 * Bob Fallback：生成架构说明。
 */
export function fallbackBobArchitecture(prompt: string): string {
  const kind = matchFallbackTemplate(prompt);
  return `# 系统架构设计

## 技术选型
- **前端：** 单文件 HTML + 内联 CSS + 原生 JavaScript
- **存储：** ${kind === 'todo' ? 'localStorage' : '内存 / 静态数据'}
- **图表：** ${kind === 'dashboard' ? 'Chart.js (CDN)' : '无'}

## 组件树
\`\`\`
App
├── Header（标题 + 导航）
├── MainContent
│   ├── ${kind === 'todo' ? 'TodoInput + TodoList' : kind === 'dashboard' ? 'KpiGrid + Chart' : 'Hero + Features + Pricing'}
└── Footer（可选）
\`\`\`

## 页面路由
单页应用，无路由拆分

## 数据结构
${kind === 'todo' ? '- TodoItem: { id, text, completed }' : '- 静态展示数据'}`;
}
