/**
 * DEMO_MODE gates every provider in the Context Engine and the Recommendation
 * Engine onto mock data. It defaults to true so the app runs end-to-end with
 * zero external API keys, which is required for the hackathon demo.
 *
 * REAL INTEGRATION: once WEATHER_API_KEY / TRAFFIC_API_KEY / MAPS_API_KEY etc.
 * are configured (see .env.example), set DEMO_MODE=false and swap each
 * `Mock*Provider` in src/lib/server/providers/* for a real implementation of
 * the same interface — nothing above the provider layer needs to change.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}
