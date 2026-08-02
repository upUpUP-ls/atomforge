'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { AgentName } from '@/types';
import type { PipelineEvent, PipelineMode } from '../lib/types';
import { parseApiResponse } from '@/lib/api/client';
import {
  buildInitialAgentStatuses,
  buildInitialMessages,
  buildInitialWorkflowSteps,
  FACE_AGENT,
  type AgentStepStatus,
  type ChatMessage,
  type CodeVersion,
  type InitialArtifacts,
} from '../lib/editor-state';
import type { WorkflowStep } from '../lib/editor-state-types';
import {
  fetchProjectSession,
  persistProjectSession,
} from '@/features/projects/session-client';

interface UseAgentPipelineOptions {
  projectId: string;
  projectPrompt: string;
  initialStatus: string;
  initialArtifacts: InitialArtifacts;
  initialCodeVersions?: CodeVersion[];
  autoStart?: boolean;
}

/**
 * 从 API 拉取 code 产物版本列表。
 */
async function fetchCodeVersions(projectId: string): Promise<CodeVersion[]> {
  const res = await fetch(`/api/projects/${projectId}/artifacts?type=code`);
  if (!res.ok) return [];
  const data = await parseApiResponse<{ artifacts: CodeVersion[] }>(res);
  return data.artifacts.map((a) => ({
    version: a.version,
    content: a.content,
    createdAt: a.createdAt,
  }));
}

/**
 * 判断是否处于「计划已生成、待批准」状态。
 */
function isAwaitingPlanApproval(artifacts: InitialArtifacts): boolean {
  return Boolean(artifacts.plan && !artifacts.prd && !artifacts.code);
}

/**
 * 设置或更新 Alex 面向用户的单条消息（不展示子 Agent 全文）。
 */
function upsertAlexMessage(
  prev: ChatMessage[],
  content: string,
  streaming: boolean,
): ChatMessage[] {
  const idx = prev.findIndex(
    (m) => m.role === 'agent' && m.agent === FACE_AGENT && m.id.startsWith('alex-face'),
  );
  const msg: ChatMessage = {
    id: 'alex-face',
    role: 'agent',
    agent: FACE_AGENT,
    content,
    streaming,
  };
  if (idx >= 0) {
    return [...prev.slice(0, idx), msg, ...prev.slice(idx + 1)];
  }
  return [...prev, msg];
}

/**
 * 管理 Agent 流水线：后台多 Agent，前台仅 Alex + 实施计划。
 */
