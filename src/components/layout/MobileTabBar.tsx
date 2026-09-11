"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/plan", label: "Plan", icon: "🧭" },
  { href: "/dashboard", label: "Safety", icon: "📊" },
  { href: "/emergency", label: "Emergency", icon: "🚨" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const isEmergency = tab.href === "/emergency";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium focus-ring",
                isEmergency ? "text-danger" : active ? "text-foreground" : "text-muted",
              )}
            >
              <span className={cn("text-lg", isEmergency && "animate-pulse")}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
