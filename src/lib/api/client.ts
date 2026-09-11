import {
  ApiResult,
  ContextSnapshot,
  Journey,
  JourneyRequest,
  PrivacySettings,
  TrustedContact,
  TrustedContactInput,
  UserPreferences,
} from "@/lib/types";
import { trustedContactsService } from "@/lib/services/trustedContactsService";

/**
 * Centralized frontend API layer. Every network call the UI makes goes
 * through a named function here instead of ad-hoc fetch() calls scattered
 * across components — this is the one place that knows the wire format of
 * each /api/* route, so pages only ever deal with the app's internal types.
 */

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const body = (await res.json().catch(() => null)) as ApiResult<T> | null;
  if (!body || !res.ok || !body.success) {
    const message = body && !body.success ? body.error : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return body.data;
}

export interface RouteComparison {
  fastest: import("@/lib/types").RouteOption;
  safer: import("@/lib/types").RouteOption;
  balanced: import("@/lib/types").RouteOption;
  context: ContextSnapshot;
}

export function compareRoutes(journey: JourneyRequest): Promise<RouteComparison> {
  return request<RouteComparison>("/api/routes/compare", {
    method: "POST",
    body: JSON.stringify({
      origin: journey.origin,
      destination: journey.destination,
      travelMode: journey.mode,
      preferences: journey.priorities,
    }),
  });
}

/** Alias kept for the naming used in the product spec — same call as compareRoutes(). */
export const planJourney = compareRoutes;

// --- Context Engine -------------------------------------------------------

interface ContextWireShape {
  weather: ContextSnapshot["weather"];
  traffic: ContextSnapshot["traffic"];
  transport: ContextSnapshot["transportAvailability"];
  activity: ContextSnapshot["publicActivity"];
  updatedAt: string;
}

export async function getContext(): Promise<ContextSnapshot> {
  const wire = await request<ContextWireShape>("/api/context/current");
  return {
    weather: wire.weather,
    traffic: wire.traffic,
    transportAvailability: wire.transport,
    publicActivity: wire.activity,
    generatedAt: wire.updatedAt,
    isDemoData: true,
  };
}

// --- Journeys ---------------------------------------------------------------

export interface StartJourneyInput {
  origin: string;
  destination: string;
  mode: JourneyRequest["mode"];
  routeId: string;
  routeKind: Journey["routeKind"];
  etaMinutes: number;
  shareWithContactId?: string | null;
}

export function startJourney(id: string, input: StartJourneyInput): Promise<Journey> {
  return request<Journey>(`/api/journeys/${id}/start`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getJourney(id: string): Promise<Journey> {
  return request<Journey>(`/api/journeys/${id}`);
}

export function checkIn(id: string): Promise<Journey> {
  return request<Journey>(`/api/journeys/${id}/check-in`, { method: "POST" });
}

export function completeJourney(id: string): Promise<Journey> {
  return request<Journey>(`/api/journeys/${id}/complete`, { method: "POST" });
}

// --- Preferences --------------------------------------------------------------

export function getPreferences(): Promise<UserPreferences> {
  return request<UserPreferences>("/api/preferences");
}

export function updatePreferences(prefs: UserPreferences): Promise<UserPreferences> {
  return request<UserPreferences>("/api/preferences", { method: "PUT", body: JSON.stringify(prefs) });
}

// --- Privacy --------------------------------------------------------------

export function getPrivacySettings(): Promise<PrivacySettings> {
  return request<PrivacySettings>("/api/privacy/settings");
}

export function updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
  return request<PrivacySettings>("/api/privacy/settings", { method: "PUT", body: JSON.stringify(settings) });
}

// --- Trusted contacts -------------------------------------------------------
// Contacts already have their own backend (see /api/me/trusted-contacts) and
// service wrapper; re-exported here so every page imports network calls from
// this one module.

export function getContacts(): Promise<TrustedContact[]> {
  return trustedContactsService.list();
}

export function addContact(input: TrustedContactInput): Promise<TrustedContact> {
  return trustedContactsService.create(input);
}

export function updateContact(id: string, input: TrustedContactInput): Promise<TrustedContact> {
  return trustedContactsService.update(id, input);
}

export function deleteContact(id: string): Promise<void> {
  return trustedContactsService.remove(id);
}
