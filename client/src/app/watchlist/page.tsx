"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { formatCurrency, formatNumber } from "@/lib/mockData";
import MiniSparkline from "@/components/charts/MiniSparkline";
import { Star, Trash2, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export default function WatchlistPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const { stocks } = useMarketDataContext();

  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch watchlist from API
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user || !token) return;
      setLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setSymbols(data.data);
        }
      } catch (err) {
        console.error("Failed to load watchlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, token]);

  // Remove symbol from watchlist
  const handleRemove = async (symbol: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolio/watchlist/${symbol}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSymbols(prev => prev.filter(s => s !== symbol));
      }
    } catch (err) {
      console.error("Failed to remove watchlist item:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4 text-text-secondary">
          <Star className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Monitor your Watchlist</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          Please register or sign in to save stocks to your personal watchlist and track updates.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          My Watchlist ({symbols.length})
        </h1>
      </div>

      {symbols.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols.map((symbol) => {
            const liveStock = stocks[symbol.toUpperCase()];
            const price = liveStock ? liveStock.price : 100.0;
            const change = liveStock ? liveStock.change : 0.0;
            const changePercent = liveStock ? liveStock.changePercent : 0.0;
            const isPositive = liveStock ? liveStock.isPositive : true;
            
            // Mappings for color code
            const nameInitial = symbol.substring(0, 2);

            // Dummy sparkline points based on price
            const sparkPoints = [price * 0.99, price * 1.015, price * 0.98, price * 1.005, price];

            return (
              <Link key={symbol} href={`/stock/${symbol.toLowerCase()}`}>
                <div className="p-4 border border-border bg-card rounded-2xl hover:border-brand-primary hover:shadow-md transition-smooth flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-hover text-brand-primary flex items-center justify-center font-bold text-sm">
                      {nameInitial}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary group-hover:text-brand-primary transition-smooth">
                        {symbol}
                      </h4>
                      <p className="text-xs text-text-secondary">{symbol} Limited</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sparkline */}
                    <div className="hidden xs:block">
                      <MiniSparkline
                        data={sparkPoints}
                        isPositive={isPositive}
                        width={60}
                        height={24}
                      />
                    </div>

                    {/* Price Info */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">{formatCurrency(price)}</p>
                      <span className={`inline-flex items-center text-xs font-semibold mt-0.5 ${isPositive ? "text-positive" : "text-negative"}`}>
                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={(e) => handleRemove(symbol, e)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-negative hover:bg-negative-bg/25 transition-smooth cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-16 border border-border border-dashed rounded-2xl bg-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto text-text-secondary">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Watchlist is empty</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Go to any Stock Detail Page or search for a stock, and verify its metrics. You can add them to your watchlist to monitor them closely!
          </p>
        </div>
      )}
    </div>
  );
}
