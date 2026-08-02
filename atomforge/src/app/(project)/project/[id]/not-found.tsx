import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * 项目不存在时的 404 页。
 */
export default function ProjectNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <h1 className="mb-2 text-2xl font-bold">项目不存在</h1>
      <p className="mb-6 text-muted-foreground">
        该项目可能已被删除，或您没有访问权限
      </p>
      <Button render={<Link href="/dashboard" />} nativeButton={false}>
        返回工作台
      </Button>
    </div>
  );
}
