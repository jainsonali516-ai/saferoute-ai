"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { TravelMode, UserPreferences } from "@/lib/types";
import { getPreferences, updatePreferences } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { DEFAULT_DEMO_USER, DEMO_USERS, toUserPreferences } from "@/lib/demoData/users";
import { DemoBadge } from "@/components/ui/Disclaimer";

const STORAGE_KEY = "sra_preferences_demo_fallback";

const DEFAULT_PREFS: UserPreferences = toUserPreferences(DEFAULT_DEMO_USER);

const MODES: { value: TravelMode; label: string }[] = [
  { value: "walking", label: "Walking" },
  { value: "public_transport", label: "Public transport" },
  { value: "rideshare", label: "Rideshare" },
  { value: "driving", label: "Driving" },
];

type LoadState = "loading" | "ready" | "offline";

function readLocalFallback(): UserPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserPreferences) : null;
  } catch {
    return null;
  }
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeProfileId, setActiveProfileId] = useState(DEFAULT_DEMO_USER.id);

  function applyDemoProfile(profileId: string) {
    const profile = DEMO_USERS.find((u) => u.id === profileId);
    if (!profile) return;
    setActiveProfileId(profileId);
    setPrefs(toUserPreferences(profile));
  }

  useEffect(() => {
    getPreferences()
      .then((data) => {
        setPrefs(data);
        setLoadState("ready");
      })
      .catch(() => {
        // API unavailable fallback — the UI must still work without a backend.
        setPrefs(readLocalFallback() ?? DEFAULT_PREFS);
        setLoadState("offline");
      });
  }, []);

  function toggleMode(mode: TravelMode) {
    setPrefs((p) => ({
      ...p,
      preferredModes: p.preferredModes.includes(mode)
        ? p.preferredModes.filter((m) => m !== mode)
        : [...p.preferredModes, mode],
    }));
  }

  async function save() {
    setSaveState("saving");
    try {
      const saved = await updatePreferences(prefs);
      setPrefs(saved);
      setLoadState("ready");
      setSaveState("saved");
    } catch {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        /* localStorage unavailable too — nothing more we can do for this demo */
      }
      setLoadState("offline");
      setSaveState("error");
    } finally {
      setTimeout(() => setSaveState("idle"), 2200);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Preferences</h1>
        <DemoBadge />
      </div>
      <p className="mt-1.5 text-sm text-muted">Tune how routes are personalized for you.</p>

      <div className="mt-6 space-y-5">
        {loadState === "loading" ? (
          <GlassCard className="h-48 animate-pulse" />
        ) : (
          <>
            <GlassCard>
              <h2 className="mb-1 text-sm font-semibold">Demo profile</h2>
              <p className="mb-3 text-xs text-muted">
                Try preferences from a different simulated traveler — this just fills in the fields below.
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => applyDemoProfile(u.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-ring",
                      activeProfileId === u.id
                        ? "border-brand-pink/50 bg-brand-pink/15 text-foreground"
                        : "border-white/10 bg-white/[0.03] text-muted",
                    )}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-3 text-sm font-semibold">Preferred transport modes</h2>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => toggleMode(m.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                      prefs.preferredModes.includes(m.value)
                        ? "border-brand-pink/50 bg-brand-pink/10"
                        : "border-white/10 bg-white/[0.03] text-muted",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-3 text-sm font-semibold">Walking tolerance</h2>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setPrefs((p) => ({ ...p, walkingTolerance: level }))}
                    className={cn(
                      "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors focus-ring",
                      prefs.walkingTolerance === level
                        ? "border-brand-pink/50 bg-brand-pink/10"
                        : "border-white/10 bg-white/[0.03] text-muted",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="mb-2 text-sm font-semibold">Default route priority</h2>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
                <span>Fastest</span>
                <span>Safer</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={prefs.routePriority}
                onChange={(e) => setPrefs((p) => ({ ...p, routePriority: Number(e.target.value) }))}
                className="w-full accent-[var(--brand-pink)]"
              />
            </GlassCard>

            <GlassCard className="space-y-3">
              <h2 className="text-sm font-semibold">Accessibility</h2>
              <PrefToggle
                label="Wheelchair accessible routes only"
                checked={prefs.wheelchairAccessible}
                onChange={(v) => setPrefs((p) => ({ ...p, wheelchairAccessible: v }))}
              />
              <PrefToggle
                label="Avoid stairs"
                checked={prefs.avoidStairs}
                onChange={(v) => setPrefs((p) => ({ ...p, avoidStairs: v }))}
              />
              <PrefToggle
                label="Avoid poorly-lit stretches"
                checked={prefs.avoidPoorlyLit}
                onChange={(v) => setPrefs((p) => ({ ...p, avoidPoorlyLit: v }))}
              />
            </GlassCard>

            <Disclaimer>
              {loadState === "offline"
                ? "Couldn't reach the server — preferences are saved locally on this device until it's back."
                : "Preferences are saved to your demo account and used to personalize route recommendations."}
            </Disclaimer>

            <Button fullWidth size="lg" onClick={save} disabled={saveState === "saving"}>
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved ✓"
                  : saveState === "error"
                    ? "Saved locally (offline)"
                    : "Save preferences"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function PrefToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between text-sm">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 rounded-full transition-colors focus-ring", checked ? "brand-gradient-bg" : "bg-white/12")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </label>
  );
}
