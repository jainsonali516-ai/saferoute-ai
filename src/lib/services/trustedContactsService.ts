import { TrustedContact, TrustedContactInput } from "@/lib/types";

/**
 * Client-side service layer for trusted contacts. Talks only to our own
 * same-origin /api/me/trusted-contacts endpoints (auth resolved server-side
 * from the session cookie) — never call a third-party API directly from here
 * with credentials, and never store contacts in client source code.
 */

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Something went wrong. Please try again.");
  }
  return body as T;
}

export const trustedContactsService = {
  async list(): Promise<TrustedContact[]> {
    const res = await fetch("/api/me/trusted-contacts", { cache: "no-store" });
    const body = await handle<{ contacts: TrustedContact[] }>(res);
    return body.contacts;
  },

  async create(input: TrustedContactInput): Promise<TrustedContact> {
    const res = await fetch("/api/me/trusted-contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await handle<{ contact: TrustedContact }>(res);
    return body.contact;
  },

  async update(id: string, input: TrustedContactInput): Promise<TrustedContact> {
    const res = await fetch(`/api/me/trusted-contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await handle<{ contact: TrustedContact }>(res);
    return body.contact;
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/me/trusted-contacts/${id}`, { method: "DELETE" });
    await handle<{ ok: boolean }>(res);
  },
};
