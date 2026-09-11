import { ImpactDirection } from "@/lib/types";
import { pick, seededRandom } from "@/lib/utils";

export interface ActivitySnapshot {
  level: "low" | "moderate" | "high";
  impact: ImpactDirection;
}

export interface ActivityProvider {
  getSnapshot(seed: number): Promise<ActivitySnapshot>;
}

const LEVELS = ["low", "moderate", "high"] as const;

/**
 * REAL INTEGRATION: swap for anonymized/aggregated mobility or footfall
 * signals. Must stay aggregated — never precise individual location history.
 * Keep the same ActivitySnapshot shape.
 */
export class MockActivityProvider implements ActivityProvider {
  async getSnapshot(seed: number): Promise<ActivitySnapshot> {
    const rand = seededRandom(seed);
    const level = pick(rand, LEVELS);
    return { level, impact: level === "low" ? "negative" : "positive" };
  }
}

export const activityProvider: ActivityProvider = new MockActivityProvider();
