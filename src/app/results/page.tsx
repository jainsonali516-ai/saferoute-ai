"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RouteOption } from "@/lib/types";
import { compareRoutes } from "@/lib/api/client";
import { journeyRequestFromParams } from "@/lib/journeyParams";
import { RouteCard } from "@/components/results/RouteCard";
import { LinkButton } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoBadge, Disclaimer } from "@/components/ui/Disclaimer";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = journeyRequestFromParams(searchParams);
  const queryString = searchParams.toString();

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state before refetch
    setRoutes(null);
    setError(null);

    compareRoutes(request)
      .then((result) => {
        if (!cancelled) setRoutes([result.fastest, result.safer, result.balanced]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't generate route comparisons. Please try again.");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  if (!request) {
    return (
      <EmptyState
        title="No journey to compare yet"
        body="Head back to the planner and enter a starting point and destination."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Compare your routes</h1>
          <p className="mt-1 text-sm text-muted">
            {request.origin} → {request.destination}
          </p>
        </div>
        <DemoBadge />
      </div>

      {error && (
        <GlassCard className="mb-6 border-danger/30 text-sm text-danger">
          {error}{" "}
          <button className="ml-2 underline" onClick={() => setRoutes(null)}>
            Retry
          </button>
        </GlassCard>
      )}

      {!error && !routes && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <GlassCard key={i} className="h-56 animate-pulse">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="mt-4 h-8 w-28 rounded bg-white/10" />
              <div className="mt-3 h-3 w-full rounded bg-white/5" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/5" />
            </GlassCard>
          ))}
        </div>
      )}

      {routes && routes.length === 0 && (
        <EmptyState title="No routes found" body="Try a different origin or destination." />
      )}

      {routes && routes.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} queryString={queryString} />
            ))}
          </div>
          <Disclaimer className="mt-6">
            Estimated context scores are demo AI signals only — never treat any route as
            guaranteed safe. Always stay aware of your surroundings.
          </Disclaimer>
        </>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
      <p className="text-3xl">🧭</p>
      <h1 className="mt-3 text-lg font-semibold">{title}</h1>
      <p className="mt-1.5 text-sm text-muted">{body}</p>
      <LinkButton href="/plan" className="mt-5">
        Plan a Journey
      </LinkButton>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  );
}
