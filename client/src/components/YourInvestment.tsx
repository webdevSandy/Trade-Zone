"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMarketDataContext } from "@/context/MarketDataContext";
import DonutChart from "./charts/DonutChart";
import { InvestmentSkeleton } from "./Skeletons";
import { formatCurrency } from "@/lib/mockData";
import { LogIn, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

// ─── Holding Interface ──────────────────────────────────────────────────────────
interface Holding {
  id: string;
  stockSymbol: string;
  totalQuantity: number;
  averageBuyPrice: number;
}

// ─── Cap category helper matching backend ────────────────────────────────────────
const getCapCategory = (symbol: string): "Large Cap" | "Mid Cap" | "Small Cap" => {
  const sym = symbol.toUpperCase();
  const largeCaps = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "SBIN"];
  const midCaps = ["TATAMOTORS", "TATAPOWER", "IRFC", "PAYTM"];
  
  if (largeCaps.includes(sym)) return "Large Cap";
  if (midCaps.includes(sym)) return "Mid Cap";
  return "Small Cap";
};

const YourInvestment: React.FC = () => {
  const { user, token, isLoading: authLoading } = useAuth();
  const { stocks } = useMarketDataContext();

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // ── Fetch user holdings from backend ───────────────────────────────────────
  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user || !token) {
        setHoldings([]);
        return;
      }

      setDataLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/holdings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setHoldings(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch holdings:", err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchHoldings();
  }, [user, token]);

  // ── Calculate dynamic metrics based on live WebSocket prices ────────────────
  const portfolioMetrics = useMemo(() => {
    let investedAmount = 0;
    let currentValue = 0;
    let oneDayReturns = 0;

    const capTotals: Record<string, number> = {
      "Large Cap": 0,
      "Mid Cap": 0,
      "Small Cap": 0,
    };

    holdings.forEach((h) => {
      const livePrice = stocks[h.stockSymbol.toUpperCase()]?.price || h.averageBuyPrice;
      const netChange = stocks[h.stockSymbol.toUpperCase()]?.change || 0;

      const itemInvested = h.totalQuantity * h.averageBuyPrice;
      const itemCurrent = h.totalQuantity * livePrice;

      investedAmount += itemInvested;
      currentValue += itemCurrent;
      oneDayReturns += h.totalQuantity * netChange;

      // Group for distribution chart
      const category = getCapCategory(h.stockSymbol);
      capTotals[category] += itemCurrent;
    });

    const totalReturns = currentValue - investedAmount;
    const totalReturnsPercent = investedAmount > 0 ? (totalReturns / investedAmount) * 100 : 0;
    const oneDayReturnsPercent = currentValue > 0 && currentValue !== oneDayReturns 
      ? (oneDayReturns / (currentValue - oneDayReturns)) * 100 
      : 0;

    // Format distribution chart items
    const colorsMap = {
      "Large Cap": "#4F46E5",
      "Mid Cap": "#06B6D4",
      "Small Cap": "#F59E0B",
    };

    const distribution = Object.entries(capTotals)
      .filter(([_, val]) => val > 0)
      .map(([label, val]) => {
        const percentage = currentValue > 0 ? (val / currentValue) * 100 : 0;
        return {
          label,
          value: Math.round(percentage),
          color: colorsMap[label as keyof typeof colorsMap] || "#8B5CF6",
        };
      });

    return {
      investedAmount,
      currentValue,
      totalReturns,
      totalReturnsPercent,
      oneDayReturns,
      oneDayReturnsPercent,
      distribution,
      hasInvestments: holdings.length > 0,
    };
  }, [holdings, stocks]);

  // Show skeleton loader during fetching
  if (authLoading || dataLoading) {
    return <InvestmentSkeleton />;
  }

  // ── Render Sign In Screen if Logged Out ────────────────────────────────────
  if (!user) {
    return (
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-5 text-center py-10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto text-text-secondary">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            Track your investments
          </h3>
          <p className="text-xs text-text-secondary max-w-[220px] mx-auto leading-relaxed">
            Please register or sign in to verify your portfolio values and execute simulated trades.
          </p>
        </div>
      </div>
    );
  }

  const {
    currentValue,
    investedAmount,
    totalReturns,
    totalReturnsPercent,
    oneDayReturns,
    oneDayReturnsPercent,
    distribution,
    hasInvestments,
  } = portfolioMetrics;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Your investments
        </h3>

        {hasInvestments ? (
          <div className="space-y-5">
            {/* Portfolio Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Current value
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(currentValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Invested amount
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {formatCurrency(investedAmount)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-border-light"></div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Total returns
                </span>
                <div className="text-right flex items-center justify-end gap-1">
                  <span className={`text-sm font-semibold flex items-center ${totalReturns >= 0 ? "text-positive" : "text-negative"}`}>
                    {totalReturns >= 0 ? "+" : ""}{formatCurrency(totalReturns)}
                  </span>
                  <span className={`text-xs ${totalReturns >= 0 ? "text-positive" : "text-negative"}`}>
                    ({totalReturns >= 0 ? "+" : ""}{totalReturnsPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">1D returns</span>
                <div className="text-right flex items-center justify-end gap-1">
                  <span className={`text-sm font-semibold flex items-center ${oneDayReturns >= 0 ? "text-positive" : "text-negative"}`}>
                    {oneDayReturns >= 0 ? "+" : ""}{formatCurrency(oneDayReturns)}
                  </span>
                  <span className={`text-xs ${oneDayReturns >= 0 ? "text-positive" : "text-negative"}`}>
                    ({oneDayReturns >= 0 ? "+" : ""}{oneDayReturnsPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Chart (Allocation) */}
            {distribution.length > 0 && (
              <div className="pt-2">
                <DonutChart
                  data={distribution}
                  width={220}
                  height={240}
                />
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-24 h-24 mb-4 rounded-full bg-surface flex items-center justify-center text-brand-primary">
              <TrendingUp className="w-10 h-10" />
            </div>
            <p className="text-sm text-text-primary font-bold">
              No holdings yet
            </p>
            <p className="text-xs text-text-secondary max-w-[200px] mt-1 leading-relaxed">
              Find a stock in the trade zone and place a BUY order to start your paper trading portfolio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourInvestment;
