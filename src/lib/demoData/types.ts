// Centralized, interconnected DEMO DATA for SafeRoute AI.
//
// Everything in src/lib/demoData/** is SIMULATED content for the prototype —
// never real crime, traffic, or weather statistics. It exists so the app
// feels like a data-rich working product during a demo, while staying
// clearly labeled as demo/simulated wherever it's rendered.
//
// This file only holds shared TYPES. See the sibling files for the actual
// authored data: users.ts, weather.ts, traffic.ts, reasons.ts, journeys.ts,
// dashboardSnapshots.ts, recommendationHistory.ts, liveJourneys.ts.

import { ConfidenceLevel, RouteKind, TravelMode } from "@/lib/types";

export type DemoJourneyStatus = "in_progress" | "completed" | "planned";

export interface DemoUserProfile {
  id: string;
  name: string;
  preferredMode: TravelMode;
  preferredModeLabel: string;
  /** Maps to the app's routePriority slider (fastest <-> safer). */
  routePreference: RouteKind;
  maxWalkingMinutes: number;
}

export type WeatherCondition = "Clear" | "Cloudy" | "Light Rain" | "Heavy Rain" | "Hazy";
export type ImpactLevel = "Low" | "Medium" | "High";

export interface WeatherPreset {
  id: string;
  condition: WeatherCondition;
  tempC: number;
  humidityPct: number;
  windKph: number;
  rainProbabilityPct: number;
  impact: ImpactLevel;
}

export type TrafficLevelName = "Very Low" | "Low" | "Low-Moderate" | "Moderate" | "High" | "Very High";

export interface TrafficPreset {
  id: string;
  level: TrafficLevelName;
  avgSpeedKph: number;
  delayMinutes: number;
}

export type QualScale4 = "Poor" | "Fair" | "Good" | "Excellent";
export type QualScale3 = "Poor" | "Fair" | "Good";
export type LevelScale3 = "Low" | "Moderate" | "High";

/** Contextual demo indicators — NOT crime statistics. */
export interface DemoContextIndicators {
  publicActivity: LevelScale3;
  nearbyOpenPlaces: number;
  transportAvailability: QualScale4;
  walkingExposure: LevelScale3;
  wellLitSegments: QualScale3;
  routeCondition: QualScale3;
  dataConfidence: "Low" | "Medium" | "High";
}

export interface DemoRoute {
  id: string;
  journeyId: string;
  kind: RouteKind;
  name: string;
  distanceKm: number;
  durationMinutes: number;
  walkingMinutes: number;
  trafficLevel: TrafficLevelName;
  transportAvailability: QualScale4;
  publicActivity: LevelScale3;
  weatherImpact: ImpactLevel;
  routeCondition: QualScale3;
  contextualSafetyScore: number;
  confidence: ConfidenceLevel;
  reasons: string[];
  context: DemoContextIndicators;
}

export interface DemoCheckIn {
  time: string;
  label: string;
  note: string;
}

export interface DemoJourney {
  journeyId: string;
  userId: string;
  origin: string;
  destination: string;
  date: string;
  startTime: string;
  estimatedDurationMinutes: number;
  actualDurationMinutes: number | null;
  distanceKm: number;
  mode: TravelMode;
  modeLabel: string;
  status: DemoJourneyStatus;
  statusLabel: string;
  contextualSafetyScore: number;
  confidence: ConfidenceLevel;
  weather: WeatherPreset;
  traffic: TrafficPreset;
  walkingMinutes: number;
  checkIns: DemoCheckIn[];
  recommendation: RouteKind;
  reasons: string[];
  routes: DemoRoute[];
  isDemoData: true;
}

export interface DashboardSnapshot {
  id: string;
  capturedAt: string;
  overallContextScore: number;
  weatherScore: number;
  transportScore: number;
  activityScore: number;
  walkingExposureScore: number;
  trafficScore: number;
  confidence: ConfidenceLevel;
  isDemoData: true;
}

export interface RecommendationHistoryEntry {
  id: string;
  journeyId: string;
  origin: string;
  destination: string;
  date: string;
  recommendedKind: RouteKind;
  score: number;
  confidence: ConfidenceLevel;
  reasons: string[];
  isDemoData: true;
}

export interface LiveJourneyExample {
  id: string;
  journeyId: string;
  label: string;
  origin: string;
  destination: string;
  progressPct: number;
  remainingDistanceKm: number;
  remainingMinutes: number;
  currentTraffic: TrafficLevelName;
  currentWeather: WeatherCondition;
  currentActivity: LevelScale3;
  lastCheckIn: string;
  nextCheckInReminder: string;
  checkIns: DemoCheckIn[];
  isDemoData: true;
}
