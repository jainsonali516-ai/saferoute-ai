import { ContextSnapshot } from "@/lib/types";
import { seededHash } from "@/lib/utils";
import { weatherProvider, getRealWeatherProvider, WeatherSnapshot } from "@/lib/server/providers/weatherProvider";
import { trafficProvider } from "@/lib/server/providers/trafficProvider";
import { transportProvider } from "@/lib/server/providers/transportProvider";
import { activityProvider } from "@/lib/server/providers/activityProvider";
import { getMapsProvider } from "@/lib/server/providers/mapsProvider";

/**
 * Context Engine: aggregates weather/traffic/transport/activity providers
 * into one ContextSnapshot for a given location seed. This is the layer the
 * Recommendation Engine (see recommendationEngine.ts) and GET /api/context/current
 * both read from.
 *
 * Backed by DEMO_MODE mock providers today (see lib/server/providers/*) —
 * swap individual providers for real API clients without touching this file
 * or anything downstream of it. Weather is the exception: when `place` is
 * given and WEATHER_API_KEY/MAPBOX_ACCESS_TOKEN are configured, it geocodes
 * the place and pulls a real current-conditions snapshot from OpenWeatherMap,
 * falling back to the deterministic mock on any failure.
 */
async function resolveWeather(seed: number, place: string | undefined): Promise<WeatherSnapshot> {
  const realWeather = getRealWeatherProvider();
  const mapsProvider = getMapsProvider();
  if (realWeather && mapsProvider && place) {
    try {
      const coords = await mapsProvider.geocode(place);
      const snapshot = coords ? await realWeather.getSnapshotForLocation(coords) : null;
      if (snapshot) return snapshot;
    } catch {
      // fall through to mock
    }
  }
  return weatherProvider.getSnapshot(seed);
}

export async function getContextSnapshot(seedKey: string, place?: string): Promise<ContextSnapshot> {
  const seed = seededHash(`context:${seedKey}`);

  const [weather, traffic, transport, activity] = await Promise.all([
    resolveWeather(seed, place),
    trafficProvider.getSnapshot(seed + 1),
    transportProvider.getSnapshot(seed + 2),
    activityProvider.getSnapshot(seed + 3),
  ]);

  return {
    weather,
    traffic,
    publicActivity: activity,
    transportAvailability: transport,
    generatedAt: new Date().toISOString(),
    isDemoData: true,
  };
}
