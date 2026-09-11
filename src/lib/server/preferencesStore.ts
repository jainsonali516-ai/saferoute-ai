import { UserPreferences } from "@/lib/types";

/**
 * DEMO MODE in-memory preferences store, keyed by userId.
 * REAL INTEGRATION: swap for a `UserPreference` table (see prisma/schema.prisma).
 */
const DEFAULT_PREFERENCES: UserPreferences = {
  preferredModes: ["walking", "public_transport"],
  walkingTolerance: "medium",
  routePriority: 60,
  wheelchairAccessible: false,
  avoidStairs: false,
  avoidPoorlyLit: true,
};

const store = new Map<string, UserPreferences>();

export function getPreferences(userId: string): UserPreferences {
  return store.get(userId) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(userId: string, prefs: UserPreferences): UserPreferences {
  store.set(userId, prefs);
  return prefs;
}
