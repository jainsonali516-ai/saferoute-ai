import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy is set per-request in src/middleware.ts instead
// (it needs a fresh nonce on every request), not here as a static header.
const productionOnlyHeaders = isProd
  ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
  : [];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Basic secure-headers baseline. Same-origin API routes need no CORS
        // headers here — the browser already allows same-origin fetches.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
          ...productionOnlyHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
