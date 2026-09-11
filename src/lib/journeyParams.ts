import { JourneyRequest, TravelMode } from "@/lib/types";

export function journeyRequestFromParams(params: URLSearchParams): JourneyRequest | null {
  const origin = params.get("origin");
  const destination = params.get("destination");
  const mode = (params.get("mode") as TravelMode) || "walking";
  if (!origin || !destination) return null;

  return {
    origin,
    destination,
    mode,
    priorities: {
      safetyWeight: Number(params.get("safetyWeight") ?? 50),
      avoidPoorlyLit: params.get("avoidPoorlyLit") === "true",
      minimizeWalking: params.get("minimizeWalking") === "true",
      wheelchairAccessible: params.get("wheelchairAccessible") === "true",
    },
  };
}
