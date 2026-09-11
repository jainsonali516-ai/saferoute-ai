import { ConfidenceLevel } from "@/lib/types";
import { DashboardSnapshot } from "./types";

function confidenceFor(score: number): ConfidenceLevel {
  if (score >= 82) return "high";
  if (score >= 65) return "medium";
  return "low";
}

interface SnapshotSeed {
  hoursAgo: number;
  overall: number;
  weather: number;
  transport: number;
  activity: number;
  walking: number;
  traffic: number;
}

const SEEDS: SnapshotSeed[] = [
  { hoursAgo: 0, overall: 84, weather: 91, transport: 88, activity: 82, walking: 86, traffic: 76 },
  { hoursAgo: 1, overall: 79, weather: 85, transport: 80, activity: 74, walking: 81, traffic: 70 },
  { hoursAgo: 2, overall: 88, weather: 93, transport: 90, activity: 87, walking: 89, traffic: 82 },
  { hoursAgo: 3, overall: 72, weather: 68, transport: 75, activity: 70, walking: 74, traffic: 65 },
  { hoursAgo: 4, overall: 91, weather: 95, transport: 92, activity: 90, walking: 92, traffic: 85 },
  { hoursAgo: 5, overall: 66, weather: 60, transport: 70, activity: 62, walking: 68, traffic: 58 },
  { hoursAgo: 6, overall: 80, weather: 82, transport: 78, activity: 79, walking: 83, traffic: 74 },
  { hoursAgo: 7, overall: 75, weather: 78, transport: 73, activity: 71, walking: 77, traffic: 69 },
  { hoursAgo: 8, overall: 86, weather: 89, transport: 84, activity: 85, walking: 88, traffic: 79 },
  { hoursAgo: 9, overall: 69, weather: 64, transport: 71, activity: 67, walking: 70, traffic: 61 },
];

/** DEMO DATA — 10 simulated Safety Dashboard snapshots over the last ~10 hours. */
export const DASHBOARD_SNAPSHOTS: DashboardSnapshot[] = SEEDS.map((s, i) => ({
  id: `snapshot-${i + 1}`,
  capturedAt: new Date(Date.now() - s.hoursAgo * 60 * 60 * 1000).toISOString(),
  overallContextScore: s.overall,
  weatherScore: s.weather,
  transportScore: s.transport,
  activityScore: s.activity,
  walkingExposureScore: s.walking,
  trafficScore: s.traffic,
  confidence: confidenceFor(s.overall),
  isDemoData: true,
}));

export const DASHBOARD_SCORE_DISCLAIMER =
  "Contextual Safety Score — simulated for this prototype and not a guarantee of personal safety.";
