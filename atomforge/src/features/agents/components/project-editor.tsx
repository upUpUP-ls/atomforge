'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, MessageSquare, Eye, RotateCcw } from 'lucide-react';
import { useAgentPipeline } from '../hooks/use-agent-pipeline';
import type { CodeVersion, InitialArtifacts } from '../lib/editor-state';
import { AgentChat } from './agent-chat';
import { PreviewPanel } from './preview-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiModeBadge } from '@/components/ai-mode-badge';
import { PROJECT_STATUS_LABELS } from '@/features/projects/templates';

interface ProjectEditorProps {
  projectId: string;
  projectTitle: string;
  projectPrompt: string;
  initialStatus: string;
  initialArtifacts: InitialArtifacts;
  initialCodeVersions?: CodeVersion[];
  autoStart?: boolean;
}

/**
 * 全屏两栏编辑器：左 Agent 流程 / 右 Preview（无 App 侧栏）。
 */
export function ProjectEditor({
  projectId,
  projectTitle,
  projectPrompt,
  initialStatus,
  initialArtifacts,
  initialCodeVersions = [],
  autoStart = false,
}: ProjectEditorProps) {
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');

  const {
    status,
    running,
    activeAgent,
    agentStatuses,
    messages,
    codePreview,
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
  } = useAgentPipeline({
    projectId,
    projectPrompt,
    initialStatus,
    initialArtifacts,
    initialCodeVersions,
    autoStart,
  });

  const hasCode = Boolean(codePreview || initialArtifacts.code);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="shrink-0"
          >
            ← 工作台
          </Button>
          <h1 className="truncate text-sm font-semibold">{projectTitle}</h1>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {PROJECT_STATUS_LABELS[status] ?? status}
          </Badge>
          <AiModeBadge />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!running && !awaitingApproval && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startPipeline('plan-only')}
            >
              <RefreshCw className="size-3.5" />
              <span className="hidden sm:inline">重新生成</span>
            </Button>
          )}
          {running && (
            <span className="text-xs text-muted-foreground animate-pulse">
              构建中…
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="flex shrink-0 items-center justify-between gap-3 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span className="min-w-0 flex-1">{error}</span>
          {!running && (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={retry}
            >
              <RotateCcw className="size-3.5" />
              重试
            </Button>
          )}
        </div>
      )}

      <div className="flex shrink-0 border-b md:hidden">
        <button
          type="button"
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm ${
            mobileTab === 'chat'
              ? 'border-b-2 border-primary font-medium'
              : 'text-muted-foreground'
          }`}
          onClick={() => setMobileTab('chat')}
        >
          <MessageSquare className="size-4" />
          对话
        </button>
        <button
          type="button"
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm ${
            mobileTab === 'preview'
              ? 'border-b-2 border-primary font-medium'
              : 'text-muted-foreground'
          }`}
          onClick={() => setMobileTab('preview')}
        >
          <Eye className="size-4" />
          预览
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          className={`min-h-0 w-full flex-col border-r md:flex md:w-1/2 ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <AgentChat
            messages={messages}
            activeAgent={activeAgent}
            running={running}
            projectPrompt={projectPrompt}
            hasCode={hasCode}
            awaitingApproval={awaitingApproval}
            planContent={planContent}
            workflowSteps={workflowSteps}
            agentStatuses={agentStatuses}
            onIterate={iterate}
            onApprovePlan={approvePlan}
          />
        </section>

        <section
          className={`min-h-0 w-full flex-col md:flex md:w-1/2 ${
            mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <PreviewPanel
            projectId={projectId}
            projectPrompt={projectPrompt}
            html={codePreview}
            running={running}
            projectTitle={projectTitle}
            codeVersions={codeVersions}
            selectedVersion={selectedVersion}
            onSelectVersion={selectVersion}
          />
        </section>
      </div>
    </div>
  );
}
