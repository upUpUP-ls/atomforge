import { Skeleton } from '@/components/ui/skeleton';

/**
 * 项目编辑器 Loading 骨架屏（两栏）。
 */
export default function ProjectLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-1/2 border-r p-4">
          <Skeleton className="mb-4 h-12 w-3/4 ml-auto rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="w-1/2 p-4">
          <Skeleton className="h-full min-h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
