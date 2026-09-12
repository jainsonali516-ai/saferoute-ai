import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

/**
 * Generates a fresh per-request CSP nonce so `script-src` can stay strict
 * (no 'unsafe-inline') while still allowing the small inline hydration
 * script Next.js injects itself. The nonce is exposed to the app via the
 * `x-nonce` request header; src/app/layout.tsx reads it with next/headers
 * and Next automatically applies it to its own injected scripts.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src https://www.openstreetmap.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the nonce back out of this *request* header to know what
  // to stamp on the inline hydration script it injects during SSR.
  if (isProd) requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (isProd) response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and Next's internal files — no need to add nonce overhead there.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
