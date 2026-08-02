import { db } from '@/lib/db';
import { hasLlmKey } from '@/lib/ai/llm';
import { streamMike } from './mike';
import { streamEmma } from './emma';
import { streamBob } from './bob';
import { streamAlex, streamAlexIteration } from './alex';
import { extractHtmlFromResponse } from './fallback-html';
import {
  getAgentBuildSteps,
  getIterationSteps,
  getPlanPhaseSteps,
  type MockStepDef,
} from './mock-workflow';
import type { WorkflowStep } from './editor-state-types';
import {
  appendWorkflowSteps,
  saveAlexStatusMessage,
  saveWorkflowSteps,
} from '@/features/projects/session-store';
import {
  getPipelineSteps,
  type AgentContext,
  type PipelineEvent,
  type PipelineMode,
} from './types';
import type { AgentName, ArtifactType } from '@/types';

/** 防止同一项目并发执行流水线 */
const runningProjects = new Set<string>();

const MOCK_STEP_DELAY_MS = 420;

/**
 * 短暂延迟，用于模拟逐步执行。
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成唯一步骤 ID。
 */
function newStepId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 依次 yield 模拟工作流步骤（Fallback 模式），并写入 collector。
 */
async function* emitMockWorkflowSteps(
  defs: MockStepDef[],
  collector: WorkflowStep[],
): AsyncGenerator<PipelineEvent> {
  for (const def of defs) {
    const id = newStepId();
    const running: WorkflowStep = {
      id,
      kind: def.kind,
      label: def.label,
      detail: def.detail,
      status: 'running',
    };
    yield { type: 'workflow_step', step: running };
    await sleep(MOCK_STEP_DELAY_MS);
    const doneStep: WorkflowStep = { ...running, status: 'done' };
    collector.push(doneStep);
    yield {
      type: 'workflow_step',
      step: doneStep,
    };
  }
}

type AgentStreamer = (ctx: AgentContext) => AsyncGenerator<string>;

const AGENT_STREAMERS: Record<AgentName, AgentStreamer> = {
  mike: streamMike,
  emma: streamEmma,
  bob: streamBob,
  alex: streamAlex,
};

/**
 * 保存 Agent 产物到数据库，版本号递增。
 */
async function saveArtifact(
  projectId: string,
  type: ArtifactType,
  content: string,
): Promise<void> {
  const latest = await db.artifact.findFirst({
    where: { projectId, type },
    orderBy: { version: 'desc' },
  });

  await db.artifact.create({
    data: {
      projectId,
      type,
      content,
      version: (latest?.version ?? 0) + 1,
    },
  });
}

/**
 * 创建 AgentRun 记录。
 */
async function startAgentRun(
  projectId: string,
  agentName: AgentName,
  input: string,
): Promise<string> {
  const run = await db.agentRun.create({
    data: { projectId, agentName, input, status: 'running' },
  });
  return run.id;
}

/**
 * 更新 AgentRun 完成状态。
 */
async function completeAgentRun(
  runId: string,
  output: string,
  status: 'done' | 'error' = 'done',
): Promise<void> {
  await db.agentRun.update({
    where: { id: runId },
    data: { output, status },
  });
}

/**
 * 加载项目已有 artifacts 到上下文。
 */
async function loadExistingArtifacts(
  projectId: string,
): Promise<Partial<Record<ArtifactType, string>>> {
  const artifacts: Partial<Record<ArtifactType, string>> = {};
  const rows = await db.artifact.findMany({
    where: { projectId },
    orderBy: { version: 'desc' },
  });

  for (const row of rows) {
    const type = row.type as ArtifactType;
    if (!artifacts[type]) {
      artifacts[type] = row.content;
    }
  }

  return artifacts;
}

/**
 * 后处理 Agent 输出（Alex 需提取 HTML）。
 */
function postProcessContent(agent: AgentName, raw: string): string {
  if (agent === 'alex' && hasLlmKey()) {
    return extractHtmlFromResponse(raw);
  }
  return raw;
}

/**
 * 运行 SOP 流水线，yield SSE 事件并持久化结果。
 */
