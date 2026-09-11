import { NextRequest } from "next/server";
import { apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getContextSnapshot } from "@/lib/server/contextEngine";

/**
 * GET /api/context/current — returns the wire-format context envelope from
 * the spec (weather/traffic/transport/activity/updatedAt). The frontend API
 * client (src/lib/api/client.ts) adapts this into the internal ContextSnapshot
 * shape the Safety Dashboard already renders, so the UI never has to know
 * about this exact field naming.
 */
export async function GET(req: NextRequest) {
  const seed = req.nextUrl.searchParams.get("seed") ?? "current";
  try {
    const snapshot = await getContextSnapshot(seed);
    return apiOk({
      weather: snapshot.weather,
      traffic: snapshot.traffic,
      transport: snapshot.transportAvailability,
      activity: snapshot.publicActivity,
      updatedAt: snapshot.generatedAt,
      isDemoData: true as const,
    });
  } catch (err) {
    return apiFromCaught(err, "Couldn't load context signals.");
  }
}
