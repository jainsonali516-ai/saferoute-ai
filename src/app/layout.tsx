import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { EmergencyFab } from "@/components/layout/EmergencyFab";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// A CSP nonce must never be served from a cache — force every request to
// render fresh so the nonce in the HTML always matches the nonce in the
// response's Content-Security-Policy header (see src/middleware.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SafeRoute AI — Context-aware travel recommendations",
  description:
    "The fastest route is not always the right route. Compare Fastest, Safer and Balanced routes with explainable, privacy-first AI guidance.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Reading the CSP nonce here (set by src/middleware.ts) opts this layout into
  // per-request rendering and lets Next apply it automatically to the inline
  // hydration script it injects — see middleware.ts for the matching CSP header.
  await headers();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-theme="dark">
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <EmergencyFab />
        <MobileTabBar />
      </body>
    </html>
  );
}
