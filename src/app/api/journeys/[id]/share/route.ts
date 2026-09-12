import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getSharedJourney } from "@/lib/server/journeyStore";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/journeys/[id]/share — deliberately unauthenticated. The journey id
 * (a random UUID, never enumerable) is the share token itself, so anyone with
 * the /share/[id] link can read this public-safe subset without an account —
 * that's the whole point of a share link. See getSharedJourney() for exactly
 * which fields this exposes.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const journey = getSharedJourney(id);
    if (!journey) return apiFail("This share link is invalid or has expired.", 404);
    return apiOk(journey);
  } catch (err) {
    return apiFromCaught(err, "Couldn't load shared journey.");
  }
}
