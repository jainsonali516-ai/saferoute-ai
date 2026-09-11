import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { EmergencyFab } from "@/components/layout/EmergencyFab";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeRoute AI — Context-aware travel recommendations",
  description:
    "The fastest route is not always the right route. Compare Fastest, Safer and Balanced routes with explainable, privacy-first AI guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
