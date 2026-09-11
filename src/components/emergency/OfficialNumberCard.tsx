import { EmergencyNumber } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { LinkButton } from "@/components/ui/Button";

const ICONS: Record<EmergencyNumber["icon"], string> = {
  siren: "🚨",
  shield: "👮",
  heart: "💗",
  flame: "🔥",
  phone: "🚑",
};

export function OfficialNumberCard({ entry }: { entry: EmergencyNumber }) {
  return (
    <GlassCard className="flex items-center justify-between gap-4 border-danger/20 bg-danger/[0.03]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger/15 text-xl" aria-hidden>
          {ICONS[entry.icon]}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {entry.name} <span className="text-muted font-normal">· {entry.number}</span>
          </p>
          <p className="truncate text-xs text-muted">{entry.description}</p>
        </div>
      </div>
      <LinkButton
        href={`tel:${entry.number}`}
        variant="emergency"
        size="md"
        className="shrink-0"
        aria-label={`Call ${entry.name} at ${entry.number}`}
      >
        📞 Call
      </LinkButton>
    </GlassCard>
  );
}
