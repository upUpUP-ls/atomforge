'use client';

import { logoutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

/**
 * 退出登录按钮。
 */
export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logoutAction()}
    >
      退出登录
    </Button>
  );
}
