import { ImpactDirection } from "@/lib/types";
import { pick, seededRandom } from "@/lib/utils";

export interface TrafficSnapshot {
  level: "light" | "moderate" | "heavy";
  impact: ImpactDirection;
}

export interface TrafficProvider {
  getSnapshot(seed: number): Promise<TrafficSnapshot>;
}

const LEVELS = ["light", "moderate", "heavy"] as const;

/**
 * REAL INTEGRATION: swap for Google/HERE/TomTom traffic API using
 * TRAFFIC_API_KEY (see .env.example). Keep the same TrafficSnapshot shape.
 */
export class MockTrafficProvider implements TrafficProvider {
  async getSnapshot(seed: number): Promise<TrafficSnapshot> {
    const rand = seededRandom(seed);
    const level = pick(rand, LEVELS);
    return {
      level,
      impact: level === "light" ? "positive" : level === "moderate" ? "neutral" : "negative",
    };
  }
}

export const trafficProvider: TrafficProvider = new MockTrafficProvider();
