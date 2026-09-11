import { ImpactDirection } from "@/lib/types";
import { Coordinates } from "@/lib/server/providers/mapsProvider";
import { pick, seededRandom } from "@/lib/utils";

export interface WeatherSnapshot {
  condition: "clear" | "rain" | "fog" | "storm";
  tempC: number;
  impact: ImpactDirection;
  /** True when this snapshot came from a real forecast API, not the demo generator. */
  isReal?: boolean;
}

export interface WeatherProvider {
  getSnapshot(seed: number): Promise<WeatherSnapshot>;
}

const CONDITIONS = ["clear", "rain", "fog", "storm"] as const;

/**
 * Deterministic demo generator — used whenever real weather isn't configured,
 * a location can't be geocoded, or the real API call fails.
 */
export class MockWeatherProvider implements WeatherProvider {
  async getSnapshot(seed: number): Promise<WeatherSnapshot> {
    const rand = seededRandom(seed);
    const condition = pick(rand, CONDITIONS);
    return {
      condition,
      tempC: Math.round(18 + rand() * 14),
      impact: condition === "clear" ? "positive" : condition === "storm" ? "negative" : "neutral",
    };
  }
}

export const weatherProvider: WeatherProvider = new MockWeatherProvider();

/**
 * RealWeatherProvider: real current-conditions signal from OpenWeatherMap's
 * free tier (Current Weather Data API — 1,000 calls/day, no credit card).
 * Returns null (never throws) on any failure so callers always have the mock
 * generator to fall back to.
 */
export interface RealWeatherProvider {
  getSnapshotForLocation(point: Coordinates): Promise<WeatherSnapshot | null>;
}

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const REQUEST_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — weather changes slowly enough for demo purposes

interface CacheEntry {
  value: WeatherSnapshot | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

interface OpenWeatherResponse {
  weather?: { main?: string }[];
  main?: { temp?: number };
}

function mapCondition(main: string | undefined): WeatherSnapshot["condition"] {
  switch ((main ?? "").toLowerCase()) {
    case "rain":
    case "drizzle":
      return "rain";
    case "thunderstorm":
      return "storm";
    case "fog":
    case "mist":
    case "haze":
    case "smoke":
      return "fog";
    default:
      return "clear";
  }
}

export class OpenWeatherMapProvider implements RealWeatherProvider {
  constructor(private readonly apiKey: string) {}

  async getSnapshotForLocation(point: Coordinates): Promise<WeatherSnapshot | null> {
    const key = `${point.lat.toFixed(2)},${point.lng.toFixed(2)}`;
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = await this.fetchSnapshot(point);
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }

  private async fetchSnapshot(point: Coordinates): Promise<WeatherSnapshot | null> {
    const url = `${OPENWEATHER_URL}?lat=${point.lat}&lon=${point.lng}&units=metric&appid=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;

      const data = (await res.json()) as OpenWeatherResponse;
      const main = data.weather?.[0]?.main;
      const tempC = data.main?.temp;
      if (tempC === undefined) return null;

      const condition = mapCondition(main);
      return {
        condition,
        tempC: Math.round(tempC),
        impact: condition === "clear" ? "positive" : condition === "storm" ? "negative" : "neutral",
        isReal: true,
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Resolves the active real weather provider from WEATHER_API_KEY (see
 * .env.example). Returns null when unconfigured — callers must treat that as
 * "use the mock generator", never throw.
 */
export function getRealWeatherProvider(): RealWeatherProvider | null {
  const key = process.env.WEATHER_API_KEY;
  if (!key) return null;
  return new OpenWeatherMapProvider(key);
}
