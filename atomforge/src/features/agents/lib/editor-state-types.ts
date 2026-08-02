/** 工作流程步骤类型（对齐 Atoms 细粒度展示） */
export type WorkflowStepKind =
  | 'status'
  | 'note'
  | 'read_file'
  | 'write_file'
  | 'run_command';

export type WorkflowStepStatus = 'running' | 'done';

export interface WorkflowStep {
  id: string;
  kind: WorkflowStepKind;
  label: string;
  detail?: string;
  status: WorkflowStepStatus;
}
