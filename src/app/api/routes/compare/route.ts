import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { checkRateLimit, clientKeyFrom } from "@/lib/server/rateLimit";
import { compareRoutes } from "@/lib/server/recommendationEngine";
import { JourneyRequest, RoutePriorities, TravelMode } from "@/lib/types";

const TRAVEL_MODES: TravelMode[] = ["walking", "driving", "public_transport", "rideshare"];

function parsePriorities(raw: unknown): RoutePriorities {
  const p = (raw ?? {}) as Record<string, unknown>;
  // Accepts both our own frontend's field names and the simpler
  // { walkingPreference: "low" | "medium" | "high" } shape from the spec example.
  const walkingPreference = typeof p.walkingPreference === "string" ? p.walkingPreference : undefined;

  return {
    safetyWeight: typeof p.safetyWeight === "number" ? p.safetyWeight : 50,
    avoidPoorlyLit: typeof p.avoidPoorlyLit === "boolean" ? p.avoidPoorlyLit : true,
    minimizeWalking:
      typeof p.minimizeWalking === "boolean" ? p.minimizeWalking : walkingPreference === "low",
    wheelchairAccessible: typeof p.wheelchairAccessible === "boolean" ? p.wheelchairAccessible : false,
  };
}

function parseBody(body: unknown): { data?: JourneyRequest; error?: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const origin = typeof b.origin === "string" ? b.origin.trim() : "";
  const destination = typeof b.destination === "string" ? b.destination.trim() : "";
  // Accepts both `mode` (our frontend) and `travelMode` (spec example).
  const rawMode = (typeof b.travelMode === "string" ? b.travelMode : b.mode) as string | undefined;
  const mode: TravelMode = TRAVEL_MODES.includes(rawMode as TravelMode) ? (rawMode as TravelMode) : "walking";

  if (!origin) return { error: "origin is required." };
  if (!destination) return { error: "destination is required." };
  if (origin.length > 200 || destination.length > 200) return { error: "origin/destination is too long." };

  return {
    data: {
      origin,
      destination,
      mode,
      priorities: parsePriorities(b.preferences ?? b.priorities),
    },
  };
}

export async function POST(req: NextRequest) {
  const { allowed } = checkRateLimit(`compare:${clientKeyFrom(req)}`, 30);
  if (!allowed) return apiFail("Too many requests. Please slow down.", 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail("Invalid JSON body.");
  }

  const { data, error } = parseBody(body);
  if (!data) return apiFail(error ?? "Invalid request.");

  try {
    const comparison = await compareRoutes(data);
    return apiOk(comparison);
  } catch (err) {
    return apiFromCaught(err, "Couldn't generate route comparisons.");
  }
}