export function useAgentPipeline({
  projectId,
  projectPrompt,
  initialStatus,
  initialArtifacts,
  initialCodeVersions = [],
  autoStart = false,
}: UseAgentPipelineOptions) {
  const router = useRouter();
  const startedRef = useRef(false);
  const activeAgentRef = useRef<AgentName | null>(null);
  const streamModeRef = useRef<PipelineMode>('plan-only');
  const lastRunRef = useRef<{
    mode: PipelineMode;
    feedback?: string;
    planOverride?: string;
  }>({ mode: 'plan-only' });

  const [status, setStatus] = useState(initialStatus);
  const [running, setRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<
    Record<AgentName, AgentStepStatus>
  >(() => buildInitialAgentStatuses(initialArtifacts));
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(initialArtifacts),
  );
  const [codePreview, setCodePreview] = useState<string | null>(
    initialArtifacts.code ?? null,
  );
  const [codeVersions, setCodeVersions] = useState<CodeVersion[]>(
    initialCodeVersions,
  );
  const [selectedVersion, setSelectedVersion] = useState<number | 'latest'>(
    'latest',
  );
  const [error, setError] = useState('');
  const [awaitingApproval, setAwaitingApproval] = useState(() =>
    isAwaitingPlanApproval(initialArtifacts),
  );
  const [planApproved, setPlanApproved] = useState(() =>
    Boolean(
      initialArtifacts.prd ||
        initialArtifacts.code ||
        (initialArtifacts.plan && !isAwaitingPlanApproval(initialArtifacts)),
    ),
  );
  const [planContent, setPlanContent] = useState(
    () => initialArtifacts.plan ?? '',
  );
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(() =>
    buildInitialWorkflowSteps(initialArtifacts, projectPrompt),
  );

  /**
   * 将当前对话与工作流程写入数据库。
   */
  const syncSession = useCallback(
    async (chat: ChatMessage[], workflow: WorkflowStep[]) => {
      try {
        await persistProjectSession(projectId, { chat, workflow });
      } catch {
        // 持久化失败不阻断主流程
      }
    },
    [projectId],
  );

  /**
   * 流水线结束后拉取最新会话，确保与服务端一致。
   */
  const refreshSession = useCallback(async () => {
    try {
      const session = await fetchProjectSession(projectId);
      if (session.chat.length > 0) {
        setMessages(session.chat);
      }
      if (session.workflow.length > 0) {
        setWorkflowSteps(session.workflow);
      }
    } catch {
      // 忽略拉取失败，保留当前内存态
    }
  }, [projectId]);

  const setAlexStatus = useCallback((content: string, streaming: boolean) => {
    setMessages((prev) => upsertAlexMessage(prev, content, streaming));
  }, []);

  const refreshVersions = useCallback(async () => {
    const versions = await fetchCodeVersions(projectId);
    if (versions.length > 0) {
      setCodeVersions(versions);
      setSelectedVersion('latest');
      setCodePreview(versions[0].content);
    }
  }, [projectId]);

  const connectStream = useCallback(
    (streamUrl: string, completedMode: PipelineMode) => {
      streamModeRef.current = completedMode;
      const es = new EventSource(streamUrl);

      es.onmessage = (event) => {
        if (event.data === '[DONE]') {
          es.close();
          setRunning(false);
          setActiveAgent(null);
          activeAgentRef.current = null;

          void (async () => {
            await refreshSession();

            if (completedMode === 'plan-only') {
              setStatus('awaiting_approval');
              setAwaitingApproval(true);
              toast.success('计划已生成，请批准后继续');
            } else {
              setStatus('done');
              setAwaitingApproval(false);
              await refreshVersions();
              toast.success(
                completedMode === 'alex-only'
                  ? '代码已更新'
                  : '应用生成完成！',
              );
            }

            router.refresh();
          })();
          return;
        }

        const data = JSON.parse(event.data) as PipelineEvent;

        if (data.type === 'agent_start' && data.agent) {
          setActiveAgent(data.agent);
          activeAgentRef.current = data.agent;

          setAgentStatuses((prev) => ({
            ...prev,
            [data.agent!]: 'running',
          }));

          if (completedMode === 'plan-only' && data.agent === 'mike') {
            setAlexStatus('正在分析需求并制定实施计划…', true);
          } else if (completedMode === 'build' && data.agent === 'alex') {
            setAlexStatus('正在生成可运行应用…', true);
          } else if (completedMode === 'alex-only') {
            setAlexStatus('正在根据您的反馈更新应用…', true);
          }
        } else if (data.type === 'agent_delta' && data.agent && data.delta) {
          if (data.agent === 'mike' && streamModeRef.current === 'plan-only') {
            setPlanContent((prev) => prev + data.delta);
          }
        } else if (data.type === 'agent_complete' && data.agent) {
          setAgentStatuses((prev) => ({
            ...prev,
            [data.agent!]: 'done',
          }));

          if (data.artifactType === 'plan' && data.content) {
            setPlanContent(data.content);
          }
          if (data.artifactType === 'code' && data.content) {
            setCodePreview(data.content);
            setSelectedVersion('latest');
          }
        } else if (data.type === 'plan_ready' && data.content) {
          setPlanContent(data.content);
        } else if (data.type === 'workflow_step' && data.step) {
          setWorkflowSteps((prev) => {
            const idx = prev.findIndex((s) => s.id === data.step!.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = data.step!;
              return next;
            }
            return [...prev, data.step!];
          });
        } else if (data.type === 'pipeline_complete') {
          if (data.content) {
            setCodePreview(data.content);
            setSelectedVersion('latest');
          }
          setStatus('done');
          setAwaitingApproval(false);
        } else if (data.type === 'error') {
          const message = data.message || '执行出错';
          setError(message);
          setStatus('error');
          toast.error(message);
          setAlexStatus(message, false);
          const failed = activeAgentRef.current;
          if (failed) {
            setAgentStatuses((prev) => ({
              ...prev,
              [failed]: 'error',
            }));
          }
          es.close();
          setRunning(false);
        }
      };

      es.onerror = () => {
        es.close();
        setRunning(false);
        setStatus('error');
        setError((prev) => {
          const message = prev || '连接中断，请重试';
          if (!prev) toast.error(message);
          return message;
        });
      };
    },
    [refreshVersions, router, refreshSession],
  );

  const startPipeline = useCallback(
    async (
      mode: PipelineMode = 'plan-only',
      feedback?: string,
      planOverride?: string,
    ) => {
      if (running) return;

      lastRunRef.current = { mode, feedback, planOverride };
      setRunning(true);
      setError('');

      if (mode === 'plan-only') {
        setMessages([]);
        setPlanContent('');
        setWorkflowSteps([]);
        setPlanApproved(false);
        setAwaitingApproval(false);
        setCodePreview(null);
        setAgentStatuses({
          mike: 'pending',
          emma: 'pending',
          bob: 'pending',
          alex: 'pending',
        });
        setAlexStatus('正在分析需求并制定实施计划…', true);
      } else if (mode === 'build') {
        setAwaitingApproval(false);
        setPlanApproved(true);
        setWorkflowSteps([]);
        setAgentStatuses((prev) => ({
          ...prev,
          emma: 'pending',
          bob: 'pending',
          alex: 'pending',
        }));
        setAlexStatus('计划已批准，团队正在后台构建您的应用…', true);
      } else if (mode === 'alex-only') {
        setAgentStatuses((prev) => ({ ...prev, alex: 'pending' }));
        setWorkflowSteps([]);
      } else {
        setMessages([]);
        setCodePreview(null);
        setPlanApproved(false);
        setAgentStatuses({
          mike: 'pending',
          emma: 'pending',
          bob: 'pending',
          alex: 'pending',
        });
      }

      setActiveAgent(null);
      activeAgentRef.current = null;
      setStatus('building');

      try {
        const runRes = await fetch(
          `/api/projects/${projectId}/pipeline-runs`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, feedback, planOverride }),
          },
        );

        const runData = await parseApiResponse<{
          links: { events: string };
        }>(runRes);

        connectStream(runData.links.events, mode);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '网络错误，请稍后重试';
        setError(message);
        toast.error(message);
        setRunning(false);
        setStatus('error');
        setActiveAgent(null);
        activeAgentRef.current = null;
        setAlexStatus(message, false);
      }
    },
    [running, projectId, connectStream, setAlexStatus],
  );

  /**
   * 批准计划并继续 Emma → Bob → Alex（后台）。
   */
  const approvePlan = useCallback(
    (approvedPlan: string) => {
      setPlanContent(approvedPlan);
      startPipeline('build', undefined, approvedPlan);
    },
    [startPipeline],
  );

  const retry = useCallback(() => {
    const last = lastRunRef.current;
    startPipeline(last.mode, last.feedback, last.planOverride);
  }, [startPipeline]);

  /**
   * 用户与 Alex 迭代对话。
   */
  const iterate = useCallback(
    (feedback: string) => {
      const trimmed = feedback.trim();
      if (!trimmed || running) return;

      setMessages((prev) => {
        const next = [
          ...prev.filter((m) => m.id !== 'alex-face' || !m.streaming),
          {
            id: `user-${Date.now()}`,
            role: 'user' as const,
            content: trimmed,
          },
        ];
        setWorkflowSteps((steps) => {
          void syncSession(next, steps);
          return steps;
        });
        return next;
      });

      startPipeline('alex-only', trimmed);
    },
    [running, startPipeline, syncSession],
  );

  const selectVersion = useCallback(
    (version: number | 'latest') => {
      setSelectedVersion(version);
      if (version === 'latest') {
        setCodePreview(codeVersions[0]?.content ?? null);
      } else {
        const found = codeVersions.find((v) => v.version === version);
        setCodePreview(found?.content ?? null);
      }
    },
    [codeVersions],
  );

  useEffect(() => {
    const shouldAutoStart =
      autoStart &&
      !startedRef.current &&
      !initialArtifacts.code &&
      !initialArtifacts.plan &&
      initialStatus === 'draft';

    if (shouldAutoStart) {
      startedRef.current = true;
      startPipeline('plan-only');
    }
  }, [
    autoStart,
    initialArtifacts.code,
    initialArtifacts.plan,
    initialStatus,
    startPipeline,
  ]);

  const displayCode =
    selectedVersion === 'latest'
      ? codePreview
      : codeVersions.find((v) => v.version === selectedVersion)?.content ??
        codePreview;

  return {
    status,
    running,
    activeAgent,
    agentStatuses,
    messages,
    codePreview: displayCode,
    codeVersions,
    selectedVersion,
    error,
    awaitingApproval,
    planApproved,
    planContent,
    workflowSteps,
    startPipeline,
    approvePlan,
    retry,
    iterate,
    selectVersion,
  };
}
