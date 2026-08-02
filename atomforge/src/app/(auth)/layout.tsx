import Link from 'next/link';

/**
 * 登录/注册页布局：居中表单。
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          AtomForge
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
