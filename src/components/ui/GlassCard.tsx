import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function GlassCard({ hover, className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn("glass-card p-5", hover && "glass-card-hover cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
}
