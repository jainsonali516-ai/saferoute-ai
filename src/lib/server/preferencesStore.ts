import { UserPreferences } from "@/lib/types";
import { DEFAULT_DEMO_USER, toUserPreferences } from "@/lib/demoData/users";

/**
 * DEMO MODE in-memory preferences store, keyed by userId.
 * Defaults to the demo account's (Aanya Sharma) preferences so the whole app
 * uses the same demo user consistently until preferences are explicitly saved.
 * REAL INTEGRATION: swap for a `UserPreference` table (see prisma/schema.prisma).
 */
const DEFAULT_PREFERENCES: UserPreferences = toUserPreferences(DEFAULT_DEMO_USER);

const store = new Map<string, UserPreferences>();

export function getPreferences(userId: string): UserPreferences {
  return store.get(userId) ?? DEFAULT_PREFERENCES;
}

export function savePreferences(userId: string, prefs: UserPreferences): UserPreferences {
  store.set(userId, prefs);
  return prefs;
}
