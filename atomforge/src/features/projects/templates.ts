export type ProjectType = 'saas' | 'landing' | 'internal' | 'custom';

export type TemplateId = 'todo' | 'landing' | 'dashboard';

export interface ProjectTemplate {
  id: TemplateId;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  gradient: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'todo',
    title: 'Todo App',
    description: '待办事项应用，支持增删改，localStorage 持久化',
    prompt:
      '一个简单的 Todo 待办事项应用，支持添加、完成、删除任务，数据保存在 localStorage',
    icon: '✅',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'landing',
    title: 'Product Landing Page',
    description: 'SaaS 产品落地页，含 Hero、定价、FAQ',
    prompt:
      '一个 SaaS 产品落地页，包含 Hero、功能特性、定价、FAQ、CTA 按钮',
    icon: '🚀',
    gradient: 'from-indigo-500/20 to-violet-500/20',
  },
  {
    id: 'dashboard',
    title: 'Data Dashboard',
    description: '数据仪表盘，KPI 卡片 + Chart.js 柱状图',
    prompt:
      '一个简单的数据仪表盘，展示 4 个 KPI 卡片和一张柱状图，使用 Chart.js',
    icon: '📊',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
];

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'saas', label: 'SaaS 应用' },
  { value: 'landing', label: '落地页' },
  { value: 'internal', label: '内部工具' },
  { value: 'custom', label: '自定义' },
];

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  awaiting_approval: '待批准',
  building: '构建中',
  done: '已完成',
  error: '出错',
};

export interface ProjectSummary {
  id: string;
  title: string;
  prompt: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
