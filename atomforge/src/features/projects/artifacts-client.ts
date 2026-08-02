import { parseApiResponse } from '@/lib/api/client';
import type { InitialArtifacts } from '@/features/agents/lib/editor-state';
import type { ArtifactType } from '@/types';

interface ArtifactRow {
  type: string;
  content: string;
  version: number;
}

/**
 * 拉取项目各类型最新产物，用于代码仓库导出。
 */
export async function fetchLatestArtifacts(
  projectId: string,
): Promise<InitialArtifacts> {
  const res = await fetch(`/api/projects/${projectId}/artifacts?type=all`);
  const data = await parseApiResponse<{ artifacts: ArtifactRow[] }>(res);

  const result: InitialArtifacts = {};
  const allowed: ArtifactType[] = ['plan', 'prd', 'architecture', 'code'];

  for (const row of data.artifacts) {
    if (allowed.includes(row.type as ArtifactType)) {
      result[row.type as ArtifactType] = row.content;
    }
  }

  return result;
}
