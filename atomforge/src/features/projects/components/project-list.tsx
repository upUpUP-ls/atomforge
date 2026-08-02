import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PROJECT_STATUS_LABELS, type ProjectSummary } from '@/features/projects/templates';

/**
 * 格式化相对时间（简易版）。
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * 项目卡片列表：展示用户历史项目。
 */
export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">还没有项目</p>
          <p className="mt-1 text-sm text-muted-foreground">
            在上方输入框描述想法，或切换到「模板」Tab 快速开始
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-1 text-base">
                  {project.title}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {project.prompt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                更新于 {formatDate(project.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
