import { Coordinates } from "@/lib/server/providers/mapsProvider";

/**
 * LightingProvider: real "well-lit segments" signal from OpenStreetMap's
 * `lit` tag (whether contributors have mapped a street as having lighting),
 * queried via the free, keyless Overpass API. No account or API key needed.
 *
 * This is a genuinely appropriate real signal for this product — unlike
 * real crime/incident statistics (which SafeRoute AI deliberately avoids,
 * see the app's uncertainty disclaimers), street lighting coverage is
 * neutral infrastructure data that doesn't stigmatize an area.
 *
 * Returns null (never throws) whenever OSM has no tagged data nearby or the
 * request fails/times out — callers must fall back to the simulated signal.
 */

export type LightingLevel = "low" | "moderate" | "high";

export interface LightingProvider {
  getLightingLevel(point: Coordinates): Promise<LightingLevel | null>;
}

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const REQUEST_TIMEOUT_MS = 6000;
const SEARCH_RADIUS_METERS = 150;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — lighting infrastructure rarely changes

interface CacheEntry {
  value: LightingLevel | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(point: Coordinates): string {
  // Round to ~110m grid so nearby lookups within a request share a cache entry.
  return `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`;
}

interface OverpassElement {
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

export class OverpassLightingProvider implements LightingProvider {
  async getLightingLevel(point: Coordinates): Promise<LightingLevel | null> {
    const key = cacheKey(point);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await this.fetchLightingLevel(point);
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  private async fetchLightingLevel(point: Coordinates): Promise<LightingLevel | null> {
    const query = `[out:json][timeout:5];way(around:${SEARCH_RADIUS_METERS},${point.lat},${point.lng})[highway];out tags;`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
          // Overpass's usage policy requires a descriptive User-Agent identifying
          // the application; requests without one are rejected with 406.
          "User-Agent": "SafeRouteAI-Hackathon-Demo/1.0 (+https://github.com/jainsonali516-ai/saferoute-ai)",
        },
        signal: controller.signal,
      });
      if (!res.ok) return null;

      const data = (await res.json()) as OverpassResponse;
      const ways = data.elements ?? [];
      if (ways.length === 0) return null;

      let lit = 0;
      let unlit = 0;
      for (const way of ways) {
        const tag = way.tags?.lit;
        if (tag === "yes") lit++;
        else if (tag === "no") unlit++;
      }

      const tagged = lit + unlit;
      if (tagged === 0) return null; // no one has mapped lighting here — no real signal available

      const litRatio = lit / tagged;
      if (litRatio >= 0.6) return "high";
      if (litRatio <= 0.3) return "low";
      return "moderate";
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const lightingProvider: LightingProvider = new OverpassLightingProvider();
