import { ImpactDirection } from "@/lib/types";
import { pick, seededRandom } from "@/lib/utils";

export interface TransportSnapshot {
  level: "low" | "moderate" | "high";
  impact: ImpactDirection;
}

export interface TransportProvider {
  getSnapshot(seed: number): Promise<TransportSnapshot>;
}

const LEVELS = ["low", "moderate", "high"] as const;

/**
 * REAL INTEGRATION: swap for a transit agency's GTFS-realtime feed or a
 * rideshare availability API. Keep the same TransportSnapshot shape.
 */
export class MockTransportProvider implements TransportProvider {
  async getSnapshot(seed: number): Promise<TransportSnapshot> {
    const rand = seededRandom(seed);
    const level = pick(rand, LEVELS);
    return { level, impact: level === "high" ? "positive" : level === "moderate" ? "neutral" : "negative" };
  }
}

export const transportProvider: TransportProvider = new MockTransportProvider();
