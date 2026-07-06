import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TabNavigation from "@/components/TabNavigation";
import MarketTicker from "@/components/MarketTicker";
import Footer from "@/components/Footer";
import { MarketDataProvider } from "@/context/MarketDataContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Trade Zone — Smart Stock Trading Platform",
  description:
    "Trade smarter with Trade Zone. Real-time market data, portfolio tracking, and intelligent trading tools for the modern investor.",
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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <AuthProvider>
          <MarketDataProvider>
            {/* Sticky Navbar */}
            <Navbar />

            {/* Sub Navigation Tabs */}
            <TabNavigation />

            {/* Market Indices Ticker */}
            <MarketTicker />

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Global Footer */}
            <Footer />
          </MarketDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
