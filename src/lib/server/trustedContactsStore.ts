import { TrustedContact, TrustedContactInput } from "@/lib/types";
import { randomUUID } from "crypto";

/**
 * DEMO MODE data store for trusted contacts.
 *
 * This is an in-memory, server-side store keyed by userId. It is NOT a database —
 * data resets on server restart and is never sent to the client in bulk (only the
 * requesting user's own contacts are ever returned by the API routes).
 *
 * REAL INTEGRATION: swap this module for Prisma (see prisma/schema.prisma for the
 * intended TrustedContact model) or your ORM of choice. Every function signature
 * below is written so the /api/me/trusted-contacts routes don't need to change —
 * only the implementation of these functions does.
 *
 *   model TrustedContact {
 *     id          String   @id @default(cuid())
 *     userId      String
 *     user        User     @relation(fields: [userId], references: [id])
 *     name        String
 *     phoneNumber String
 *     relationship String
 *     createdAt   DateTime @default(now())
 *     updatedAt   DateTime @updatedAt
 *   }
 */

const store = new Map<string, TrustedContact[]>();

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

function getBucket(userId: string): TrustedContact[] {
  if (!store.has(userId)) {
    store.set(userId, seedForUser(userId));
  }
  return store.get(userId)!;
}

export async function listTrustedContacts(userId: string): Promise<TrustedContact[]> {
  return [...getBucket(userId)].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createTrustedContact(
  userId: string,
  input: TrustedContactInput,
): Promise<TrustedContact> {
  const bucket = getBucket(userId);
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

export async function updateTrustedContact(
  userId: string,
  id: string,
  input: TrustedContactInput,
): Promise<TrustedContact | null> {
  const bucket = getBucket(userId);
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

export async function deleteTrustedContact(userId: string, id: string): Promise<boolean> {
  const bucket = getBucket(userId);
  const idx = bucket.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  bucket.splice(idx, 1);
  return true;
}

export function isDuplicateContact(
  userId: string,
  input: TrustedContactInput,
  excludeId?: string,
): boolean {
  const bucket = getBucket(userId);
  const normalizedPhone = input.phoneNumber.replace(/\D/g, "");
  return bucket.some(
    (c) =>
      c.id !== excludeId &&
      c.phoneNumber.replace(/\D/g, "") === normalizedPhone &&
      normalizedPhone.length > 0,
  );
}
