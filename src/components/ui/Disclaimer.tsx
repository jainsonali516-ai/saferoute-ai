import { cn } from "@/lib/utils";

export function Disclaimer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-xs leading-relaxed text-muted",
        className,
      )}
    >
      <span aria-hidden className="mt-0.5">
        ⓘ
      </span>
      <span>{children}</span>
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning",
        className,
      )}
    >
      Demo data
    </span>
  );
}
