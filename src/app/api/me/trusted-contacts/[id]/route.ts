import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/server/auth";
import {
  deleteTrustedContact,
  isDuplicateContact,
  updateTrustedContact,
} from "@/lib/server/trustedContactsStore";
import { ContactRelationship, TrustedContactInput } from "@/lib/types";
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
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

  if (isDuplicateContact(userId, data, id)) {
    return NextResponse.json(
      { error: "A trusted contact with this phone number already exists." },
      { status: 409 },
    );
  }

  const contact = await updateTrustedContact(userId, id, data);
  if (!contact) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }
  return NextResponse.json({ contact });
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const removed = await deleteTrustedContact(userId, id);
  if (!removed) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
