import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';

/**
 * Edge middleware：路由守卫，未登录无法访问 /dashboard。
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/dashboard/:path*', '/project/:path*', '/login', '/register'],
};
