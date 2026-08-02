import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getUserProject } from '@/features/projects/service';
import { ProjectEditor } from '@/features/agents/components/project-editor';
import type { CodeVersion, InitialArtifacts } from '@/features/agents/lib/editor-state';
import type { ArtifactType } from '@/types';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 从 artifacts 列表提取各类型最新产物。
 */
function extractArtifacts(
  artifacts: { type: string; content: string; version: number }[],
): InitialArtifacts {
  const result: InitialArtifacts = {};
  const types: ArtifactType[] = [
    'plan',
    'prd',
    'architecture',
    'code',
    'workflow',
    'chat',
  ];

  for (const type of types) {
    const latest = artifacts
      .filter((a) => a.type === type)
      .sort((a, b) => b.version - a.version)[0];
    if (latest) {
      result[type] = latest.content;
    }
  }

  return result;
}

/**
 * 提取 code 产物全部版本（降序）。
 */
function extractCodeVersions(
  artifacts: { type: string; content: string; version: number; createdAt: Date }[],
): CodeVersion[] {
  return artifacts
    .filter((a) => a.type === 'code')
    .sort((a, b) => b.version - a.version)
    .map((a) => ({
      version: a.version,
      content: a.content,
      createdAt: a.createdAt.toISOString(),
    }));
}

/**
 * 项目编辑器页：全屏两栏（对话 + Preview）。
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;
  const project = await getUserProject(id, session.user.id);

  if (!project) {
    notFound();
  }

  const initialArtifacts = extractArtifacts(project.artifacts);
  const codeVersions = extractCodeVersions(project.artifacts);

  return (
    <ProjectEditor
      projectId={project.id}
      projectTitle={project.title}
      projectPrompt={project.prompt}
      initialStatus={project.status}
      initialArtifacts={initialArtifacts}
      initialCodeVersions={codeVersions}
      autoStart={
        project.status === 'draft' &&
        !initialArtifacts.code &&
        !initialArtifacts.plan
      }
    />
  );
}
