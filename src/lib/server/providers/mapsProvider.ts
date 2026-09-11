import { TravelMode } from "@/lib/types";

/**
 * MapsProvider: real geocoding + routing, backed by Mapbox (free tier: no
 * credit card required, 100k requests/month for both Geocoding and
 * Directions). Swap MapboxMapsProvider for a Google Directions client if
 * you'd rather use that instead — keep the same interface.
 *
 * Every method returns `null` on any failure (missing token, network error,
 * no results, timeout) instead of throwing, so the Recommendation Engine can
 * always fall back to its synthetic generator. The app must keep working
 * even when this provider is unconfigured or the API is briefly down.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RealRouteStep {
  name: string;
  distanceKm: number;
}

export interface RealRouteResult {
  distanceKm: number;
  durationMinutes: number;
  steps: RealRouteStep[];
}

export interface MapsProvider {
  geocode(place: string): Promise<Coordinates | null>;
  getRoute(origin: Coordinates, destination: Coordinates, mode: TravelMode): Promise<RealRouteResult | null>;
}

const REQUEST_TIMEOUT_MS = 5000;

async function fetchJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Mapbox Directions has no real public-transit profile on the free tier —
 * transit routing needs city-specific GTFS data most free APIs don't offer.
 * We approximate public_transport/rideshare with the driving profile and are
 * explicit about that limitation wherever this result reaches the UI.
 */
function mapboxProfile(mode: TravelMode): "walking" | "driving" | "cycling" {
  switch (mode) {
    case "walking":
      return "walking";
    case "driving":
    case "rideshare":
    case "public_transport":
      return "driving";
  }
}

/** Downsamples turn-by-turn steps into a handful of representative segments. */
function condenseSteps(steps: { name: string; distanceKm: number }[], targetCount = 5): RealRouteStep[] {
  const meaningful = steps.filter((s) => s.distanceKm > 0.03);
  if (meaningful.length <= targetCount) return meaningful;

  const bucketSize = Math.ceil(meaningful.length / targetCount);
  const condensed: RealRouteStep[] = [];
  for (let i = 0; i < meaningful.length; i += bucketSize) {
    const bucket = meaningful.slice(i, i + bucketSize);
    condensed.push({
      name: bucket[0].name,
      distanceKm: Number(bucket.reduce((sum, s) => sum + s.distanceKm, 0).toFixed(2)),
    });
  }
  return condensed;
}

interface MapboxGeocodeResponse {
  features?: { center?: [number, number] }[];
}

interface MapboxDirectionsResponse {
  routes?: {
    distance: number; // meters
    duration: number; // seconds
    legs: {
      steps: { distance: number; maneuver?: { instruction?: string } }[];
    }[];
  }[];
}

export class MapboxMapsProvider implements MapsProvider {
  constructor(private readonly accessToken: string) {}

  async geocode(place: string): Promise<Coordinates | null> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?limit=1&access_token=${this.accessToken}`;
    const data = (await fetchJson(url)) as MapboxGeocodeResponse | null;
    const center = data?.features?.[0]?.center;
    if (!center) return null;
    return { lng: center[0], lat: center[1] };
  }

  async getRoute(origin: Coordinates, destination: Coordinates, mode: TravelMode): Promise<RealRouteResult | null> {
    const profile = mapboxProfile(mode);
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?steps=true&geometries=geojson&overview=false&access_token=${this.accessToken}`;
    const data = (await fetchJson(url)) as MapboxDirectionsResponse | null;
    const route = data?.routes?.[0];
    if (!route) return null;

    const rawSteps = route.legs.flatMap((leg) =>
      leg.steps.map((step) => ({
        name: step.maneuver?.instruction || "Route segment",
        distanceKm: step.distance / 1000,
      })),
    );

    return {
      distanceKm: Number((route.distance / 1000).toFixed(1)),
      durationMinutes: Math.round(route.duration / 60),
      steps: condenseSteps(rawSteps),
    };
  }
}

/**
 * Resolves the active maps provider from MAPBOX_ACCESS_TOKEN (see
 * .env.example). Returns null when unconfigured — callers must treat that as
 * "use the synthetic generator", never throw.
 */
export function getMapsProvider(): MapsProvider | null {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  return new MapboxMapsProvider(token);
}
