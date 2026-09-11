"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EmergencyFab() {
  const pathname = usePathname();
  if (pathname === "/emergency") return null;

  return (
    <Link
      href="/emergency"
      className="emergency-pulse fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-danger px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-950/40 transition-transform hover:scale-105 focus-ring md:flex"
    >
      🚨 Emergency
    </Link>
  );
}
