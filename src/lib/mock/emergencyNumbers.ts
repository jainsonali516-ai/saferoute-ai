import { EmergencyNumber } from "@/lib/types";

/**
 * DEMO DATA — official emergency numbers for India.
 * These are publicly known, official numbers (not fabricated), shown for quick
 * access only. Availability varies by location/service — see disclaimer in UI.
 */
export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    id: "emergency-112",
    name: "Emergency",
    number: "112",
    description: "Integrated Emergency Services",
    icon: "siren",
  },
  {
    id: "women-helpline-181",
    name: "Women Helpline",
    number: "181",
    description: "Women Helpline",
    icon: "heart",
  },
  {
    id: "police-100",
    name: "Police",
    number: "100",
    description: "Police Emergency",
    icon: "shield",
  },
  {
    id: "ambulance-102",
    name: "Ambulance",
    number: "102",
    description: "Ambulance Service",
    icon: "phone",
  },
  {
    id: "fire-101",
    name: "Fire",
    number: "101",
    description: "Fire & Rescue",
    icon: "flame",
  },
];
