import { PrivacySettings } from "@/lib/types";

/**
 * DEMO MODE in-memory privacy settings store, keyed by userId.
 * REAL INTEGRATION: swap for a `PrivacySetting` table (see prisma/schema.prisma).
 */
const DEFAULT_SETTINGS: PrivacySettings = {
  locationSharing: false,
  saveJourneyHistory: false,
  shareWithTrustedContact: false,
  analyticsConsent: false,
};

const store = new Map<string, PrivacySettings>();

export function getPrivacySettings(userId: string): PrivacySettings {
  return store.get(userId) ?? DEFAULT_SETTINGS;
}

export function savePrivacySettings(userId: string, settings: PrivacySettings): PrivacySettings {
  store.set(userId, settings);
  return settings;
}
