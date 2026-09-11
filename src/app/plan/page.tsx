"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { TravelMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const MODES: { value: TravelMode; label: string; icon: string }[] = [
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "public_transport", label: "Public transport", icon: "🚌" },
  { value: "rideshare", label: "Rideshare", icon: "🚕" },
  { value: "driving", label: "Driving", icon: "🚗" },
];

export default function PlannerPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<TravelMode>("walking");
  const [safetyWeight, setSafetyWeight] = useState(60);
  const [avoidPoorlyLit, setAvoidPoorlyLit] = useState(true);
  const [minimizeWalking, setMinimizeWalking] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setError("Enter both a starting point and a destination.");
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      mode,
      safetyWeight: String(safetyWeight),
      avoidPoorlyLit: String(avoidPoorlyLit),
      minimizeWalking: String(minimizeWalking),
      wheelchairAccessible: String(wheelchairAccessible),
    });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Plan a journey</h1>
      <p className="mt-1.5 text-sm text-muted">
        We&apos;ll compare Fastest, Safer and Balanced routes using demo context signals.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <GlassCard className="space-y-4">
          <Field label="Starting point">
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Koramangala 5th Block"
              className="input"
            />
          </Field>
          <Field label="Destination">
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. MG Road Metro Station"
              className="input"
            />
          </Field>

          <div>
            <span className="mb-2 block text-xs font-medium text-muted">Travel mode</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors focus-ring",
                    mode === m.value
                      ? "border-brand-pink/50 bg-brand-pink/10 text-foreground"
                      : "border-white/10 bg-white/[0.03] text-muted hover:bg-white/[0.06]",
                  )}
                >
                  <span className="text-lg">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h2 className="text-sm font-semibold">Preferences for this trip</h2>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
              <span>Prioritize speed</span>
              <span>Prioritize estimated safety</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={safetyWeight}
              onChange={(e) => setSafetyWeight(Number(e.target.value))}
              className="w-full accent-[var(--brand-pink)]"
            />
          </div>
          <Toggle label="Avoid poorly-lit stretches" checked={avoidPoorlyLit} onChange={setAvoidPoorlyLit} />
          <Toggle label="Minimize walking" checked={minimizeWalking} onChange={setMinimizeWalking} />
          <Toggle label="Wheelchair accessible only" checked={wheelchairAccessible} onChange={setWheelchairAccessible} />
        </GlassCard>

        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Disclaimer>
          Trip details are used only to generate this demo comparison and are not stored as
          precise location history.
        </Disclaimer>

        <Button type="submit" fullWidth size="lg">
          Find Routes
        </Button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .input:focus {
          outline: 2px solid var(--brand-pink);
          outline-offset: 1px;
        }
        .input::placeholder {
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors focus-ring",
          checked ? "brand-gradient-bg" : "bg-white/12",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
