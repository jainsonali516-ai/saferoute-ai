import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { getPrivacySettings, savePrivacySettings } from "@/lib/server/privacyStore";
import { PrivacySettings } from "@/lib/types";

function parseBody(body: unknown): { data?: PrivacySettings; error?: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  return {
    data: {
      locationSharing: Boolean(b.locationSharing),
      saveJourneyHistory: Boolean(b.saveJourneyHistory),
      shareWithTrustedContact: Boolean(b.shareWithTrustedContact),
      analyticsConsent: Boolean(b.analyticsConsent),
    },
  };
}

export async function GET() {
  const userId = await getCurrentUserId();
  return apiOk(getPrivacySettings(userId));
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail("Invalid JSON body.");
  }

  const { data, error } = parseBody(body);
  if (!data) return apiFail(error ?? "Invalid settings.");

  try {
    return apiOk(savePrivacySettings(userId, data));
  } catch (err) {
    return apiFromCaught(err, "Couldn't save privacy settings.");
  }
}
