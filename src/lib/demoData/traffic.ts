import { TrafficPreset } from "./types";

/** DEMO DATA — simulated traffic bands, not a live traffic feed. */
export const TRAFFIC_PRESETS: TrafficPreset[] = [
  { id: "very-low", level: "Very Low", avgSpeedKph: 48, delayMinutes: 0 },
  { id: "low", level: "Low", avgSpeedKph: 41, delayMinutes: 1 },
  { id: "low-moderate", level: "Low-Moderate", avgSpeedKph: 36, delayMinutes: 2 },
  { id: "moderate", level: "Moderate", avgSpeedKph: 31, delayMinutes: 4 },
  { id: "high", level: "High", avgSpeedKph: 22, delayMinutes: 8 },
  { id: "very-high", level: "Very High", avgSpeedKph: 14, delayMinutes: 14 },
];

export function trafficPresetById(id: string): TrafficPreset {
  return TRAFFIC_PRESETS.find((t) => t.id === id) ?? TRAFFIC_PRESETS[2];
}
