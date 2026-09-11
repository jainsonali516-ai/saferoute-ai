"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { RouteOption } from "@/lib/types";
import { compareRoutes } from "@/lib/api/client";
import { journeyRequestFromParams } from "@/lib/journeyParams";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";
import { Badge, ImpactBadge } from "@/components/ui/Badge";
import { UncertaintyMeter } from "@/components/ui/UncertaintyMeter";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { RouteMapVisual } from "@/components/route/RouteMapVisual";
import { formatMinutes } from "@/lib/utils";

function RouteDetailsContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [route, setRoute] = useState<RouteOption | null | undefined>(undefined);

  const request = journeyRequestFromParams(searchParams);
  const queryString = searchParams.toString();

  useEffect(() => {
    if (!request) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch
    setRoute(undefined);
    compareRoutes(request)
      .then((result) => {
        const match = [result.fastest, result.safer, result.balanced].find((r) => r.id === params.id);
        setRoute(match ?? null);
      })
      .catch(() => setRoute(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, queryString]);

  if (!request) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-3xl">🧭</p>
        <h1 className="mt-3 text-lg font-semibold">Missing journey context</h1>
        <p className="mt-1.5 text-sm text-muted">Plan a journey first to view route details.</p>
        <LinkButton href="/plan" className="mt-5">
          Plan a Journey
        </LinkButton>
      </div>
    );
  }

  if (route === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <GlassCard className="h-72 animate-pulse" />
      </div>
    );
  }

  if (route === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-3xl">⚠️</p>
        <h1 className="mt-3 text-lg font-semibold">Route not found</h1>
        <p className="mt-1.5 text-sm text-muted">This route link looks invalid or expired.</p>
        <LinkButton href="/plan" className="mt-5">
          Plan a Journey
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">
            {request.origin} → {request.destination}
          </p>
          <h1 className="mt-1 text-2xl font-bold capitalize sm:text-3xl">{route.kind} route</h1>
        </div>
        <Badge tone="brand">{formatMinutes(route.etaMinutes)}</Badge>
      </div>

      <div className="space-y-5">
        <RouteMapVisual segments={route.segments} />

        <GlassCard>
          <UncertaintyMeter score={route.estimatedContextScore} confidence={route.confidence} note={route.uncertaintyNote} />
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-sm font-semibold">Why this route?</h2>
          <ul className="space-y-2">
            {route.explanations.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-brand-pink">✦</span>
                {reason}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-sm font-semibold">Context factors</h2>
          <div className="space-y-3">
            {route.factors.map((factor) => (
              <div key={factor.key} className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{factor.label}</p>
                  <p className="text-xs text-muted">{factor.description}</p>
                </div>
                <ImpactBadge impact={factor.impact} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-sm font-semibold">Route segments</h2>
          <ol className="space-y-3">
            {route.segments.map((seg, i) => (
              <li key={seg.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{seg.name}</p>
                  <p className="text-xs text-muted">
                    {seg.distanceKm} km · activity: {seg.activityLevel} · lighting: {seg.lightingLevel}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>

        <Disclaimer>
          This is a demo estimate built from mock context signals, not real crime or incident
          data. It is not a guarantee of safety — use your own judgment.
        </Disclaimer>

        <div className="flex flex-col gap-3 sm:flex-row">
          <LinkButton href={`/live?${queryString}&routeId=${route.id}&eta=${route.etaMinutes}`} fullWidth size="lg">
            Start Live Journey
          </LinkButton>
          <LinkButton href={`/results?${queryString}`} variant="secondary" fullWidth size="lg">
            Compare other routes
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default function RouteDetailsPage() {
  return (
    <Suspense fallback={null}>
      <RouteDetailsContent />
    </Suspense>
  );
}
