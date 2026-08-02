import type { AgentName } from '@/types';
import type { WorkflowStepKind } from './editor-state-types';
import { matchFallbackTemplate } from './fallback';

export interface MockStepDef {
  kind: WorkflowStepKind;
  label: string;
  detail?: string;
}

/**
 * 计划阶段（Mike）的模拟工作流步骤。
 */
export function getPlanPhaseSteps(prompt: string): MockStepDef[] {
  return [
    { kind: 'status', label: '正在启动' },
    {
      kind: 'note',
      label: '需求已明确，我将先制定开发计划，确认方向后再开始构建。',
    },
    { kind: 'status', label: '分析用户需求' },
    { kind: 'status', label: '制定页面与功能清单' },
  ];
}

/**
 * 构建阶段各 Agent 的模拟工作流步骤。
 */
export function getAgentBuildSteps(
  agent: AgentName,
  prompt: string,
): MockStepDef[] {
  const kind = matchFallbackTemplate(prompt);

  switch (agent) {
    case 'emma':
      return [
        { kind: 'status', label: '计划已批准，正在初始化前端模板' },
        { kind: 'read_file', label: '读取文件', detail: 'README.md' },
        { kind: 'read_file', label: '读取文件', detail: 'package.json' },
        { kind: 'note', label: '正在撰写产品需求文档' },
        { kind: 'write_file', label: '更新文件', detail: 'docs/PRD.md' },
      ];
    case 'bob':
      return [
        { kind: 'read_file', label: '读取文件', detail: 'App.tsx' },
        { kind: 'note', label: '正在设计系统架构与组件树' },
        { kind: 'write_file', label: '更新文件', detail: 'docs/architecture.md' },
        {
          kind: 'note',
          label:
            kind === 'landing'
              ? '采用现代销售页布局：Hero + 产品网格 + 联系表单'
              : '采用单页应用结构：Header + Main + Footer',
        },
      ];
    case 'alex':
      return [
        { kind: 'note', label: '正在生成可运行的 HTML 应用' },
        { kind: 'write_file', label: '更新文件', detail: 'index.html' },
        { kind: 'write_file', label: '更新文件', detail: 'styles.css' },
        { kind: 'run_command', label: '在终端中运行命令', detail: 'npm run build' },
        { kind: 'status', label: '构建检查通过' },
      ];
    default:
      return [];
  }
}

/**
 * Alex 迭代模式的模拟步骤。
 */
export function getIterationSteps(feedback: string): MockStepDef[] {
  return [
    { kind: 'note', label: `收到修改要求：${feedback.slice(0, 80)}` },
    { kind: 'read_file', label: '读取文件', detail: 'index.html' },
    { kind: 'write_file', label: '更新文件', detail: 'index.html' },
    { kind: 'run_command', label: '在终端中运行命令', detail: 'npm run build' },
    { kind: 'status', label: '更新完成' },
  ];
}

/**
 * 为已完成但未持久化 workflow 的旧项目重建 Fallback 步骤。
 */
export function reconstructFallbackWorkflow(prompt: string): MockStepDef[] {
  return [
    ...getPlanPhaseSteps(prompt),
    ...getAgentBuildSteps('emma', prompt),
    ...getAgentBuildSteps('bob', prompt),
    ...getAgentBuildSteps('alex', prompt),
  ];
}
