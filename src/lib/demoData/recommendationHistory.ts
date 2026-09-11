import { RecommendationHistoryEntry } from "./types";
import { DEMO_JOURNEYS } from "./journeys";

/**
 * DEMO DATA — AI recommendation history, derived directly from the 10 demo
 * journeys so the same demo journeys are reused everywhere in the app
 * instead of maintaining a second, disconnected list.
 */
export const RECOMMENDATION_HISTORY: RecommendationHistoryEntry[] = DEMO_JOURNEYS.map((j) => ({
  id: `rec-${j.journeyId}`,
  journeyId: j.journeyId,
  origin: j.origin,
  destination: j.destination,
  date: j.date,
  recommendedKind: j.recommendation,
  score: j.contextualSafetyScore,
  confidence: j.confidence,
  reasons: j.reasons,
  isDemoData: true,
}));
