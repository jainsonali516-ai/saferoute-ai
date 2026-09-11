import { RouteSegment } from "@/lib/types";

const LEVEL_COLOR: Record<string, string> = {
  low: "#ff5470",
  moderate: "#fbbf24",
  high: "#34d399",
};

/**
 * Stylized, non-geographic route visualization for the demo (no real map tiles/keys).
 * REAL INTEGRATION: replace with an actual map (Mapbox GL / Google Maps) rendering the
 * true route geometry returned by the Directions API.
 */
export function RouteMapVisual({ segments }: { segments: RouteSegment[] }) {
  const width = 100;
  const step = width / (segments.length + 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <svg viewBox={`0 0 ${width} 26`} className="h-24 w-full sm:h-28" preserveAspectRatio="none">
        <line x1={step} y1={13} x2={width - step} y2={13} stroke="rgba(255,255,255,0.15)" strokeWidth={1.2} />
        {segments.map((seg, i) => {
          const x = step * (i + 1);
          return (
            <g key={seg.id}>
              <circle cx={x} cy={13} r={2.4} fill={LEVEL_COLOR[seg.activityLevel]} />
            </g>
          );
        })}
        <circle cx={step} cy={13} r={2.8} fill="#ff4d9d" />
        <circle cx={width - step} cy={13} r={2.8} fill="#b83bff" />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>Start</span>
        <span>Destination</span>
      </div>
    </div>
  );
}
