import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { getPreferences, savePreferences } from "@/lib/server/preferencesStore";
import { TravelMode, UserPreferences } from "@/lib/types";

const TRAVEL_MODES: TravelMode[] = ["walking", "driving", "public_transport", "rideshare"];
const TOLERANCES = ["low", "medium", "high"] as const;

function parseBody(body: unknown): { data?: UserPreferences; error?: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const preferredModes = Array.isArray(b.preferredModes)
    ? (b.preferredModes as unknown[]).filter((m): m is TravelMode => TRAVEL_MODES.includes(m as TravelMode))
    : [];
  const walkingTolerance = TOLERANCES.includes(b.walkingTolerance as (typeof TOLERANCES)[number])
    ? (b.walkingTolerance as (typeof TOLERANCES)[number])
    : "medium";
  const routePriority =
    typeof b.routePriority === "number" ? Math.min(100, Math.max(0, b.routePriority)) : 50;

  return {
    data: {
      preferredModes,
      walkingTolerance,
      routePriority,
      wheelchairAccessible: Boolean(b.wheelchairAccessible),
      avoidStairs: Boolean(b.avoidStairs),
      avoidPoorlyLit: Boolean(b.avoidPoorlyLit),
    },
  };
}

export async function GET() {
  const userId = await getCurrentUserId();
  return apiOk(getPreferences(userId));
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
  if (!data) return apiFail(error ?? "Invalid preferences.");

  try {
    return apiOk(savePreferences(userId, data));
  } catch (err) {
    return apiFromCaught(err, "Couldn't save preferences.");
  }
}
