import type { NextConfig } from "next";

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
        ],
      },
    ];
  },
};

export default nextConfig;
