"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { TableRowSkeleton } from "@/components/Skeletons";
import { formatCurrency } from "@/lib/mockData";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";

interface Holding {
  id: string;
  stockSymbol: string;
  companyName: string;
  totalQuantity: number;
  averageBuyPrice: number;
}

export default function HoldingsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { stocks } = useMarketDataContext();

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user || !token) return;
      setLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/holdings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setHoldings(data.data);
        }
      } catch (err) {
        console.error("Failed to load holdings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [user, token]);

  // Live calculations linked to WebSocket feed
  const computedMetrics = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;

    const list = holdings.map((h) => {
      const livePrice = stocks[h.stockSymbol.toUpperCase()]?.price || h.averageBuyPrice;
      const itemInvested = h.totalQuantity * h.averageBuyPrice;
      const itemCurrent = h.totalQuantity * livePrice;
      const pnl = itemCurrent - itemInvested;
      const pnlPercent = itemInvested > 0 ? (pnl / itemInvested) * 100 : 0;

      totalInvested += itemInvested;
      totalCurrent += itemCurrent;

      return {
        ...h,
        currentPrice: livePrice,
        invested: itemInvested,
        current: itemCurrent,
        pnl,
        pnlPercent,
      };
    });

    const overallPnl = totalCurrent - totalInvested;
    const overallPnlPercent = totalInvested > 0 ? (overallPnl / totalInvested) * 100 : 0;

    return {
      list,
      totalInvested,
      totalCurrent,
      overallPnl,
      overallPnlPercent,
    };
  }, [holdings, stocks]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-24 bg-card rounded-2xl animate-pulse" />
        <div className="h-64 bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4 text-text-secondary">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">View your stock holdings</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          Please register or sign in to build your investment portfolio and track valuations in real-time.
        </p>
      </div>
    );
  }

  const { list, totalInvested, totalCurrent, overallPnl, overallPnlPercent } = computedMetrics;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ─── Header Card with Overall Valuations ──────────────────────────────────── */}
      {holdings.length > 0 && (
        <div className="p-6 border border-border rounded-2xl bg-card grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border-light pb-4 sm:pb-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Current Value</p>
            <p className="text-2xl font-extrabold text-text-primary">{formatCurrency(totalCurrent)}</p>
          </div>
          <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border-light pb-4 sm:pb-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Investment</p>
            <p className="text-xl font-bold text-text-primary">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total Returns</p>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${overallPnl >= 0 ? "text-positive" : "text-negative"}`}>
                {overallPnl >= 0 ? "+" : ""}{formatCurrency(overallPnl)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${overallPnl >= 0 ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"}`}>
                {overallPnl >= 0 ? "+" : ""}{overallPnlPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Holdings Table ───────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-primary" />
            Your Stock Holdings ({holdings.length})
          </h2>
        </div>

        {list.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-light text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="p-4 pl-6">Company</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-right">Avg. Price</th>
                  <th className="p-4 text-right">LTP</th>
                  <th className="p-4 text-right">Invested Value</th>
                  <th className="p-4 text-right">Current Value</th>
                  <th className="p-4 text-right pr-6">P&L (Returns)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {list.map((h) => {
                  const pnlPositive = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-surface transition-smooth group">
                      <td className="p-4 pl-6">
                        <Link href={`/stock/${h.stockSymbol.toLowerCase()}`}>
                          <div className="font-bold text-text-primary group-hover:text-brand-primary transition-smooth cursor-pointer">
                            {h.stockSymbol}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">{h.companyName}</div>
                        </Link>
                      </td>
                      <td className="p-4 text-right font-medium text-text-primary">{h.totalQuantity}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(h.averageBuyPrice)}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(h.currentPrice)}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(h.invested)}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(h.current)}</td>
                      <td className="p-4 text-right pr-6">
                        <div className={`font-semibold flex items-center justify-end gap-1 ${pnlPositive ? "text-positive" : "text-negative"}`}>
                          {pnlPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span>{pnlPositive ? "+" : ""}{formatCurrency(h.pnl)}</span>
                        </div>
                        <div className={`text-xs font-semibold mt-0.5 ${pnlPositive ? "text-positive" : "text-negative"}`}>
                          {pnlPositive ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto text-text-secondary">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">No stock holdings yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              Find your favorite equities in the search bar or Explore tab, and place your first BUY order to build your delivery portfolio!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
