import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "sra_demo_uid";

/**
 * DEMO AUTH ONLY.
 *
 * There is no real authentication system in this hackathon build. Each browser
 * gets a random anonymous demo user id stored in an httpOnly cookie so that
 * trusted-contact data is at least scoped per-visitor instead of being global.
 *
 * REAL INTEGRATION: replace this with your real session/auth lookup (e.g. NextAuth,
 * Clerk, or a custom JWT/session store) and return the authenticated user's id.
 * Every /api/me/* route must keep resolving the user id server-side like this —
 * never trust a userId passed from the client.
 */
export async function getCurrentUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = `demo-${randomUUID()}`;
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}
