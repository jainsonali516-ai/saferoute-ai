import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/auth";
import {
  createTrustedContact,
  isDuplicateContact,
  listTrustedContacts,
} from "@/lib/server/trustedContactsStore";
import { TrustedContactInput, ContactRelationship } from "@/lib/types";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

const RELATIONSHIPS: ContactRelationship[] = ["Parent", "Guardian", "Friend", "Relative", "Other"];

function parseInput(body: unknown): { data?: TrustedContactInput; error?: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const { name, phoneNumber, relationship } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Name is required." };
  }
  if (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0) {
    return { error: "Phone number is required." };
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    return { error: "Enter a valid phone number (7-15 digits, optional +country code)." };
  }
  const rel = typeof relationship === "string" ? relationship : "Other";
  if (!RELATIONSHIPS.includes(rel as ContactRelationship)) {
    return { error: "Invalid relationship." };
  }

  return {
    data: {
      name: name.trim(),
      phoneNumber: normalizePhoneNumber(phoneNumber),
      relationship: rel as ContactRelationship,
    },
  };
}

export async function GET() {
  const userId = await getCurrentUserId();
  const contacts = await listTrustedContacts(userId);
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { data, error } = parseInput(body);
  if (!data) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (await isDuplicateContact(userId, data)) {
    return NextResponse.json(
      { error: "A trusted contact with this phone number already exists." },
      { status: 409 },
    );
  }

  const contact = await createTrustedContact(userId, data);
  return NextResponse.json({ contact }, { status: 201 });
}
