"use client";

import { useEffect, useState } from "react";
import { ContextSnapshot } from "@/lib/types";
import { getContext } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { ImpactBadge } from "@/components/ui/Badge";
import { Disclaimer, DemoBadge } from "@/components/ui/Disclaimer";
import { Button } from "@/components/ui/Button";

const ICONS: Record<string, string> = {
  weather: "🌤️",
  traffic: "🚦",
  publicActivity: "🚶‍♀️",
  transportAvailability: "🚉",
};

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<ContextSnapshot | null | undefined>(undefined);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch
    setSnapshot(undefined);
    getContext()
      .then(setSnapshot)
      .catch(() => setSnapshot(null));
  }, [seed]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Safety Dashboard</h1>
          <p className="mt-1 text-sm text-muted">A general read on current context signals near you.</p>
        </div>
        <DemoBadge />
      </div>

      {snapshot === undefined && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <GlassCard key={i} className="h-28 animate-pulse" />
          ))}
        </div>
      )}

      {snapshot === null && (
        <GlassCard className="text-center text-sm text-danger">
          Couldn&apos;t load context signals.
          <div className="mt-3">
            <Button size="sm" onClick={() => setSeed((s) => s + 1)}>
              Retry
            </Button>
          </div>
        </GlassCard>
      )}

      {snapshot && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <IndicatorCard icon={ICONS.weather} title="Weather" value={snapshot.weather.condition} sub={`${snapshot.weather.tempC}°C`} impact={snapshot.weather.impact} />
            <IndicatorCard icon={ICONS.traffic} title="Traffic" value={snapshot.traffic.level} impact={snapshot.traffic.impact} />
            <IndicatorCard icon={ICONS.publicActivity} title="Public activity" value={snapshot.publicActivity.level} impact={snapshot.publicActivity.impact} />
            <IndicatorCard
              icon={ICONS.transportAvailability}
              title="Transport availability"
              value={snapshot.transportAvailability.level}
              impact={snapshot.transportAvailability.impact}
            />
          </div>

          <GlassCard className="mt-4">
            <h2 className="mb-2 text-sm font-semibold">Demo trend (last 6 hours)</h2>
            <div className="flex h-20 items-end gap-1.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm brand-gradient-bg opacity-70"
                  style={{ height: `${20 + ((i * 37) % 60)}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">Illustrative demo trend, not derived from real historical incidents.</p>
          </GlassCard>

          <Disclaimer className="mt-4">
            These indicators are generated demo signals meant to illustrate how context-aware
            recommendations work. They do not represent verified real-time or historical crime
            data, and no route or area should be treated as objectively &quot;safe&quot; or &quot;unsafe&quot; based
            on them.
          </Disclaimer>
        </>
      )}
    </div>
  );
}

function IndicatorCard({
  icon,
  title,
  value,
  sub,
  impact,
}: {
  icon: string;
  title: string;
  value: string;
  sub?: string;
  impact: "positive" | "negative" | "neutral";
}) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 text-2xl">{icon}</div>
          <p className="text-sm font-semibold capitalize">{title}</p>
          <p className="text-xs text-muted capitalize">
            {value} {sub && `· ${sub}`}
          </p>
        </div>
        <ImpactBadge impact={impact} />
      </div>
    </GlassCard>
  );
}
