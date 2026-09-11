import { ConfidenceLevel, RouteKind, TravelMode } from "@/lib/types";
import {
  DemoContextIndicators,
  DemoJourney,
  DemoJourneyStatus,
  DemoRoute,
  LevelScale3,
  QualScale3,
  QualScale4,
} from "./types";
import { WEATHER_PRESETS } from "./weather";
import { TRAFFIC_PRESETS } from "./traffic";
import { pickReasons } from "./reasons";
import { DEFAULT_DEMO_USER } from "./users";

const STATUS_LABEL: Record<DemoJourneyStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
  planned: "Planned",
};

/**
 * Route-kind variation table: every journey's Fastest/Safer/Balanced routes
 * are derived from the same baseline distance/duration through these
 * multipliers, so numbers are authored and internally consistent rather than
 * random — but still distinct per route and per journey (see JOURNEY_DEFS'
 * `scoreJitter`/`baseline` below).
 */
const ROUTE_VARIANTS: Record<
  RouteKind,
  {
    distanceMult: number;
    durationMult: number;
    walkingMinutes: number;
    trafficIndex: number; // index into TRAFFIC_PRESETS
    scoreBase: number;
    publicActivity: LevelScale3;
    transportAvailability: QualScale4;
    walkingExposure: LevelScale3;
    wellLitSegments: QualScale3;
    routeCondition: QualScale3;
  }
> = {
  fastest: {
    distanceMult: 1,
    durationMult: 1,
    walkingMinutes: 3,
    trafficIndex: 3, // Moderate
    scoreBase: 70,
    publicActivity: "Moderate",
    transportAvailability: "Fair",
    walkingExposure: "High",
    wellLitSegments: "Fair",
    routeCondition: "Good",
  },
  safer: {
    distanceMult: 1.15,
    durationMult: 1.25,
    walkingMinutes: 2,
    trafficIndex: 1, // Low
    scoreBase: 85,
    publicActivity: "High",
    transportAvailability: "Excellent",
    walkingExposure: "Low",
    wellLitSegments: "Good",
    routeCondition: "Good",
  },
  balanced: {
    distanceMult: 1.08,
    durationMult: 1.12,
    walkingMinutes: 2,
    trafficIndex: 2, // Low-Moderate
    scoreBase: 80,
    publicActivity: "Moderate",
    transportAvailability: "Good",
    walkingExposure: "Moderate",
    wellLitSegments: "Good",
    routeCondition: "Good",
  },
};

const ROUTE_KINDS: RouteKind[] = ["fastest", "safer", "balanced"];

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 82) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function nearbyOpenPlacesFor(level: LevelScale3, seed: number): number {
  const ranges: Record<LevelScale3, [number, number]> = {
    Low: [5, 10],
    Moderate: [11, 20],
    High: [21, 30],
  };
  const [min, max] = ranges[level];
  return min + (seed % (max - min + 1));
}

function deriveContext(route: Omit<DemoRoute, "context">, seed: number): DemoContextIndicators {
  return {
    publicActivity: route.publicActivity,
    nearbyOpenPlaces: nearbyOpenPlacesFor(route.publicActivity, seed),
    transportAvailability: route.transportAvailability,
    walkingExposure:
      route.trafficLevel === "Very High" || route.trafficLevel === "High" ? "High" : route.publicActivity === "High" ? "Low" : "Moderate",
    wellLitSegments: route.routeCondition === "Good" ? "Good" : "Fair",
    routeCondition: route.routeCondition,
    dataConfidence: route.confidence === "high" ? "High" : route.confidence === "medium" ? "Medium" : "Low",
  };
}

interface JourneyDef {
  journeyId: string;
  origin: string;
  destination: string;
  date: string;
  startTime: string;
  mode: TravelMode;
  modeLabel: string;
  status: DemoJourneyStatus;
  baselineDistanceKm: number;
  baselineDurationMinutes: number;
  weatherIndex: number;
  recommendation: RouteKind;
  scoreJitter: number;
  reasonOffset: number;
}

