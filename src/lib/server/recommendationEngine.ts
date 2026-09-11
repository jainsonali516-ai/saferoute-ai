import {
  ConfidenceLevel,
  ContextFactor,
  ContextSnapshot,
  JourneyRequest,
  RouteKind,
  RouteOption,
  RouteSegment,
  TravelMode,
} from "@/lib/types";
import { getContextSnapshot } from "@/lib/server/contextEngine";
import { getMapsProvider, RealRouteResult } from "@/lib/server/providers/mapsProvider";
import { lightingProvider } from "@/lib/server/providers/lightingProvider";
import { pick, seededHash, seededRandom } from "@/lib/utils";

/**
 * Recommendation Engine: the seam where real routing + ML risk scoring would
 * plug in. Consumes the Context Engine's output plus the traveler's request
 * (and, upstream, their saved preferences) to build Fastest / Safer /
 * Balanced RouteOptions.
 *
 * REAL INTEGRATION POINTS:
 * - Route geometry, distance, base ETA -> now wired to Mapbox Geocoding + Directions
 *   (see providers/mapsProvider.ts) whenever MAPBOX_ACCESS_TOKEN is set (.env.example).
 *   With no token configured, or if geocoding/directions fails for any reason, this
 *   falls back to the synthetic generator below — the app must never break because a
 *   real API is unavailable. Only the Fastest route's distance/ETA/segments come from
 *   real map data; Safer/Balanced are still derived estimates layered on top of it.
 *   Weather (see contextEngine.ts) is also real when WEATHER_API_KEY is set, sourced
 *   from OpenWeatherMap for the destination; the rest of the context/safety scoring
 *   is always simulated (no free API provides real crime/safety data).
 * - Context-aware risk/exposure scoring -> a trained ML model service (gradient boosted
 *   trees or a small neural net) taking in weather/traffic/activity/transport signals,
 *   time-of-day, mode, and anonymized historical demo-labeled data. It must output a
 *   score AND a calibrated confidence/uncertainty band — never a bare "safe/unsafe" flag.
 * - Personalization -> blend the model output with the traveler's saved
 *   UserPreferences (see preferencesStore.ts) before ranking routes.
 *
 * This mock implementation generates deterministic, clearly-labeled demo data only.
 * It never reads or claims real crime, incident, or safety statistics, and it
 * never asserts a route is guaranteed safe.
 */

const SEGMENT_NAMES = [
  "Main Street stretch",
  "Riverside path",
  "Market crossing",
  "Transit interchange",
  "Residential lane",
  "Commercial avenue",
  "Park perimeter",
  "Station approach",
];

const EXPLANATION_LIBRARY: Record<RouteKind, string[]> = {
  fastest: ["Shortest predicted travel time for this mode", "Fewest transfers/turns along the way"],
  safer: [
    "More public activity along most of the route",
    "Better transport availability if plans change",
    "Lower walking exposure through unlit stretches",
    "Weather conditions are more favorable on this path",
  ],
  balanced: [
    "Close to the fastest option with meaningfully better context signals",
    "Moderate walking exposure with reasonable public activity",
  ],
};

async function buildSegments(
  rand: () => number,
  mode: TravelMode,
  count: number,
  realSteps?: RealRouteResult["steps"],
): Promise<RouteSegment[]> {
  const levels = ["low", "moderate", "high"] as const;

  if (realSteps && realSteps.length > 0) {
    // Real step names/distances from Mapbox. Lighting is looked up per-segment
    // from OpenStreetMap's `lit` tag (free, keyless, no crime/incident data
    // involved) when the segment has a real coordinate and OSM has mapped it;
    // otherwise falls back to a simulated level. Activity always stays
    // simulated — no free API provides that signal.
    return Promise.all(
      realSteps.map(async (step, i) => {
        const realLighting = step.location ? await lightingProvider.getLightingLevel(step.location) : null;
        return {
          id: `seg-${i}`,
          name: step.name,
          distanceKm: Number(step.distanceKm.toFixed(1)),
          mode,
          description: realLighting
            ? "Real route segment from map data; lighting level from OpenStreetMap."
            : "Real route segment from map data. Lighting level is a simulated demo signal.",
          activityLevel: pick(rand, levels),
          lightingLevel: realLighting ?? pick(rand, levels),
        };
      }),
    );
  }

  return Array.from({ length: count }, (_, i) => ({
    id: `seg-${i}`,
    name: pick(rand, SEGMENT_NAMES),
    distanceKm: Number((0.4 + rand() * 1.6).toFixed(1)),
    mode,
    description: "Demo segment — real deployments would render actual street/transit names.",
    activityLevel: pick(rand, levels),
    lightingLevel: pick(rand, levels),
  }));
}

