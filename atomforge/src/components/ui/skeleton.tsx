import { cn } from '@/lib/utils';

/**
 * 骨架屏占位块，用于 Loading 状态。
 */
export function Skeleton({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
