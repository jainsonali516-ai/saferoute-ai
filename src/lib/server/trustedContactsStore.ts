import { TrustedContact, TrustedContactInput } from "@/lib/types";
import { randomUUID } from "crypto";
import { getSupabaseClient } from "@/lib/server/supabaseClient";

/**
 * Trusted contacts store.
 *
 * REAL: when SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set (see .env.example),
 * this reads/writes the real `trusted_contacts` Postgres table (see
 * supabase/migrations) via the server-only Supabase client. userId is our own
 * anonymous session id (src/lib/server/auth.ts) — there's no real auth system
 * yet, so every query below is explicitly scoped by it.
 *
 * FALLBACK: when Supabase isn't configured, or a query fails for any reason,
 * this falls back to an in-memory Map (DEMO MODE) — data resets on server
 * restart. The app must keep working either way. Every function signature
 * here is what the /api/me/trusted-contacts routes call — only the
 * implementation differs between the two backends.
 */

interface ContactRow {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: TrustedContact["relationship"];
  created_at: string;
  updated_at: string;
}

function rowToContact(row: ContactRow): TrustedContact {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phoneNumber: row.phone_number,
    relationship: row.relationship,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---- In-memory DEMO MODE fallback ----

const memoryStore = new Map<string, TrustedContact[]>();

function seedForUser(userId: string): TrustedContact[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      userId,
      name: "Mom",
      phoneNumber: "+91 98765 43210",
      relationship: "Parent",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function getMemoryBucket(userId: string): TrustedContact[] {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, seedForUser(userId));
  }
  return memoryStore.get(userId)!;
}

async function listMemory(userId: string): Promise<TrustedContact[]> {
  return [...getMemoryBucket(userId)].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

async function createMemory(userId: string, input: TrustedContactInput): Promise<TrustedContact> {
  const bucket = getMemoryBucket(userId);
  const now = new Date().toISOString();
  const contact: TrustedContact = {
    id: randomUUID(),
    userId,
    name: input.name.trim(),
    phoneNumber: input.phoneNumber.trim(),
    relationship: input.relationship,
    createdAt: now,
    updatedAt: now,
  };
  bucket.push(contact);
  return contact;
}

async function updateMemory(userId: string, id: string, input: TrustedContactInput): Promise<TrustedContact | null> {
  const bucket = getMemoryBucket(userId);
  const idx = bucket.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated: TrustedContact = {
    ...bucket[idx],
    name: input.name.trim(),
    phoneNumber: input.phoneNumber.trim(),
    relationship: input.relationship,
    updatedAt: new Date().toISOString(),
  };
  bucket[idx] = updated;
  return updated;
}

async function deleteMemory(userId: string, id: string): Promise<boolean> {
  const bucket = getMemoryBucket(userId);
  const idx = bucket.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  bucket.splice(idx, 1);
  return true;
}

async function isDuplicateMemory(userId: string, input: TrustedContactInput, excludeId?: string): Promise<boolean> {
  const bucket = getMemoryBucket(userId);
  const normalizedPhone = input.phoneNumber.replace(/\D/g, "");
  return bucket.some(
    (c) => c.id !== excludeId && c.phoneNumber.replace(/\D/g, "") === normalizedPhone && normalizedPhone.length > 0,
  );
}

// ---- Public API: tries Supabase first, falls back to memory on any failure ----

export async function listTrustedContacts(userId: string): Promise<TrustedContact[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("trusted_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (!error && data) return (data as ContactRow[]).map(rowToContact);
  }
  return listMemory(userId);
}

export async function createTrustedContact(userId: string, input: TrustedContactInput): Promise<TrustedContact> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("trusted_contacts")
      .insert({
        user_id: userId,
        name: input.name.trim(),
        phone_number: input.phoneNumber.trim(),
        relationship: input.relationship,
      })
      .select()
      .single();
    if (!error && data) return rowToContact(data as ContactRow);
  }
  return createMemory(userId, input);
}

export async function updateTrustedContact(
  userId: string,
  id: string,
  input: TrustedContactInput,
): Promise<TrustedContact | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("trusted_contacts")
      .update({
        name: input.name.trim(),
        phone_number: input.phoneNumber.trim(),
        relationship: input.relationship,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (!error) return data ? rowToContact(data as ContactRow) : null;
  }
  return updateMemory(userId, id, input);
}

export async function deleteTrustedContact(userId: string, id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("trusted_contacts")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
      .select("id");
    if (!error) return Boolean(data && data.length > 0);
  }
  return deleteMemory(userId, id);
}

export async function isDuplicateContact(
  userId: string,
  input: TrustedContactInput,
  excludeId?: string,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const normalizedPhone = input.phoneNumber.replace(/\D/g, "");
    if (normalizedPhone.length === 0) return false;
    const { data, error } = await supabase.from("trusted_contacts").select("id, phone_number").eq("user_id", userId);
    if (!error && data) {
      return (data as { id: string; phone_number: string }[]).some(
        (c) => c.id !== excludeId && c.phone_number.replace(/\D/g, "") === normalizedPhone,
      );
    }
  }
  return isDuplicateMemory(userId, input, excludeId);
}
