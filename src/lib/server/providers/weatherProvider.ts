import { ImpactDirection } from "@/lib/types";
import { pick, seededRandom } from "@/lib/utils";

export interface WeatherSnapshot {
  condition: "clear" | "rain" | "fog" | "storm";
  tempC: number;
  impact: ImpactDirection;
}

export interface WeatherProvider {
  getSnapshot(seed: number): Promise<WeatherSnapshot>;
}

const CONDITIONS = ["clear", "rain", "fog", "storm"] as const;

/**
 * REAL INTEGRATION: swap for a client calling OpenWeatherMap / a national
 * weather API using WEATHER_API_KEY (see .env.example). Keep the same
 * WeatherSnapshot shape so nothing above this layer needs to change.
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
