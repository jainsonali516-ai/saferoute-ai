import { WeatherPreset } from "./types";

/** DEMO DATA — simulated weather snapshots, not a live forecast feed. */
export const WEATHER_PRESETS: WeatherPreset[] = [
  { id: "clear", condition: "Clear", tempC: 27, humidityPct: 58, windKph: 9, rainProbabilityPct: 10, impact: "Low" },
  { id: "cloudy", condition: "Cloudy", tempC: 25, humidityPct: 67, windKph: 12, rainProbabilityPct: 25, impact: "Low" },
  { id: "light-rain", condition: "Light Rain", tempC: 23, humidityPct: 78, windKph: 15, rainProbabilityPct: 65, impact: "Medium" },
  { id: "heavy-rain", condition: "Heavy Rain", tempC: 21, humidityPct: 86, windKph: 20, rainProbabilityPct: 90, impact: "High" },
  { id: "hazy", condition: "Hazy", tempC: 29, humidityPct: 62, windKph: 8, rainProbabilityPct: 5, impact: "Medium" },
];

export function weatherPresetById(id: string): WeatherPreset {
  return WEATHER_PRESETS.find((w) => w.id === id) ?? WEATHER_PRESETS[0];
}
