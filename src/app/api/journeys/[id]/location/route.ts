import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { updateLocation } from "@/lib/server/journeyStore";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/journeys/[id]/location — the traveler's own device reports its
 * real browser geolocation here (see navigator.geolocation in src/app/live/page.tsx).
 * Only the journey owner can update it; /api/journeys/[id]/share reads it back
 * for anyone holding the share link.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return apiFail("lat and lng are required.");
  }

  try {
    const journey = updateLocation(id, userId, lat, lng);
    if (!journey) return apiFail("Journey not found.", 404);
    return apiOk(journey);
  } catch (err) {
    return apiFromCaught(err, "Couldn't update location.");
  }
}
