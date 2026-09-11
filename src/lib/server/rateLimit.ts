/**
 * Minimal in-memory fixed-window rate limiter for demo/hackathon purposes.
 * Good enough to blunt accidental client-side retry loops or basic abuse on
 * a single server instance. REAL INTEGRATION: replace with a shared store
 * (e.g. Redis/Upstash) if the app ever runs on more than one instance.
 */
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function clientKeyFrom(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "local";
}
