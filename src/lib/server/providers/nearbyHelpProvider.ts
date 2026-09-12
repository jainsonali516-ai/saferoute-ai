import { Coordinates } from "@/lib/server/providers/mapsProvider";

/**
 * NearbyHelpProvider: real police stations, hospitals and fire stations near
 * a point, queried via the same free, keyless Overpass API used for street
 * lighting. No account or API key needed.
 *
 * Returns [] (never throws) on any failure or when nothing is mapped nearby —
 * callers must treat that as "no results", not an error.
 */

export type HelpPlaceType = "police" | "hospital" | "fire_station";

export interface NearbyHelpPlace {
  id: string;
  name: string;
  type: HelpPlaceType;
  distanceKm: number;
  location: Coordinates;
}

export interface NearbyHelpProvider {
  findNearby(point: Coordinates, radiusMeters?: number): Promise<NearbyHelpPlace[]>;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const REQUEST_TIMEOUT_MS = 6000;
const DEFAULT_RADIUS_METERS = 3000;
const MAX_RESULTS = 10;

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function placeType(tags: Record<string, string> | undefined): HelpPlaceType | null {
  const amenity = tags?.amenity;
  if (amenity === "police") return "police";
  if (amenity === "hospital") return "hospital";
  if (amenity === "fire_station") return "fire_station";
  return null;
}

export class OverpassNearbyHelpProvider implements NearbyHelpProvider {
  async findNearby(point: Coordinates, radiusMeters = DEFAULT_RADIUS_METERS): Promise<NearbyHelpPlace[]> {
    const query = `[out:json][timeout:5];(
      node(around:${radiusMeters},${point.lat},${point.lng})[amenity~"^(police|hospital|fire_station)$"];
      way(around:${radiusMeters},${point.lat},${point.lng})[amenity~"^(police|hospital|fire_station)$"];
    );out center tags;`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
          "User-Agent": "SafeRouteAI-Hackathon-Demo/1.0 (+https://github.com/jainsonali516-ai/saferoute-ai)",
        },
        signal: controller.signal,
      });
      if (!res.ok) return [];

      const data = (await res.json()) as OverpassResponse;
      const elements = data.elements ?? [];

      const places: NearbyHelpPlace[] = [];
      for (const el of elements) {
        const type = placeType(el.tags);
        if (!type) continue;
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (lat === undefined || lng === undefined) continue;

        const location = { lat, lng };
        places.push({
          id: `${type}-${el.id}`,
          name: el.tags?.name || defaultName(type),
          type,
          distanceKm: Number(haversineKm(point, location).toFixed(2)),
          location,
        });
      }

      places.sort((a, b) => a.distanceKm - b.distanceKm);
      return places.slice(0, MAX_RESULTS);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}

function defaultName(type: HelpPlaceType): string {
  switch (type) {
    case "police":
      return "Police station";
    case "hospital":
      return "Hospital";
    case "fire_station":
      return "Fire station";
  }
}

export const nearbyHelpProvider: NearbyHelpProvider = new OverpassNearbyHelpProvider();
