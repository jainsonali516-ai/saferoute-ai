import { ContextSnapshot } from "@/lib/types";
import { seededHash } from "@/lib/utils";
import { weatherProvider } from "@/lib/server/providers/weatherProvider";
import { trafficProvider } from "@/lib/server/providers/trafficProvider";
import { transportProvider } from "@/lib/server/providers/transportProvider";
import { activityProvider } from "@/lib/server/providers/activityProvider";

/**
 * Context Engine: aggregates weather/traffic/transport/activity providers
 * into one ContextSnapshot for a given location seed. This is the layer the
 * Recommendation Engine (see recommendationEngine.ts) and GET /api/context/current
 * both read from.
 *
 * Backed by DEMO_MODE mock providers today (see lib/server/providers/*) —
 * swap individual providers for real API clients without touching this file
 * or anything downstream of it.
 */
export async function getContextSnapshot(seedKey: string): Promise<ContextSnapshot> {
  const seed = seededHash(`context:${seedKey}`);

  const [weather, traffic, transport, activity] = await Promise.all([
    weatherProvider.getSnapshot(seed),
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
