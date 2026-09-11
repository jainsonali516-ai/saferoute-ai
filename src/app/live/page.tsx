"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { Disclaimer, DemoBadge } from "@/components/ui/Disclaimer";
import { TrustedContact, Journey } from "@/lib/types";
import { getContacts, startJourney, getJourney, checkIn, completeJourney } from "@/lib/api/client";
import { formatMinutes } from "@/lib/utils";

const CHECK_IN_INTERVAL_SECONDS = 45; // shortened for demo purposes
const POLL_INTERVAL_MS = 4000;

function LiveJourneyContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") ?? "Your start point";
  const destination = searchParams.get("destination") ?? "Your destination";
  const mode = (searchParams.get("mode") as Journey["mode"]) ?? "walking";
  const routeId = searchParams.get("routeId") ?? "balanced-demo";
  const routeKind: Journey["routeKind"] = routeId.startsWith("fastest")
    ? "fastest"
    : routeId.startsWith("safer")
      ? "safer"
      : "balanced";
  const etaMinutes = Number(searchParams.get("eta") ?? 18) || 18;

  const journeyId = useMemo(() => crypto.randomUUID(), []);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[] | null>(null);
  const [checkInDue, setCheckInDue] = useState(false);
  const [checkInBusy, setCheckInBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    getContacts().then(setContacts).catch(() => setContacts([]));
  }, []);

  // Start the journey on the backend once (Journey lifecycle: start -> check-in* -> complete).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startJourney(journeyId, { origin, destination, mode, routeId, routeKind, etaMinutes })
      .then(setJourney)
      .catch((err) => setStartError(err instanceof Error ? err.message : "Couldn't start journey tracking."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId]);

  // Poll journey status so an "overdue" transition computed server-side reaches the UI.
  useEffect(() => {
    if (!journey || completed) return;
    const id = setInterval(() => {
      getJourney(journeyId)
        .then(setJourney)
        .catch(() => {
          /* transient poll failure — keep last known state, don't crash the UI */
        });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [journey, journeyId, completed]);

  useEffect(() => {
    if (paused || completed) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused, completed]);

  useEffect(() => {
    if (elapsedSeconds > 0 && elapsedSeconds % CHECK_IN_INTERVAL_SECONDS === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven check-in prompt
      setCheckInDue(true);
    }
  }, [elapsedSeconds]);

  const TOTAL_SIMULATED_SECONDS = Math.max(30, etaMinutes * 6);
  const progress = Math.min(100, (elapsedSeconds / TOTAL_SIMULATED_SECONDS) * 100);
  const remainingMinutes = Math.max(0, Math.round(etaMinutes * (1 - progress / 100)));

  useEffect(() => {
    if (progress >= 100 && journey && !completed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- progress crossing 100% is a one-time transition, not a render loop
      setCompleted(true);
      completeJourney(journeyId)
        .then(setJourney)
        .catch(() => {
          /* completion is best-effort for the demo; UI still shows "arrived" */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, journey, completed]);

  const primaryContact = useMemo(() => contacts?.[0], [contacts]);

  async function handleCheckIn() {
    setCheckInBusy(true);
    try {
      const updated = await checkIn(journeyId);
      setJourney(updated);
    } catch {
      /* still clear the local prompt so the UI stays usable if the API is unreachable */
    } finally {
      setCheckInDue(false);
      setCheckInBusy(false);
    }
  }

  const isOverdue = journey?.status === "overdue";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Live Journey</h1>
        <DemoBadge />
      </div>
      <p className="mt-1 text-sm text-muted">
        {origin} → {destination}
      </p>

      {startError && (
        <Disclaimer className="mt-4 border-warning/30 bg-warning/[0.06]">
          {startError} — continuing with local simulation only.
        </Disclaimer>
      )}

      <GlassCard className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {completed ? "Arrived (simulated)" : "Progress (simulated)"}
          </span>
          <span className="text-sm text-muted">
            {completed ? "0 min left" : `${formatMinutes(remainingMinutes)} left`}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full brand-gradient-bg transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPaused((p) => !p)} disabled={completed}>
            {paused ? "Resume simulation" : "Pause simulation"}
          </Button>
        </div>
      </GlassCard>

      {isOverdue && !completed && (
        <GlassCard className="mt-4 border-danger/40 bg-danger/[0.06]">
          <p className="text-sm font-semibold text-danger">⏰ Your expected arrival time has passed. Are you okay?</p>
          <p className="mt-1 text-xs text-muted">
            This is only a prompt based on the journey&apos;s expected arrival time — no one has been
            automatically notified.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleCheckIn} disabled={checkInBusy}>
              {checkInBusy ? "Checking in…" : "I'm safe"}
            </Button>
            <LinkButton size="sm" variant="danger" href="/emergency">
              I need help
            </LinkButton>
          </div>
        </GlassCard>
      )}

      {checkInDue && !isOverdue && !completed && (
        <GlassCard className="mt-4 border-warning/40 bg-warning/[0.06]">
          <p className="text-sm font-semibold">⏰ Safety check-in</p>
          <p className="mt-1 text-xs text-muted">Are you still doing okay on your journey?</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleCheckIn} disabled={checkInBusy}>
              {checkInBusy ? "Checking in…" : "I'm safe"}
            </Button>
            <LinkButton size="sm" variant="danger" href="/emergency">
              I need help
            </LinkButton>
          </div>
        </GlassCard>
      )}

      {completed && (
        <GlassCard className="mt-4 border-success/40 bg-success/[0.06] text-center">
          <p className="text-sm font-semibold text-success">✓ Journey marked complete</p>
          <p className="mt-1 text-xs text-muted">Glad you made it. This demo journey has ended.</p>
        </GlassCard>
      )}

      <GlassCard className="mt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Share live trip</p>
            <p className="text-xs text-muted">
              {primaryContact ? `Share status updates with ${primaryContact.name}` : "Add a trusted contact to enable sharing"}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={sharing}
            disabled={!primaryContact}
            onClick={() => setSharing((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring disabled:opacity-40 ${sharing ? "brand-gradient-bg" : "bg-white/12"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${sharing ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {sharing && (
          <p className="mt-3 text-xs text-success">
            Demo only — {primaryContact?.name} would receive periodic status updates, not your precise live location history.
          </p>
        )}
      </GlassCard>

      {journey && journey.checkIns.length > 0 && (
        <GlassCard className="mt-4">
          <p className="mb-2 text-sm font-semibold">Check-in history</p>
          <ul className="space-y-1 text-xs text-muted">
            {journey.checkIns.map((c) => (
              <li key={c.id}>✓ Checked in at {new Date(c.createdAt).toLocaleTimeString()}</li>
            ))}
          </ul>
        </GlassCard>
      )}

      <Disclaimer className="mt-4">
        Demo / Simulated Data — this journey&apos;s progress and timing are compressed for the demo.
        No real location tracking, dispatch or notification is happening.
      </Disclaimer>

      <LinkButton href="/emergency" variant="emergency" fullWidth size="lg" className="mt-6">
        🚨 Emergency Help
      </LinkButton>
    </div>
  );
}

export default function LiveJourneyPage() {
  return (
    <Suspense fallback={null}>
      <LiveJourneyContent />
    </Suspense>
  );
}
