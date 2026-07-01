import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TabNavigation from "@/components/TabNavigation";
import MarketTicker from "@/components/MarketTicker";

export const metadata: Metadata = {
  title: "TradAdda — Smart Stock Trading Platform",
  description:
    "Trade smarter with TradAdda. Real-time market data, portfolio tracking, and intelligent trading tools for the modern investor.",
  keywords: [
    "stock trading",
    "trading platform",
    "NIFTY",
    "SENSEX",
    "portfolio",
    "investment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Sticky Navbar */}
        <Navbar />

        {/* Sub Navigation Tabs */}
        <TabNavigation />

        {/* Market Indices Ticker */}
        <MarketTicker />

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
