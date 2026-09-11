import { ConfidenceLevel } from "@/lib/types";
import { ConfidenceBadge } from "@/components/ui/Badge";

/**
 * Renders an "estimated context score" deliberately alongside its confidence
 * band and an uncertainty note — never as a bare number implying certainty.
 */
export function UncertaintyMeter({
  score,
  confidence,
  note,
}: {
  score: number;
  confidence: ConfidenceLevel;
  note?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">Estimated context score</span>
        <ConfidenceBadge level={confidence} />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full brand-gradient-bg transition-all"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {score}/100 · estimate only, not a guarantee{note ? ` — ${note}` : ""}
      </p>
    </div>
  );
}
