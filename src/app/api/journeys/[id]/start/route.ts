import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { startJourney, StartJourneyInput } from "@/lib/server/journeyStore";
import { RouteKind, TravelMode } from "@/lib/types";

const TRAVEL_MODES: TravelMode[] = ["walking", "driving", "public_transport", "rideshare"];
const ROUTE_KINDS: RouteKind[] = ["fastest", "safer", "balanced"];

function parseBody(body: unknown): { data?: StartJourneyInput; error?: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const origin = typeof b.origin === "string" ? b.origin.trim() : "";
  const destination = typeof b.destination === "string" ? b.destination.trim() : "";
  const mode = TRAVEL_MODES.includes(b.mode as TravelMode) ? (b.mode as TravelMode) : "walking";
  const routeId = typeof b.routeId === "string" ? b.routeId : "";
  const routeKind = ROUTE_KINDS.includes(b.routeKind as RouteKind) ? (b.routeKind as RouteKind) : "balanced";
  const etaMinutes = typeof b.etaMinutes === "number" && b.etaMinutes > 0 ? b.etaMinutes : 15;
  const shareWithContactId = typeof b.shareWithContactId === "string" ? b.shareWithContactId : null;

  if (!origin || !destination) return { error: "origin and destination are required." };

  return { data: { origin, destination, mode, routeId, routeKind, etaMinutes, shareWithContactId } };
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiFail("Invalid JSON body.");
  }

  const { data, error } = parseBody(body);
  if (!data) return apiFail(error ?? "Invalid request.");

  try {
    const journey = startJourney(id, userId, data);
    return apiOk(journey, 201);
  } catch (err) {
    return apiFromCaught(err, "Couldn't start the journey.");
  }
}
