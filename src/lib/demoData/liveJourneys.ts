import { LiveJourneyExample } from "./types";
import { demoJourneyById } from "./journeys";

/**
 * DEMO DATA — 5 illustrative "live journey" progress snapshots. These are
 * independent simulated moments-in-time (for showing what an in-progress
 * journey looks like), not necessarily matching the static status of the
 * journey they reference in journeys.ts.
 */
const DEFS = [
  {
    id: "live-a",
    label: "Journey A",
    journeyId: "journey-1",
    progressPct: 62,
    remainingDistanceKm: 2.1,
    remainingMinutes: 8,
    currentTraffic: "Moderate" as const,
    currentWeather: "Clear" as const,
    currentActivity: "High" as const,
    lastCheckIn: "6:36 PM",
    nextCheckInReminder: "6:51 PM",
  },
  {
    id: "live-b",
    label: "Journey B",
    journeyId: "journey-3",
    progressPct: 38,
    remainingDistanceKm: 4.4,
    remainingMinutes: 13,
    currentTraffic: "Low-Moderate" as const,
    currentWeather: "Cloudy" as const,
    currentActivity: "Moderate" as const,
    lastCheckIn: "7:43 PM",
    nextCheckInReminder: "7:58 PM",
  },
  {
    id: "live-c",
    label: "Journey C",
    journeyId: "journey-5",
    progressPct: 76,
    remainingDistanceKm: 1.2,
    remainingMinutes: 5,
    currentTraffic: "Low" as const,
    currentWeather: "Hazy" as const,
    currentActivity: "High" as const,
    lastCheckIn: "6:58 PM",
    nextCheckInReminder: "7:10 PM",
  },
  {
    id: "live-d",
    label: "Journey D",
    journeyId: "journey-6",
    progressPct: 51,
    remainingDistanceKm: 3.0,
    remainingMinutes: 10,
    currentTraffic: "Moderate" as const,
    currentWeather: "Clear" as const,
    currentActivity: "Moderate" as const,
    lastCheckIn: "9:31 PM",
    nextCheckInReminder: "9:46 PM",
  },
  {
    id: "live-e",
    label: "Journey E",
    journeyId: "journey-9",
    progressPct: 88,
    remainingDistanceKm: 0.7,
    remainingMinutes: 3,
    currentTraffic: "Very Low" as const,
    currentWeather: "Light Rain" as const,
    currentActivity: "Moderate" as const,
    lastCheckIn: "11:22 AM",
    nextCheckInReminder: "11:34 AM",
  },
];

export const LIVE_JOURNEY_EXAMPLES: LiveJourneyExample[] = DEFS.map((d) => {
  const journey = demoJourneyById(d.journeyId);
  return {
    ...d,
    origin: journey?.origin ?? "Unknown origin",
    destination: journey?.destination ?? "Unknown destination",
    checkIns: journey?.checkIns ?? [],
    isDemoData: true,
  };
});
