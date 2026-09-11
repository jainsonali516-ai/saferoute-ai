import { NextResponse } from "next/server";
import { ApiResult } from "@/lib/types";

export function apiOk<T>(data: T, init?: number): NextResponse<ApiResult<T>> {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

/**
 * Always return a short, sanitized message — never leak stack traces,
 * internal file paths, or raw error objects to the client.
 */
export function apiFail(message: string, status = 400): NextResponse<ApiResult<never>> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiFromCaught(err: unknown, fallback = "Something went wrong. Please try again."): NextResponse<ApiResult<never>> {
  const message = err instanceof Error && err.message.length < 200 ? err.message : fallback;
  return apiFail(message, 500);
}
