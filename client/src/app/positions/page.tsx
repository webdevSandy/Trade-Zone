"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { formatCurrency } from "@/lib/mockData";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface Position {
  id: string;
  stockSymbol: string;
  companyName: string;
  quantity: number;
  entryPrice: number;
  isIntraday: boolean;
}

export default function PositionsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { stocks } = useMarketDataContext();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPositions = async () => {
      if (!user || !token) return;
      setLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/positions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setPositions(data.data);
        }
      } catch (err) {
        console.error("Failed to load positions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [user, token]);

  // Live P&L updates based on WebSocket prices
  const computedMetrics = useMemo(() => {
    let totalPnl = 0;

    const list = positions.map((p) => {
      const livePrice = stocks[p.stockSymbol.toUpperCase()]?.price || p.entryPrice;
      const entryValue = p.quantity * p.entryPrice;
      const currentValue = p.quantity * livePrice;
      const pnl = currentValue - entryValue;
      const pnlPercent = entryValue > 0 ? (pnl / entryValue) * 100 : 0;

      totalPnl += pnl;

      return {
        ...p,
        currentPrice: livePrice,
        entryValue,
        currentValue,
        pnl,
        pnlPercent,
      };
    });

    return {
      list,
      totalPnl,
    };
  }, [positions, stocks]);

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
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">View active positions</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          Please register or sign in to track live intraday paper-trading positions.
        </p>
      </div>
    );
  }

  const { list, totalPnl } = computedMetrics;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ─── Header Card with Intraday Returns ────────────────────────────────────── */}
      {positions.length > 0 && (
        <div className="p-6 border border-border rounded-2xl bg-card flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Active Intraday P&L</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-extrabold ${totalPnl >= 0 ? "text-positive" : "text-negative"}`}>
                {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${totalPnl >= 0 ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"}`}>
                {totalPnl >= 0 ? "Profit" : "Loss"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Positions Table ──────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            Active Positions ({positions.length})
          </h2>
        </div>

        {list.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-light text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="p-4 pl-6">Instrument</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Net Qty</th>
                  <th className="p-4 text-right">Avg. Price</th>
                  <th className="p-4 text-right">LTP</th>
                  <th className="p-4 text-right pr-6">P&L (Returns)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {list.map((p) => {
                  const pnlPositive = p.pnl >= 0;
                  return (
                    <tr key={p.id} className="hover:bg-surface transition-smooth group">
                      <td className="p-4 pl-6">
                        <Link href={`/stock/${p.stockSymbol.toLowerCase()}`}>
                          <div className="font-bold text-text-primary group-hover:text-brand-primary cursor-pointer">
                            {p.stockSymbol}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">{p.companyName}</div>
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full uppercase">
                          Intraday
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-text-primary">{p.quantity}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(p.entryPrice)}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(p.currentPrice)}</td>
                      <td className="p-4 text-right pr-6">
                        <div className={`font-semibold flex items-center justify-end gap-1 ${pnlPositive ? "text-positive" : "text-negative"}`}>
                          {pnlPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span>{pnlPositive ? "+" : ""}{formatCurrency(p.pnl)}</span>
                        </div>
                        <div className={`text-xs font-semibold mt-0.5 ${pnlPositive ? "text-positive" : "text-negative"}`}>
                          {pnlPositive ? "+" : ""}{p.pnlPercent.toFixed(2)}%
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
            <h3 className="text-sm font-bold text-text-primary">No active positions</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              You do not have any active intraday positions. Switch order type to Intraday when purchasing a stock to see it listed here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
