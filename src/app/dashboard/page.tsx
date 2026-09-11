"use client";

import { useEffect, useState } from "react";
import { ContextSnapshot } from "@/lib/types";
import { getContext } from "@/lib/api/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge, ConfidenceBadge, ImpactBadge } from "@/components/ui/Badge";
import { Disclaimer, DemoBadge } from "@/components/ui/Disclaimer";
import { Button } from "@/components/ui/Button";
import { DASHBOARD_SCORE_DISCLAIMER, DASHBOARD_SNAPSHOTS, DEMO_JOURNEYS } from "@/lib/demoData";
import { formatMinutes } from "@/lib/utils";

const STATUS_TONE: Record<string, "positive" | "brand" | "neutral"> = {
  in_progress: "brand",
  completed: "positive",
  planned: "neutral",
};

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
            <h2 className="mb-2 text-sm font-semibold">Context score trend (last 10 snapshots)</h2>
            <div className="flex h-20 items-end gap-1.5">
              {DASHBOARD_SNAPSHOTS.slice()
                .reverse()
                .map((s) => (
                  <div
                    key={s.id}
                    title={`${s.overallContextScore}/100 · ${s.confidence} confidence`}
                    className="flex-1 rounded-t-sm brand-gradient-bg opacity-70"
                    style={{ height: `${s.overallContextScore}%` }}
                  />
                ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">{DASHBOARD_SCORE_DISCLAIMER}</p>
          </GlassCard>

          <GlassCard className="mt-4">
            <h2 className="mb-1 text-sm font-semibold">Recent snapshot detail</h2>
            <p className="mb-3 text-xs text-muted">Simulated per-signal scores behind the trend above.</p>
            <div className="scrollbar-thin -mx-1 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="text-muted">
                    <th className="px-1 py-1.5 font-medium">Captured</th>
                    <th className="px-1 py-1.5 font-medium">Overall</th>
                    <th className="px-1 py-1.5 font-medium">Weather</th>
                    <th className="px-1 py-1.5 font-medium">Transport</th>
                    <th className="px-1 py-1.5 font-medium">Activity</th>
                    <th className="px-1 py-1.5 font-medium">Walking</th>
                    <th className="px-1 py-1.5 font-medium">Traffic</th>
                    <th className="px-1 py-1.5 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {DASHBOARD_SNAPSHOTS.map((s) => (
                    <tr key={s.id} className="border-t border-white/5">
                      <td className="px-1 py-1.5 text-muted">
                        {new Date(s.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-1 py-1.5 font-semibold">{s.overallContextScore}</td>
                      <td className="px-1 py-1.5">{s.weatherScore}</td>
                      <td className="px-1 py-1.5">{s.transportScore}</td>
                      <td className="px-1 py-1.5">{s.activityScore}</td>
                      <td className="px-1 py-1.5">{s.walkingExposureScore}</td>
                      <td className="px-1 py-1.5">{s.trafficScore}</td>
                      <td className="px-1 py-1.5 capitalize text-muted">{s.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <Disclaimer className="mt-4">
            These indicators are generated demo signals meant to illustrate how context-aware
            recommendations work. They do not represent verified real-time or historical crime
            data, and no route or area should be treated as objectively &quot;safe&quot; or &quot;unsafe&quot; based
            on them.
          </Disclaimer>

          <div className="mt-8 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Recent journeys &amp; AI recommendations</h2>
            <DemoBadge />
          </div>
          <p className="mt-1 text-xs text-muted">
            Simulated journey history for the demo account — each shows the route the AI
            recommended and why.
          </p>

          <div className="mt-3 space-y-3">
            {DEMO_JOURNEYS.map((j) => (
              <GlassCard key={j.journeyId}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {j.origin} → {j.destination}
                    </p>
                    <p className="text-xs text-muted">
                      {j.date} · {j.startTime} · {j.modeLabel} · {formatMinutes(j.estimatedDurationMinutes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={STATUS_TONE[j.status]}>{j.statusLabel}</Badge>
                    <ConfidenceBadge level={j.confidence} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-foreground">
                    Recommended: <span className="capitalize">{j.recommendation}</span>
                  </span>
                  <span>· score {j.contextualSafetyScore}/100</span>
                </div>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {j.reasons.map((r) => (
                    <li key={r} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted">
                      {r}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
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