export async function* runPipeline(
  projectId: string,
  userPrompt: string,
  mode: PipelineMode = 'full',
  feedback?: string,
  planOverride?: string,
): AsyncGenerator<PipelineEvent> {
  if (runningProjects.has(projectId)) {
    yield { type: 'error', message: '流水线正在执行中' };
    return;
  }

  runningProjects.add(projectId);

  try {
    await db.project.update({
      where: { id: projectId },
      data: { status: 'building' },
    });

    const needsExisting = mode === 'alex-only' || mode === 'build';

    const ctx: AgentContext = {
      projectId,
      userPrompt,
      artifacts: needsExisting ? await loadExistingArtifacts(projectId) : {},
    };

    if (planOverride?.trim()) {
      ctx.artifacts.plan = planOverride.trim();
      await saveArtifact(projectId, 'plan', planOverride.trim());
    }

    const steps = getPipelineSteps(mode);
    const runWorkflowSteps: WorkflowStep[] = [];

    if (mode === 'plan-only') {
      await saveWorkflowSteps(projectId, []);
    }

    if (!hasLlmKey() && mode === 'plan-only') {
      yield* emitMockWorkflowSteps(getPlanPhaseSteps(userPrompt), runWorkflowSteps);
    }

    for (const step of steps) {
      if (!hasLlmKey()) {
        if (mode === 'build') {
          yield* emitMockWorkflowSteps(
            getAgentBuildSteps(step.agent, userPrompt),
            runWorkflowSteps,
          );
        } else if (mode === 'alex-only' && feedback) {
          yield* emitMockWorkflowSteps(getIterationSteps(feedback), runWorkflowSteps);
        }
      }

      const runId = await startAgentRun(projectId, step.agent, userPrompt);

      yield {
        type: 'agent_start',
        agent: step.agent,
        artifactType: step.artifactType,
      };

      let rawContent = '';

      try {
        const streamer =
          mode === 'alex-only' && step.agent === 'alex' && feedback
            ? (c: AgentContext) => streamAlexIteration(c, feedback)
            : AGENT_STREAMERS[step.agent];

        for await (const delta of streamer(ctx)) {
          rawContent += delta;
          yield { type: 'agent_delta', agent: step.agent, delta };
        }

        const content = postProcessContent(step.agent, rawContent);
        ctx.artifacts[step.artifactType] = content;

        await saveArtifact(projectId, step.artifactType, content);
        await completeAgentRun(runId, content, 'done');

        yield {
          type: 'agent_complete',
          agent: step.agent,
          artifactType: step.artifactType,
          content,
        };

        if (mode === 'plan-only' && step.agent === 'mike') {
          await db.project.update({
            where: { id: projectId },
            data: { status: 'awaiting_approval' },
          });
          await appendWorkflowSteps(projectId, runWorkflowSteps);
          await saveAlexStatusMessage(
            projectId,
            '实施计划已就绪，请查阅下方步骤并批准。',
          );
          yield { type: 'plan_ready', content };
          return;
        }
      } catch (error) {
        await completeAgentRun(runId, rawContent, 'error');
        await db.project.update({
          where: { id: projectId },
          data: { status: 'error' },
        });
        yield {
          type: 'error',
          message: error instanceof Error ? error.message : 'Agent 执行失败',
        };
        return;
      }
    }

    await db.project.update({
      where: { id: projectId },
      data: { status: 'done' },
    });

    if (runWorkflowSteps.length > 0) {
      await appendWorkflowSteps(projectId, runWorkflowSteps);
    }

    if (mode === 'alex-only') {
      await saveAlexStatusMessage(
        projectId,
        '✓ 应用已更新，请在右侧 Preview 查看与交互。',
      );
    } else {
      await saveAlexStatusMessage(
        projectId,
        '✓ 应用已生成，请在右侧 Preview 查看与交互。',
      );
    }

    yield {
      type: 'pipeline_complete',
      content: ctx.artifacts.code,
    };
  } finally {
    runningProjects.delete(projectId);
  }
}

/**
 * 收集流水线全部事件（测试用）。
 */
export async function collectPipelineEvents(
  projectId: string,
  userPrompt: string,
): Promise<PipelineEvent[]> {
  const events: PipelineEvent[] = [];
  for await (const event of runPipeline(projectId, userPrompt, 'full')) {
    events.push(event);
  }
  return events;
}
