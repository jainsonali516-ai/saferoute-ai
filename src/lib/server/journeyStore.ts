import { Journey, JourneyCheckIn, JourneyLocation, RouteKind, SharedJourneyView, TravelMode } from "@/lib/types";
import { randomUUID } from "crypto";

/**
 * DEMO MODE in-memory journey store, keyed by journey id. Not a database —
 * resets on server restart. REAL INTEGRATION: swap for a `Journey` table
 * (see prisma/schema.prisma's TrustedContact model for the same pattern)
 * without changing the /api/journeys/[id]/** route handlers below.
 *
 * Demo time compression: a real ETA of N minutes would make "overdue" almost
 * impossible to reach in a live demo, so expectedArrivalAt is computed at 1/6
 * real time (matching the Live Journey page's own simulated progress bar).
 * This is cosmetic to the demo only — never applied to anything resembling
 * real-world time-sensitive safety logic.
 */
const DEMO_TIME_COMPRESSION = 6;

const journeys = new Map<string, Journey>();

export interface StartJourneyInput {
  origin: string;
  destination: string;
  mode: TravelMode;
  routeId: string;
  routeKind: RouteKind;
  etaMinutes: number;
  shareWithContactId?: string | null;
}

export function startJourney(id: string, userId: string, input: StartJourneyInput): Journey {
  const now = new Date();
  const compressedMinutes = Math.max(0.5, input.etaMinutes / DEMO_TIME_COMPRESSION);
  const expectedArrivalAt = new Date(now.getTime() + compressedMinutes * 60_000);

  const journey: Journey = {
    id,
    userId,
    origin: input.origin,
    destination: input.destination,
    mode: input.mode,
    routeId: input.routeId,
    routeKind: input.routeKind,
    etaMinutes: input.etaMinutes,
    startedAt: now.toISOString(),
    expectedArrivalAt: expectedArrivalAt.toISOString(),
    status: "active",
    shareWithContactId: input.shareWithContactId ?? null,
    checkIns: [],
    completedAt: null,
    lastLocation: null,
    isDemoData: true,
  };
  journeys.set(id, journey);
  return journey;
}

function withComputedStatus(journey: Journey): Journey {
  if (journey.status === "active" && new Date(journey.expectedArrivalAt).getTime() < Date.now()) {
    const overdue: Journey = { ...journey, status: "overdue" };
    journeys.set(journey.id, overdue);
    return overdue;
  }
  return journey;
}

export function getJourney(id: string, userId: string): Journey | null {
  const journey = journeys.get(id);
  if (!journey || journey.userId !== userId) return null;
  return withComputedStatus(journey);
}

export function addCheckIn(id: string, userId: string): Journey | null {
  const journey = getJourney(id, userId);
  if (!journey) return null;

  const checkIn: JourneyCheckIn = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "ok",
  };
  const updated: Journey = {
    ...journey,
    checkIns: [checkIn, ...journey.checkIns],
    // A fresh check-in means the traveler is fine even if the ETA has technically passed.
    status: journey.status === "overdue" ? "active" : journey.status,
  };
  journeys.set(id, updated);
  return updated;
}

export function completeJourney(id: string, userId: string): Journey | null {
  const journey = getJourney(id, userId);
  if (!journey) return null;
  const updated: Journey = { ...journey, status: "completed", completedAt: new Date().toISOString() };
  journeys.set(id, updated);
  return updated;
}

export function updateLocation(id: string, userId: string, lat: number, lng: number): Journey | null {
  const journey = getJourney(id, userId);
  if (!journey) return null;

  const lastLocation: JourneyLocation = { lat, lng, updatedAt: new Date().toISOString() };
  const updated: Journey = { ...journey, lastLocation };
  journeys.set(id, updated);
  return updated;
}

/**
 * Public read for the share link (/share/[id]) — deliberately takes no userId.
 * The journey id itself (a random UUID) acts as the unguessable share token, so
 * this only ever returns the small public-safe subset, never the full Journey.
 */
export function getSharedJourney(id: string): SharedJourneyView | null {
  const journey = journeys.get(id);
  if (!journey) return null;
  const { status } =
    journey.status === "active" && new Date(journey.expectedArrivalAt).getTime() < Date.now()
      ? { status: "overdue" as const }
      : journey;

  return {
    id: journey.id,
    origin: journey.origin,
    destination: journey.destination,
    status,
    startedAt: journey.startedAt,
    expectedArrivalAt: journey.expectedArrivalAt,
    lastLocation: journey.lastLocation,
  };
}