const JOURNEY_DEFS: JourneyDef[] = [
  {
    journeyId: "journey-1",
    origin: "India Gate",
    destination: "Connaught Place",
    date: "2026-09-11",
    startTime: "6:15 PM",
    mode: "driving",
    modeLabel: "Driving",
    status: "in_progress",
    baselineDistanceKm: 2.8,
    baselineDurationMinutes: 12,
    weatherIndex: 0,
    recommendation: "balanced",
    scoreJitter: 0,
    reasonOffset: 0,
  },
  {
    journeyId: "journey-2",
    origin: "Rajiv Chowk",
    destination: "India Gate",
    date: "2026-09-10",
    startTime: "9:05 AM",
    mode: "public_transport",
    modeLabel: "Metro",
    status: "completed",
    baselineDistanceKm: 3.4,
    baselineDurationMinutes: 14,
    weatherIndex: 1,
    recommendation: "safer",
    scoreJitter: 3,
    reasonOffset: 2,
  },
  {
    journeyId: "journey-3",
    origin: "Hauz Khas",
    destination: "Select Citywalk",
    date: "2026-09-10",
    startTime: "7:40 PM",
    mode: "public_transport",
    modeLabel: "Public Transport",
    status: "completed",
    baselineDistanceKm: 2.1,
    baselineDurationMinutes: 10,
    weatherIndex: 2,
    recommendation: "safer",
    scoreJitter: -2,
    reasonOffset: 4,
  },
  {
    journeyId: "journey-4",
    origin: "Saket",
    destination: "Nehru Place",
    date: "2026-09-12",
    startTime: "8:30 AM",
    mode: "driving",
    modeLabel: "Driving",
    status: "planned",
    baselineDistanceKm: 6.3,
    baselineDurationMinutes: 22,
    weatherIndex: 3,
    recommendation: "balanced",
    scoreJitter: 4,
    reasonOffset: 6,
  },
  {
    journeyId: "journey-5",
    origin: "Karol Bagh",
    destination: "Connaught Place",
    date: "2026-09-09",
    startTime: "6:50 PM",
    mode: "public_transport",
    modeLabel: "Metro",
    status: "completed",
    baselineDistanceKm: 4.2,
    baselineDurationMinutes: 16,
    weatherIndex: 4,
    recommendation: "fastest",
    scoreJitter: -3,
    reasonOffset: 8,
  },
  {
    journeyId: "journey-6",
    origin: "Lajpat Nagar",
    destination: "India Gate",
    date: "2026-09-08",
    startTime: "9:20 PM",
    mode: "rideshare",
    modeLabel: "Cab",
    status: "completed",
    baselineDistanceKm: 7.1,
    baselineDurationMinutes: 24,
    weatherIndex: 0,
    recommendation: "safer",
    scoreJitter: 2,
    reasonOffset: 10,
  },
  {
    journeyId: "journey-7",
    origin: "Dwarka Sector 21",
    destination: "Airport",
    date: "2026-09-13",
    startTime: "5:00 AM",
    mode: "public_transport",
    modeLabel: "Metro",
    status: "planned",
    baselineDistanceKm: 5.4,
    baselineDurationMinutes: 19,
    weatherIndex: 1,
    recommendation: "balanced",
    scoreJitter: -4,
    reasonOffset: 1,
  },
  {
    journeyId: "journey-8",
    origin: "Vasant Kunj",
    destination: "Saket",
    date: "2026-09-07",
    startTime: "4:10 PM",
    mode: "driving",
    modeLabel: "Driving",
    status: "completed",
    baselineDistanceKm: 6.0,
    baselineDurationMinutes: 21,
    weatherIndex: 2,
    recommendation: "fastest",
    scoreJitter: 1,
    reasonOffset: 3,
  },
  {
    journeyId: "journey-9",
    origin: "Noida Sector 18",
    destination: "Botanical Garden",
    date: "2026-09-06",
    startTime: "11:15 AM",
    mode: "public_transport",
    modeLabel: "Metro",
    status: "completed",
    baselineDistanceKm: 3.6,
    baselineDurationMinutes: 15,
    weatherIndex: 3,
    recommendation: "safer",
    scoreJitter: 3,
    reasonOffset: 5,
  },
  {
    journeyId: "journey-10",
    origin: "Gurugram Cyber Hub",
    destination: "MG Road",
    date: "2026-09-14",
    startTime: "7:30 PM",
    mode: "rideshare",
    modeLabel: "Cab",
    status: "planned",
    baselineDistanceKm: 2.6,
    baselineDurationMinutes: 11,
    weatherIndex: 4,
    recommendation: "balanced",
    scoreJitter: -1,
    reasonOffset: 7,
  },
];

