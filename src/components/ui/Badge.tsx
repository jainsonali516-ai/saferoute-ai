import { cn } from "@/lib/utils";
import { ImpactDirection, ConfidenceLevel } from "@/lib/types";
import { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "warning" | "brand";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/8 text-muted border-white/10",
    positive: "bg-success/10 text-success border-success/30",
    negative: "bg-danger/10 text-danger border-danger/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    brand: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ImpactBadge({ impact }: { impact: ImpactDirection }) {
  const label = impact === "positive" ? "Helps" : impact === "negative" ? "Hurts" : "Neutral";
  const tone = impact === "positive" ? "positive" : impact === "negative" ? "negative" : "neutral";
  return <Badge tone={tone}>{label}</Badge>;
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const label = `${level[0].toUpperCase()}${level.slice(1)} confidence`;
  const tone = level === "high" ? "positive" : level === "low" ? "warning" : "neutral";
  return <Badge tone={tone}>{label}</Badge>;
}
