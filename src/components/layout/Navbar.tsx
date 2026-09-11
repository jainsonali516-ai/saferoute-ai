"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/plan", label: "Plan" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/preferences", label: "Preferences" },
  { href: "/privacy", label: "Privacy" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl brand-gradient-bg text-sm">🛡️</span>
          <span className="text-lg">
            SafeRoute <span className="brand-gradient-text">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring",
                pathname === link.href ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/emergency"
            className="ml-2 rounded-lg border border-danger/40 bg-danger/15 px-3 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/25 focus-ring"
          >
            🚨 Emergency
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 text-foreground md:hidden focus-ring"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/8 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href ? "bg-white/10 text-foreground" : "text-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/emergency"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg border border-danger/40 bg-danger/15 px-3 py-2.5 text-sm font-semibold text-danger"
            >
              🚨 Emergency Help
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
