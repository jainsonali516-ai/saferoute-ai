import { UserPreferences } from "@/lib/types";
import { DemoUserProfile } from "./types";

/** DEMO DATA — 5 fictional demo profiles. None of these are real people. */
export const DEMO_USERS: DemoUserProfile[] = [
  {
    id: "user-1",
    name: "Aanya Sharma",
    preferredMode: "public_transport",
    preferredModeLabel: "Public Transport",
    routePreference: "balanced",
    maxWalkingMinutes: 10,
  },
  {
    id: "user-2",
    name: "Riya Mehta",
    preferredMode: "driving",
    preferredModeLabel: "Driving",
    routePreference: "safer",
    maxWalkingMinutes: 5,
  },
  {
    id: "user-3",
    name: "Kavya Singh",
    preferredMode: "walking",
    preferredModeLabel: "Walking",
    routePreference: "balanced",
    maxWalkingMinutes: 15,
  },
  {
    id: "user-4",
    name: "Ananya Verma",
    preferredMode: "public_transport",
    preferredModeLabel: "Public Transport",
    routePreference: "fastest",
    maxWalkingMinutes: 8,
  },
  {
    id: "user-5",
    name: "Meera Kapoor",
    preferredMode: "rideshare",
    preferredModeLabel: "Cab",
    routePreference: "safer",
    maxWalkingMinutes: 5,
  },
];

/** The default demo account used throughout the app when no other profile is picked. */
export const DEFAULT_DEMO_USER = DEMO_USERS[0];

/** Maps a demo profile onto the app's real UserPreferences shape (used by the backend default and the Preferences page's profile switcher). */
export function toUserPreferences(profile: DemoUserProfile): UserPreferences {
  const routePriority: Record<DemoUserProfile["routePreference"], number> = {
    fastest: 20,
    balanced: 55,
    safer: 85,
  };
  const walkingTolerance: UserPreferences["walkingTolerance"] =
    profile.maxWalkingMinutes <= 6 ? "low" : profile.maxWalkingMinutes <= 11 ? "medium" : "high";

  return {
    preferredModes: [profile.preferredMode],
    walkingTolerance,
    routePriority: routePriority[profile.routePreference],
    wheelchairAccessible: false,
    avoidStairs: false,
    avoidPoorlyLit: true,
  };
}
