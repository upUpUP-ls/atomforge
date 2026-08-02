'use client';

import { useState } from 'react';
import {
  ChevronDown,
  FileText,
  FilePen,
  Terminal,
  Loader2,
} from 'lucide-react';
import type { WorkflowStep } from '../lib/editor-state-types';

interface WorkflowPanelProps {
  steps: WorkflowStep[];
  running: boolean;
  defaultOpen?: boolean;
  title?: string;
}

/**
 * 根据步骤类型返回图标。
 */
function StepIcon({ kind }: { kind: WorkflowStep['kind'] }) {
  switch (kind) {
    case 'read_file':
      return <FileText className="size-3.5 shrink-0 text-muted-foreground" />;
    case 'write_file':
      return <FilePen className="size-3.5 shrink-0 text-muted-foreground" />;
    case 'run_command':
      return <Terminal className="size-3.5 shrink-0 text-muted-foreground" />;
    default:
      return (
        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
      );
  }
}

/**
 * 可折叠工作流程：「已处理 N 步」+ 细粒度步骤（读文件/写文件/终端等）。
 */
export function WorkflowPanel({
  steps,
  running,
  defaultOpen = true,
  title,
}: WorkflowPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (steps.length === 0) return null;

  const doneCount = steps.filter((s) => s.status === 'done').length;
  const header =
    title ??
    (running
      ? `已处理 ${doneCount} 步`
      : `工作流程 · 共 ${doneCount} 步`);

  return (
    <div className="ml-9 space-y-2">
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        {header}
        {running && (
          <Loader2 className="size-3 animate-spin text-primary" />
        )}
      </button>

      {open && (
        <ul className="space-y-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
          {steps.map((step) => {
            const isRunning = step.status === 'running';

            if (step.kind === 'read_file' || step.kind === 'write_file') {
              return (
                <li key={step.id}>
                  <div
                    className={`flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs ${
                      isRunning ? 'border-primary/40' : ''
                    }`}
                  >
                    <StepIcon kind={step.kind} />
                    <span className="text-muted-foreground">{step.label}</span>
                    {step.detail && (
                      <code className="font-mono text-foreground">{step.detail}</code>
                    )}
                    {isRunning && (
                      <Loader2 className="ml-auto size-3 animate-spin text-primary" />
                    )}
                  </div>
                </li>
              );
            }

            if (step.kind === 'run_command') {
              return (
                <li key={step.id}>
                  <div
                    className={`rounded-md border bg-background px-2.5 py-1.5 text-xs ${
                      isRunning ? 'border-primary/40' : ''
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                      <StepIcon kind={step.kind} />
                      {step.label}
                      {isRunning && (
                        <Loader2 className="ml-auto size-3 animate-spin text-primary" />
                      )}
                    </div>
                    {step.detail && (
                      <code className="block font-mono text-[11px] text-foreground/80">
                        $ {step.detail}
                      </code>
                    )}
                  </div>
                </li>
              );
            }

            return (
              <li
                key={step.id}
                className={`flex items-start gap-2 text-muted-foreground ${
                  isRunning ? 'text-foreground' : ''
                }`}
              >
                {isRunning ? (
                  <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-primary" />
                ) : (
                  <StepIcon kind={step.kind} />
                )}
                <span className="leading-relaxed">{step.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
