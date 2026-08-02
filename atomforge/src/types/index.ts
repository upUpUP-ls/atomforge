export type AgentName = 'mike' | 'emma' | 'bob' | 'alex';

export type ProjectStatus = 'draft' | 'building' | 'done' | 'error';

export type ArtifactType =
  | 'plan'
  | 'prd'
  | 'architecture'
  | 'code'
  | 'workflow'
  | 'chat';

export type AgentRunStatus = 'pending' | 'running' | 'done' | 'error';

export interface AgentInfo {
  id: AgentName;
  name: string;
  role: string;
  color: string;
}

export const AGENTS: AgentInfo[] = [
  { id: 'mike', name: 'Mike', role: 'Team Leader', color: '#6366f1' },
  { id: 'emma', name: 'Emma', role: 'Product Manager', color: '#ec4899' },
  { id: 'bob', name: 'Bob', role: 'Architect', color: '#8b5cf6' },
  { id: 'alex', name: 'Alex', role: 'Engineer', color: '#06b6d4' },
];
