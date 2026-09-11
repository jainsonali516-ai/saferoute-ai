import { RouteOption } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";
import { Badge, ConfidenceBadge } from "@/components/ui/Badge";
import { formatMinutes } from "@/lib/utils";

const KIND_META: Record<RouteOption["kind"], { label: string; icon: string; tone: "brand" | "positive" | "neutral" }> = {
  fastest: { label: "Fastest", icon: "⚡", tone: "neutral" },
  safer: { label: "Safer", icon: "🛡️", tone: "positive" },
  balanced: { label: "Balanced", icon: "⚖️", tone: "brand" },
};

export function RouteCard({ route, queryString }: { route: RouteOption; queryString: string }) {
  const meta = KIND_META[route.kind];
  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Badge tone={meta.tone}>
          {meta.icon} {meta.label}
        </Badge>
        <ConfidenceBadge level={route.confidence} />
      </div>

      <div>
        <p className="text-2xl font-bold">{formatMinutes(route.etaMinutes)}</p>
        <p className="text-sm text-muted">{route.distanceKm} km · estimated context score {route.estimatedContextScore}/100</p>
      </div>

      <ul className="space-y-1.5">
        {route.explanations.slice(0, 2).map((reason) => (
          <li key={reason} className="flex items-start gap-1.5 text-xs text-muted">
            <span className="mt-0.5 text-brand-pink">✓</span>
            {reason}
          </li>
        ))}
      </ul>

      <LinkButton href={`/route/${route.id}?${queryString}`} variant={route.kind === "safer" ? "primary" : "secondary"} fullWidth>
        View Details
      </LinkButton>
    </GlassCard>
  );
}
