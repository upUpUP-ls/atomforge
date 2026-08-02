import { NextResponse } from 'next/server';

/**
 * 统一成功响应：{ data: T }。
 */
export function jsonData<T>(
  data: T,
  status = 200,
  headers?: HeadersInit,
): NextResponse {
  return NextResponse.json({ data }, { status, headers });
}

/**
 * 统一错误响应：{ error: { message } }。
 */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: { message } }, { status });
}

/**
 * 201 Created，附带 Location 头。
 */
export function jsonCreated<T>(data: T, location: string): NextResponse {
  return NextResponse.json(
    { data },
    { status: 201, headers: { Location: location } },
  );
}

/**
 * SSE 错误响应（非 JSON 流时使用）。
 */
export function sseError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
