'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AGENTS, type AgentName } from '@/types';
import type { AgentStepStatus, ChatMessage } from '../lib/editor-state';
import type { WorkflowStep } from '../lib/editor-state-types';
import { ImplementationPlanCard } from './implementation-plan-card';
import { PipelineProgressBar } from './pipeline-progress-bar';
import { WorkflowPanel } from './workflow-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AgentChatProps {
  messages: ChatMessage[];
  activeAgent: AgentName | null;
  running: boolean;
  projectPrompt: string;
  hasCode: boolean;
  awaitingApproval: boolean;
  planContent: string;
  workflowSteps: WorkflowStep[];
  agentStatuses: Record<AgentName, AgentStepStatus>;
  onIterate?: (feedback: string) => void;
  onApprovePlan?: (plan: string) => void;
}

const ALEX_META = AGENTS.find((a) => a.id === 'alex')!;

/**
 * 左侧对话区：Alex 交互 + 实施计划卡片 + 细粒度工作流程。
 */
export function AgentChat({
  messages,
  activeAgent,
  running,
  projectPrompt,
  hasCode,
  awaitingApproval,
  planContent,
  workflowSteps,
  agentStatuses,
  onIterate,
  onApprovePlan,
}: AgentChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState('');

  const alexStatus = messages.find(
    (m) => m.role === 'agent' && m.agent === 'alex',
  );
  const userMessages = messages.filter((m) => m.role === 'user');

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, awaitingApproval, running, workflowSteps, planContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || running || !onIterate) return;
    onIterate(feedback.trim());
    setFeedback('');
  };

  const showProgress =
    running || messages.length > 0 || awaitingApproval || hasCode || planContent;

  const showAlexBlock =
    running ||
    alexStatus ||
    planContent ||
    workflowSteps.length > 0 ||
    hasCode;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-5 flex justify-end">
          <div className="max-w-[90%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
            {projectPrompt}
          </div>
        </div>

        <div className="space-y-5">
          {showAlexBlock && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: ALEX_META.color }}
                >
                  {ALEX_META.name[0]}
                </div>
                <span className="text-sm font-medium">{ALEX_META.name}</span>
                <span className="text-xs text-muted-foreground">
                  | {ALEX_META.role}
                </span>
                {running && !alexStatus?.content && (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                )}
              </div>

              {alexStatus?.content && (
                <p className="ml-9 text-sm leading-relaxed text-foreground/90">
                  {alexStatus.content}
                  {alexStatus.streaming && (
                    <Loader2 className="ml-2 inline size-3 animate-spin text-muted-foreground" />
                  )}
                </p>
              )}

              {workflowSteps.length > 0 && (
                <WorkflowPanel steps={workflowSteps} running={running} />
              )}

              {planContent && (
                <ImplementationPlanCard
                  planContent={planContent}
                  showApprove={awaitingApproval && Boolean(onApprovePlan)}
                  onApprove={onApprovePlan}
                />
              )}

              {!planContent && running && !alexStatus && (
                <p className="ml-9 text-sm text-muted-foreground animate-pulse">
                  Alex 正在处理…
                </p>
              )}
            </div>
          )}

          {userMessages.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProgress && (
        <PipelineProgressBar
          agentStatuses={agentStatuses}
          activeAgent={activeAgent}
          running={running}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t bg-background p-3"
      >
        <div className="flex gap-2">
          <Input
            placeholder={
              awaitingApproval
                ? '批准计划，或点击上方「批准计划」按钮…'
                : hasCode
                  ? '请 Alex 继续优化，如：改成深色主题…'
                  : '生成完成后可在此与 Alex 对话'
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={!hasCode || running || awaitingApproval}
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              !hasCode || running || awaitingApproval || !feedback.trim()
            }
            title="发送给 Alex"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