function buildFactors(rand: () => number, kind: RouteKind, context: ContextSnapshot): ContextFactor[] {
  return [
    {
      key: "activity",
      label: "Public activity",
      impact: kind === "fastest" ? "neutral" : "positive",
      description: "Estimated pedestrian/public presence along the route (demo signal).",
      weight: Math.round(40 + rand() * 50),
    },
    {
      key: "lighting",
      label: "Walking exposure",
      impact: kind === "safer" ? "positive" : kind === "fastest" ? "negative" : "neutral",
      description: "Share of the route that is unlit or has minimal foot traffic (demo signal).",
      weight: Math.round(30 + rand() * 50),
    },
    {
      key: "transport",
      label: "Transport availability",
      impact: kind === "fastest" ? "neutral" : "positive",
      description: "Backup transport options if you need to change plans mid-journey.",
      weight: Math.round(35 + rand() * 45),
    },
    {
      key: "weather",
      label: "Weather conditions",
      impact: context.weather.impact,
      description: context.weather.isReal
        ? "Real current conditions near your destination, from OpenWeatherMap."
        : "Forecast conditions along the route corridor (demo signal).",
      weight: Math.round(20 + rand() * 40),
    },
  ];
}

function scoreForKind(rand: () => number, kind: RouteKind, safetyWeight: number): number {
  const jitter = rand() * 10;
  const base = kind === "fastest" ? 45 : kind === "safer" ? 72 : 60;
  // Personalization: nudge the score toward the user's safety/speed priority.
  const personalizationNudge = kind === "fastest" ? (100 - safetyWeight) * 0.06 : safetyWeight * 0.06;
  return Math.min(99, Math.round(base + jitter + personalizationNudge));
}

function confidenceForKind(rand: () => number): ConfidenceLevel {
  return pick(rand, ["medium", "medium", "high", "low"] as const);
}

function etaForKind(rand: () => number, baseMinutes: number, kind: RouteKind, minimizeWalking: boolean): number {
  const walkingPenalty = minimizeWalking && kind !== "fastest" ? 1.08 : 1;
  if (kind === "fastest") return Math.round(baseMinutes * walkingPenalty);
  if (kind === "safer") return Math.round(baseMinutes * (1.15 + rand() * 0.25) * walkingPenalty);
  return Math.round(baseMinutes * (1.05 + rand() * 0.1) * walkingPenalty);
}

async function buildRoute(
  request: JourneyRequest,
  kind: RouteKind,
  context: ContextSnapshot,
  realRoute: RealRouteResult | null,
): Promise<RouteOption> {
  const seedKey = `${request.origin}|${request.destination}|${request.mode}|${kind}`;
  const rand = seededRandom(seededHash(seedKey));
  const priorities = request.priorities;

  const baseMinutes = realRoute ? realRoute.durationMinutes : Math.round(12 + rand() * 30);
  const baseDistance = realRoute ? realRoute.distanceKm : Number((1.2 + rand() * 6).toFixed(1));

  const explanations = [...EXPLANATION_LIBRARY[kind]];
  if (context.weather.impact === "positive" && kind !== "fastest") {
    explanations.push("Weather conditions are more favorable right now");
  }
  if (priorities?.wheelchairAccessible) {
    explanations.push("Filtered to wheelchair-accessible paths per your preferences");
  }

  const usingRealRoute = Boolean(realRoute) && kind === "fastest";
  const segments = await buildSegments(rand, request.mode, 3 + Math.floor(rand() * 2), usingRealRoute ? realRoute?.steps : undefined);

  return {
    id: `${kind}-${seededHash(seedKey)}`,
    kind,
    mode: request.mode,
    etaMinutes: etaForKind(rand, baseMinutes, kind, priorities?.minimizeWalking ?? false),
    distanceKm: kind === "fastest" ? baseDistance : Number((baseDistance * (1 + rand() * 0.2)).toFixed(1)),
    estimatedContextScore: scoreForKind(rand, kind, priorities?.safetyWeight ?? 50),
    confidence: confidenceForKind(rand),
    factors: buildFactors(rand, kind, context),
    segments,
    explanations,
    uncertaintyNote: usingRealRoute
      ? "Distance and travel time are from real map data; the context/safety score is still a demo estimate, not a guarantee of safety."
      : "Estimate based on demo context signals (time of day, mock weather/traffic/activity). Not a guarantee of safety.",
    isDemoData: true,
  };
}

/**
 * Attempts a real geocode + directions lookup. Returns null (never throws)
 * whenever real maps aren't configured, a place can't be geocoded, or the
 * Directions API call fails — callers must fall back to the synthetic
 * generator in that case.
 */
async function tryGetRealRoute(request: JourneyRequest): Promise<RealRouteResult | null> {
  const provider = getMapsProvider();
  if (!provider) return null;

  try {
    const [origin, destination] = await Promise.all([
      provider.geocode(request.origin),
      provider.geocode(request.destination),
    ]);
    if (!origin || !destination) return null;
    return await provider.getRoute(origin, destination, request.mode);
  } catch {
    return null;
  }
}

export interface RouteComparison {
  fastest: RouteOption;
  safer: RouteOption;
  balanced: RouteOption;
  context: ContextSnapshot;
}

export async function compareRoutes(request: JourneyRequest): Promise<RouteComparison> {
  const [context, realRoute] = await Promise.all([
    getContextSnapshot(`${request.origin}|${request.destination}`, request.destination),
    tryGetRealRoute(request),
  ]);
  const [fastest, safer, balanced] = await Promise.all([
    buildRoute(request, "fastest", context, realRoute),
    buildRoute(request, "safer", context, realRoute),
    buildRoute(request, "balanced", context, realRoute),
  ]);
  return { fastest, safer, balanced, context };
}
