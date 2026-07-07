"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Lock, 
  Wallet, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Award, 
  Users, 
  LineChart,
  Check,
  Star
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import TopMovers from "@/components/TopMovers";
import YourInvestment from "@/components/YourInvestment";
import ProductsTools from "@/components/ProductsTools";
import AuthModal from "@/components/AuthModal";

export default function DashboardPage() {
  const { user, updatePan } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleAddPan = async () => {
    const pan = prompt("Please enter your 10-digit PAN Card (E.g. ABCDE1234F):");
    if (pan) {
      const success = await updatePan(pan);
      if (success) {
        alert("PAN Card updated successfully! Verification complete.");
      } else {
        alert("Invalid format or duplicate PAN card. Try again.");
      }
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED STATE: TRADING DASHBOARD
  // ──────────────────────────────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Alerts (PAN Verification banner) */}
        {user && !user.pancard && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-smooth animate-[fadeIn_0.3s_ease-out]">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Complete your account setup
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Indian trading regulations require a registered PAN card to place live buy/sell orders. It takes less than 30 seconds!
                </p>
              </div>
            </div>
            <button
              onClick={handleAddPan}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-smooth cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
            >
              Add PAN Card
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Top Movers (66%) */}
          <div className="lg:col-span-2">
            <TopMovers />
          </div>

          {/* Right Column: Investment + Products (33%) */}
          <div className="lg:col-span-1 space-y-5">
            <YourInvestment />
            <ProductsTools />
          </div>
        </div>

      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────────
  // UNAUTHENTICATED STATE: PREMIUM LANDING PAGE + FULL FOOTER
  // ──────────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      {/* ─── HERO SECTION ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-24 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-primary text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Analytics Engine</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-tight">
                The Future of <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-brand-primary to-emerald-500 bg-clip-text text-transparent">
                  Smart Stock Trading
                </span>{" "}
                is Here.
              </h1>
              
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience lightning-fast live market data, seamless portfolio intelligence, and advanced candlestick analytics. Mock-trade risk-free with ₹1,00,000 credit, backed by actual real-world market quotes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-primary hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  Start Trading Free
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-border bg-card hover:bg-surface text-text-primary font-bold text-sm cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  Explore Features
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 border-t border-border/70 text-xs text-text-secondary font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-brand-primary" />
                  <span>Real-time Yahoo Finance Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-brand-primary" />
                  <span>Upstox Live Stream Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-brand-primary" />
                  <span>Interactive Smooth Charts</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Mockup (5 cols) */}
            <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
              <div className="relative p-1 rounded-3xl bg-linear-to-tr from-border via-border/50 to-brand-primary/20 shadow-2xl">
                <div className="bg-card rounded-[22px] overflow-hidden p-6 space-y-4">
                  {/* Mock Window Header */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] text-text-muted font-mono">tradezone.io/terminal</span>
                  </div>

                  {/* Mock Stock Card */}
                  <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-brand-primary">
                        BA
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">Bharti Airtel Ltd</h4>
                        <p className="text-[10px] text-text-secondary">BHARTIARTL · NSE</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-text-primary">₹1,925.70</p>
                      <p className="text-[10px] text-positive font-semibold">+0.80%</p>
                    </div>
                  </div>

                  {/* Mock Line Graph Representation */}
                  <div className="h-32 flex items-end gap-1.5 pt-4 px-2">
                    {[35, 45, 40, 50, 42, 60, 55, 70, 65, 80, 75, 95].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t bg-linear-to-t from-emerald-500/20 to-emerald-500" 
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-border/50">
                    <span>09:15 AM</span>
                    <span>12:30 PM</span>
                    <span>03:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ──────────────────────────────────────────────────────────── */}
      <section className="py-12 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-brand-primary tracking-tight">₹1,00,000</p>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Free Practice Credit</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">10ms</p>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">WebSocket Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">99.9%</p>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Server Uptime</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">100%</p>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Yahoo Finance Synced</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID SECTION ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              Powerful tools designed for professional traders.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              We provide a fast, elegant workspace equipped with live data connectors and intelligent indicators. No complex setup, no subscription fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-brand-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Real-Time Price Sync</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Connect your Upstox account or stream live indexes directly from Yahoo Finance. Prices update dynamically every second with precise market tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Flat Candlestick Engine</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Clean, flat candlestick charts designed without distracting borders. Watch live session wicks and wands form dynamically on active ticks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Secure Upstox Authorization</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Integrate Upstox live feed credentials securely. Automatic callbacks save your access tokens directly to databases for uninterrupted live indicators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">₹1L Sandbox Capital</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                New to market trading? Register to get ₹1,00,000 mock funds. Back-test limit and market orders instantly with risk-free learning.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Interactive Zoom Control</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Zoom, pan, and scroll on live candlestick feeds. Our zoom state-locking mechanism guarantees your focus region remains fixed on dynamic ticks.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-border bg-card space-y-4 transition-all hover:shadow-lg hover:border-brand-primary/20">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Global Light/Dark Theme</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tailored dark mode and crisp light mode palettes. Clean borders, soft gradients, and high contrast styling ensure visibility in all light conditions.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS / STEPS ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-border bg-card/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              Get started in three simple steps.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Create an account, verify details, and start exploring live market indicator metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-black flex items-center justify-center mx-auto text-lg shadow-md shadow-emerald-500/15">
                1
              </div>
              <h3 className="text-base font-bold text-text-primary">Create Free Profile</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Sign up with your email and name in less than 10 seconds. Access index rates instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-black flex items-center justify-center mx-auto text-lg shadow-md shadow-emerald-500/15">
                2
              </div>
              <h3 className="text-base font-bold text-text-primary">Complete PAN Check</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Link your PAN card to verify compliance with Indian trading standards. Takes only 10 seconds!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-black flex items-center justify-center mx-auto text-lg shadow-md shadow-emerald-500/15">
                3
              </div>
              <h3 className="text-base font-bold text-text-primary">Trade & Analyze</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                Explore popular equities, monitor holdings, and connect Upstox for live WebSocket streams.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CALL TO ACTION BANNER ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-border bg-linear-to-tr from-card via-background to-brand-primary/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-text-primary tracking-tight leading-tight">
            Ready to experience professional-grade <br />
            market simulation?
          </h2>
          <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Join thousands of modern traders who use Trade Zone to practice strategies, track portfolios, and study dynamic charts.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-10 py-4 rounded-2xl bg-brand-primary hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-emerald-500/10 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Sign Up For Free
            </button>
          </div>
        </div>
      </section>


      {/* Auth Portal Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
