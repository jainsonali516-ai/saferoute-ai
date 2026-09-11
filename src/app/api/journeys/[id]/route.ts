import { NextRequest } from "next/server";
import { apiFail, apiFromCaught, apiOk } from "@/lib/server/apiResponse";
import { getCurrentUserId } from "@/lib/server/auth";
import { getJourney } from "@/lib/server/journeyStore";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  try {
    const journey = getJourney(id, userId);
    if (!journey) return apiFail("Journey not found.", 404);
    return apiOk(journey);
  } catch (err) {
    return apiFromCaught(err, "Couldn't load journey status.");
  }
}
