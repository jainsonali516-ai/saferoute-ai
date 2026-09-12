import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { nearbyHelpProvider } from "@/lib/server/providers/nearbyHelpProvider";

/**
 * GET /api/context/nearby-help?lat=..&lng=.. — real police/hospital/fire
 * station lookup near a point via OpenStreetMap's Overpass API (see
 * nearbyHelpProvider.ts). No API key required.
 */
export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return apiFail("lat and lng query params are required.");
  }

  try {
    const places = await nearbyHelpProvider.findNearby({ lat, lng });
    return apiOk({ places });
  } catch (err) {
    return apiFromCaught(err, "Couldn't load nearby help.");
  }
}
