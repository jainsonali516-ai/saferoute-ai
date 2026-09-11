"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoBadge } from "@/components/ui/Disclaimer";
import { PrivacySettings } from "@/lib/types";
import { getPrivacySettings, updatePrivacySettings } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const DATA_USES = [
  {
    title: "Journey inputs",
    detail: "Origin, destination and mode are used only to generate route comparisons for this session. They are not saved as precise location history.",
  },
  {
    title: "Context signals",
    detail: "Demo weather/traffic/activity/transport signals are generated for the route comparison and are not tied to your identity.",
  },
  {
    title: "Trusted contacts",
    detail: "Stored against your anonymous demo account only. Never shown to other users, and never returned in bulk to anyone.",
  },
  {
    title: "Live journey sharing",
    detail: "Only active while you explicitly turn sharing on, and only shares status — not a continuous precise location trail.",
  },
];

const DEFAULT_SETTINGS: PrivacySettings = {
  locationSharing: false,
  saveJourneyHistory: false,
  shareWithTrustedContact: false,
  analyticsConsent: false,
};

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPrivacySettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Couldn't load your saved settings — showing defaults. Changes may not persist.");
        setLoading(false);
      });
  }, []);

  function updateSetting(key: keyof PrivacySettings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    updatePrivacySettings(next).catch(() => {
      setError("Couldn't save this change to the server. It will reset on reload.");
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Privacy Center</h1>
        <DemoBadge />
      </div>
      <p className="text-sm text-muted">How SafeRoute AI handles your data, and what you control.</p>

      {loading ? (
        <div className="mt-6 space-y-4">
          <GlassCard className="h-40 animate-pulse" />
          <GlassCard className="h-32 animate-pulse" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <GlassCard>
            <h2 className="mb-3 text-sm font-semibold">What we use, and why</h2>
            <div className="space-y-3">
              {DATA_USES.map((d) => (
                <div key={d.title} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{d.detail}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="text-sm font-semibold">Permissions</h2>
            <PermissionToggle
              label="Precise location access"
              desc="Needed only while actively planning or on a live journey."
              checked={settings.locationSharing}
              onChange={(v) => updateSetting("locationSharing", v)}
            />
            <PermissionToggle
              label="Save journey history"
              desc="Keep a record of past journeys on your account instead of discarding them after each trip."
              checked={settings.saveJourneyHistory}
              onChange={(v) => updateSetting("saveJourneyHistory", v)}
            />
            <PermissionToggle
              label="Live trip sharing with trusted contacts"
              desc="Lets a trusted contact see your journey status when you turn it on."
              checked={settings.shareWithTrustedContact}
              onChange={(v) => updateSetting("shareWithTrustedContact", v)}
            />
            <PermissionToggle
              label="Anonymous usage analytics"
              desc="Helps improve the product. Never includes your trusted contacts or precise routes."
              checked={settings.analyticsConsent}
              onChange={(v) => updateSetting("analyticsConsent", v)}
            />
          </GlassCard>

          {error && (
            <GlassCard className="border-warning/30 bg-warning/[0.06] text-xs text-warning">{error}</GlassCard>
          )}

          <GlassCard className="border-brand-pink/25 bg-brand-pink/[0.04]">
            <h2 className="mb-2 text-sm font-semibold">Our commitments</h2>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• We do not store precise location history longer than needed for the active session.</li>
              <li>• Mock/demo data is always clearly labeled as such in the product.</li>
              <li>• API keys and credentials are never exposed in client-side code.</li>
              <li>• Trusted contacts are private to your account and never exposed via any public or bulk endpoint.</li>
            </ul>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function PermissionToggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring", checked ? "brand-gradient-bg" : "bg-white/12")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
