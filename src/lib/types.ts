// Shared domain types for SafeRoute AI.
// These model the *conceptual* AI recommendation pipeline described in the product spec.
// Real integrations (maps, ML risk model, weather, traffic, transit) should map their
// responses into these shapes so the UI never needs to change.

export type TravelMode = "walking" | "driving" | "public_transport" | "rideshare";

export type RouteKind = "fastest" | "safer" | "balanced";

export type ImpactDirection = "positive" | "negative" | "neutral";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface JourneyRequest {
  origin: string;
  destination: string;
  mode: TravelMode;
  departAt?: string; // ISO timestamp; defaults to "now" for the demo
  priorities?: RoutePriorities;
}

export interface RoutePriorities {
  /** 0 = prioritize speed, 100 = prioritize estimated safety */
  safetyWeight: number;
  avoidPoorlyLit: boolean;
  minimizeWalking: boolean;
  wheelchairAccessible: boolean;
}

/** A single named factor that fed into a route's context-aware scoring. */
export interface ContextFactor {
  key: string;
  label: string;
  impact: ImpactDirection;
  description: string;
  /** 0-100, presented as a relative signal strength, never as ground truth. */
  weight: number;
}

export interface RouteSegment {
  id: string;
  name: string;
  distanceKm: number;
  mode: TravelMode;
  description: string;
  activityLevel: "low" | "moderate" | "high";
  lightingLevel: "low" | "moderate" | "high";
}

export interface RouteOption {
  id: string;
  kind: RouteKind;
  mode: TravelMode;
  etaMinutes: number;
  distanceKm: number;
  /**
   * Estimated context score, 0-100. This is a MODEL ESTIMATE based on mock/demo
   * signals, not a guarantee and not a measurement of real crime or danger.
   * Always render alongside `confidence` and the uncertainty note.
   */
  estimatedContextScore: number;
  confidence: ConfidenceLevel;
  factors: ContextFactor[];
  segments: RouteSegment[];
  explanations: string[];
  uncertaintyNote: string;
  isDemoData: true;
}

export interface ContextSnapshot {
  weather: {
    condition: "clear" | "rain" | "fog" | "storm";
    tempC: number;
    impact: ImpactDirection;
    /** True when sourced from a real forecast API rather than the demo generator. */
    isReal?: boolean;
  };
  traffic: {
    level: "light" | "moderate" | "heavy";
    impact: ImpactDirection;
  };
  publicActivity: {
    level: "low" | "moderate" | "high";
    impact: ImpactDirection;
  };
  transportAvailability: {
    level: "low" | "moderate" | "high";
    impact: ImpactDirection;
  };
  generatedAt: string;
  isDemoData: true;
}

export type ContactRelationship = "Parent" | "Guardian" | "Friend" | "Relative" | "Other";

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: ContactRelationship;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContactInput {
  name: string;
  phoneNumber: string;
  relationship: ContactRelationship;
}

export interface EmergencyNumber {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: "siren" | "shield" | "heart" | "flame" | "phone";
}

export interface UserPreferences {
  preferredModes: TravelMode[];
  walkingTolerance: "low" | "medium" | "high";
  routePriority: number; // 0 (fastest) - 100 (safer)
  wheelchairAccessible: boolean;
  avoidStairs: boolean;
  avoidPoorlyLit: boolean;
}

export interface PrivacySettings {
  locationSharing: boolean;
  saveJourneyHistory: boolean;
  shareWithTrustedContact: boolean;
  analyticsConsent: boolean;
}

export type JourneyStatus = "active" | "overdue" | "completed" | "cancelled";

export interface JourneyCheckIn {
  id: string;
  createdAt: string;
  status: "ok";
}

export interface Journey {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  mode: TravelMode;
  routeId: string;
  routeKind: RouteKind;
  etaMinutes: number;
  startedAt: string;
  /** Compressed for demo purposes so "overdue" is reachable in a live demo — see journeyStore.ts. */
  expectedArrivalAt: string;
  status: JourneyStatus;
  shareWithContactId: string | null;
  checkIns: JourneyCheckIn[];
  completedAt: string | null;
  isDemoData: true;
}

/** Standard envelope every /api/* route returns. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
