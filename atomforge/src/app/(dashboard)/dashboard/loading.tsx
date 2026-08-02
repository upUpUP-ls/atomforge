import { Skeleton } from '@/components/ui/skeleton';

/**
 * 工作台 Loading 骨架屏。
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center px-6 pt-16">
      <Skeleton className="mb-6 h-11 w-48 rounded-full" />
      <Skeleton className="mb-8 h-9 w-80" />
      <Skeleton className="h-40 w-full max-w-2xl rounded-2xl" />
      <div className="mt-10 w-full max-w-6xl border-t pt-8">
        <Skeleton className="mb-4 h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