const CHECK_IN_TEMPLATES: { label: string; note: string }[] = [
  { label: "Checked in", note: "Journey progressing normally" },
  { label: "Checked in", note: "User confirmed they are okay" },
  { label: "Checked in", note: "User confirmed they are okay" },
  { label: "Checked in", note: "Journey progressing normally" },
];

function buildCheckIns(startHour: number, startMinute: number, count: number): { time: string; label: string; note: string }[] {
  const checkIns = [];
  let h = startHour;
  let m = startMinute;
  for (let i = 0; i < count; i++) {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const template = CHECK_IN_TEMPLATES[i % CHECK_IN_TEMPLATES.length];
    checkIns.push({
      time: `${displayHour}:${String(m).padStart(2, "0")} ${period}`,
      label: template.label,
      note: template.note,
    });
    m += 7 + i * 2;
    if (m >= 60) {
      h += Math.floor(m / 60);
      m %= 60;
    }
  }
  return checkIns;
}

function buildRoute(def: JourneyDef, kind: RouteKind, index: number): DemoRoute {
  const variant = ROUTE_VARIANTS[kind];
  const seed = index * 11 + kind.length;
  const score = Math.max(35, Math.min(97, variant.scoreBase + def.scoreJitter));
  const confidence = confidenceFromScore(score);

  const base: Omit<DemoRoute, "context"> = {
    id: `${def.journeyId}-${kind}`,
    journeyId: def.journeyId,
    kind,
    name: `${kind[0].toUpperCase()}${kind.slice(1)} Route`,
    distanceKm: Number((def.baselineDistanceKm * variant.distanceMult).toFixed(1)),
    durationMinutes: Math.round(def.baselineDurationMinutes * variant.durationMult),
    walkingMinutes: variant.walkingMinutes,
    trafficLevel: TRAFFIC_PRESETS[variant.trafficIndex].level,
    transportAvailability: variant.transportAvailability,
    publicActivity: variant.publicActivity,
    weatherImpact: WEATHER_PRESETS[def.weatherIndex].impact,
    routeCondition: variant.routeCondition,
    contextualSafetyScore: score,
    confidence,
    reasons: pickReasons(def.reasonOffset + ROUTE_KINDS.indexOf(kind) * 2, 3 + (index % 3)),
  };

  return { ...base, context: deriveContext(base, seed) };
}

function buildJourney(def: JourneyDef, index: number): DemoJourney {
  const routes = ROUTE_KINDS.map((kind) => buildRoute(def, kind, index));
  const recommended = routes.find((r) => r.kind === def.recommendation) ?? routes[0];
  const weather = WEATHER_PRESETS[def.weatherIndex];
  const traffic = TRAFFIC_PRESETS[ROUTE_VARIANTS[def.recommendation].trafficIndex];

  const [hourStr, rest] = def.startTime.split(":");
  const [minuteStr, period] = rest.split(" ");
  let startHour = Number(hourStr) % 12;
  if (period === "PM") startHour += 12;
  const startMinute = Number(minuteStr);

  return {
    journeyId: def.journeyId,
    userId: DEFAULT_DEMO_USER.id,
    origin: def.origin,
    destination: def.destination,
    date: def.date,
    startTime: def.startTime,
    estimatedDurationMinutes: recommended.durationMinutes,
    actualDurationMinutes:
      def.status === "completed" ? recommended.durationMinutes + (index % 3) - 1 : null,
    distanceKm: recommended.distanceKm,
    mode: def.mode,
    modeLabel: def.modeLabel,
    status: def.status,
    statusLabel: STATUS_LABEL[def.status],
    contextualSafetyScore: recommended.contextualSafetyScore,
    confidence: recommended.confidence,
    weather,
    traffic,
    walkingMinutes: recommended.walkingMinutes,
    checkIns:
      def.status === "planned"
        ? []
        : buildCheckIns(startHour, startMinute, def.status === "in_progress" ? 2 : 4),
    recommendation: def.recommendation,
    reasons: recommended.reasons,
    routes,
    isDemoData: true,
  };
}

/** DEMO DATA — 10 interconnected demo journeys, each with 3 generated routes. */
export const DEMO_JOURNEYS: DemoJourney[] = JOURNEY_DEFS.map(buildJourney);

export function demoJourneyById(id: string): DemoJourney | undefined {
  return DEMO_JOURNEYS.find((j) => j.journeyId === id);
}
