import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { jsonCreated, jsonError } from '@/lib/api/response';

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

/**
 * 校验注册请求体格式与长度。
 */
function validateRegisterBody(body: RegisterBody): string | null {
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return '邮箱和密码不能为空';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '邮箱格式不正确';
  }

  if (password.length < 6) {
    return '密码至少 6 位';
  }

  return null;
}

/**
 * POST /api/users — 创建用户（注册）。
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const validationError = validateRegisterBody(body);

    if (validationError) {
      return jsonError(validationError, 400);
    }

    const email = body.email!.trim().toLowerCase();
    const password = body.password!;
    const name = body.name?.trim() || null;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError('该邮箱已注册', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return jsonCreated(
      {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
        },
      },
      `/api/users/${user.id}`,
    );
  } catch (error) {
    console.error('Register error:', error);
    return jsonError('注册失败，请稍后重试', 500);
  }
}

/**
 * GET /api/users — 不支持列表（需管理员权限）。
 */
export async function GET(): Promise<NextResponse> {
  return jsonError('Method Not Allowed', 405);
}
