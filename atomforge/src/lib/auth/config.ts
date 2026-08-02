import type { NextAuthConfig } from 'next-auth';

/**
 * Edge 兼容的 NextAuth 配置（middleware 使用，不引入 Prisma）。
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isProtected =
        pathname.startsWith('/dashboard') || pathname.startsWith('/project');
      const isAuthPage = pathname === '/login' || pathname === '/register';

      if (isProtected && !isLoggedIn) {
        return false;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
};
