'use server';

import { signOut } from '@/lib/auth';

/**
 * 退出登录并跳转首页。
 */
export async function logoutAction() {
  await signOut({ redirectTo: '/' });
}
