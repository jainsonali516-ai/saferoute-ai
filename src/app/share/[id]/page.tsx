"use client";

import { use, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { getSharedJourney } from "@/lib/api/client";
import { SharedJourneyView } from "@/lib/types";

const POLL_INTERVAL_MS = 8000;

type LoadState = "loading" | "ready" | "not_found" | "error";

function statusTone(status: SharedJourneyView["status"]) {
  switch (status) {
    case "overdue":
      return "negative" as const;
    case "completed":
      return "positive" as const;
    case "cancelled":
      return "neutral" as const;
    default:
      return "brand" as const;
  }
}

function osmEmbedUrl(lat: number, lng: number) {
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat},${lng}`;
}

export default function SharedJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [journey, setJourney] = useState<SharedJourneyView | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    function poll() {
      getSharedJourney(id)
        .then((data) => {
          if (cancelled) return;
          setJourney(data);
          setLoadState("ready");
        })
        .catch((err) => {
          if (cancelled) return;
          setLoadState(err instanceof Error && err.message.includes("invalid") ? "not_found" : "error");
        });
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Live Trip</h1>
      <p className="mt-1 text-sm text-muted">Someone has shared this journey with you.</p>

      {loadState === "loading" && <GlassCard className="mt-6 h-40 animate-pulse" />}

      {loadState === "not_found" && (
        <GlassCard className="mt-6 text-center text-sm text-muted">
          This share link is invalid or the trip has ended.
        </GlassCard>
      )}

      {loadState === "error" && (
        <GlassCard className="mt-6 text-center text-sm text-danger">Couldn&apos;t load this trip right now.</GlassCard>
      )}

      {loadState === "ready" && journey && (
        <>
          <GlassCard className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {journey.origin} → {journey.destination}
              </p>
              <Badge tone={statusTone(journey.status)}>{journey.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              Started {new Date(journey.startedAt).toLocaleTimeString()} · Expected by{" "}
              {new Date(journey.expectedArrivalAt).toLocaleTimeString()}
            </p>
          </GlassCard>

          <GlassCard className="mt-4 overflow-hidden p-0">
            {journey.lastLocation ? (
              <>
                <iframe
                  title="Live location"
                  className="h-64 w-full border-0"
                  src={osmEmbedUrl(journey.lastLocation.lat, journey.lastLocation.lng)}
                />
                <p className="px-4 py-2.5 text-xs text-muted">
                  Last updated {new Date(journey.lastLocation.updatedAt).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <p className="p-5 text-center text-sm text-muted">
                Waiting for the traveler&apos;s device to share its location…
              </p>
            )}
          </GlassCard>

          <Disclaimer className="mt-4">
            This page refreshes automatically every few seconds. Location is only as accurate and
            recent as the traveler&apos;s device allows.
          </Disclaimer>

          <LinkButton href="/" variant="secondary" fullWidth size="lg" className="mt-6">
            Go to SafeRoute AI
          </LinkButton>
        </>
      )}
    </div>
  );
}
