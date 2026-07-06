"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, X } from "lucide-react";
import StockCard from "./StockCard";
import TopMoversTable from "./TopMoversTable";
import type { StockData } from "@/lib/types";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { mostBoughtStocks } from "@/lib/mockData";
import { TopMoversSkeleton } from "./Skeletons";
import { STOCK_METADATA } from "@/lib/instruments";

const TopMovers: React.FC = () => {
  const { stocks, stockList } = useMarketDataContext();
  const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);

  // Load recently viewed symbols on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recently_viewed");
      if (raw) {
        setRecentSymbols(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error reading recently viewed stocks:", e);
    }
  }, []);

  // Show skeleton loader if no stock data is loaded yet
  if (Object.keys(stocks).length === 0) {
    return <TopMoversSkeleton />;
  }

  // Map recently viewed symbols to live quote and logo metadata
  const liveRecentStocks = recentSymbols.map(sym => {
    const live = stocks[sym.toUpperCase()];
    const clientMeta = STOCK_METADATA.find(m => m.symbol.toUpperCase() === sym.toUpperCase());
    return {
      symbol: sym.toUpperCase(),
      companyName: live?.companyName || clientMeta?.companyName || `${sym} Ltd`,
      price: live ? live.price : 350.00,
      change: live ? live.change : 0.00,
      changePercent: live ? live.changePercent : 0.00,
      isPositive: live ? live.isPositive : true,
      domain: live?.domain || clientMeta?.domain,
      logoColor: live?.logoColor || clientMeta?.logoColor || "#4B5563"
    };
  });

  // Dynamically map mock cards to live data and attach domains/logos
  const liveMostBought = mostBoughtStocks.map(mockStock => {
    const live = stocks[mockStock.symbol];
    const clientMeta = STOCK_METADATA.find(m => m.symbol.toUpperCase() === mockStock.symbol.toUpperCase());
    return {
      ...mockStock,
      domain: live?.domain || clientMeta?.domain || mockStock.domain,
      logoColor: live?.logoColor || clientMeta?.logoColor || mockStock.logoColor,
      price: live ? live.price : mockStock.price,
      change: live ? live.change : mockStock.change,
      changePercent: live ? live.changePercent : mockStock.changePercent,
      isPositive: live ? live.isPositive : mockStock.isPositive,
    };
  });

  const getGainersStocks = (limit = 5): StockData[] => {
    // Sort primarily by changePercent descending, and secondarily by volume descending
    const list = [...stockList].sort((a, b) => {
      if (b.changePercent !== a.changePercent) {
        return b.changePercent - a.changePercent;
      }
      return (b.volume || 0) - (a.volume || 0); // fallback: highest volume first
    });

    return list.slice(0, limit).map(stock => ({
      ...stock,
      sparklineData: stock.sparklineData || [
        stock.price * 0.99,
        stock.price * 1.01,
        stock.price * 0.985,
        stock.price * 1.005,
        stock.price
      ]
    }));
  };

  const getLosersStocks = (limit = 5): StockData[] => {
    // Sort primarily by changePercent ascending, and secondarily by volume ascending
    const list = [...stockList].sort((a, b) => {
      if (a.changePercent !== b.changePercent) {
        return a.changePercent - b.changePercent;
      }
      return (a.volume || 0) - (b.volume || 0); // fallback: lowest volume first
    });

    return list.slice(0, limit).map(stock => ({
      ...stock,
      sparklineData: stock.sparklineData || [
        stock.price * 0.99,
        stock.price * 1.01,
        stock.price * 0.985,
        stock.price * 1.005,
        stock.price
      ]
    }));
  };

  const getFullMoversStocks = (): StockData[] => {
    return activeTab === "gainers" ? getGainersStocks(15) : getLosersStocks(15);
  };

  return (
    <div className="space-y-6">
      {/* Recently Viewed Section */}
      {liveRecentStocks.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Recently viewed
          </h2>

          {/* Horizontal Cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide animate-[fadeIn_0.3s_ease-out]">
            {liveRecentStocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </div>
      )}

      {/* Most Bought Stocks Section */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Most bought stocks on Trade Zone
        </h2>

        {/* Horizontal Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {liveMostBought.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>

        {/* See more link */}
        <a
          href="#"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-brand-primary hover:text-brand-dark transition-smooth"
        >
          See more
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Top Movers Today Section */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Top movers today
        </h2>

        {/* Tab layout below the title */}
        <div className="flex gap-2 border-b border-border-light mb-4 mt-2">
          <button
            onClick={() => setActiveTab("gainers")}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-smooth cursor-pointer ${
              activeTab === "gainers"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setActiveTab("losers")}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-smooth cursor-pointer ${
              activeTab === "losers"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Losers
          </button>
        </div>

        {/* Single Table list (shows top 5) */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <TopMoversTable stocks={activeTab === "gainers" ? getGainersStocks(5) : getLosersStocks(5)} />
        </div>

        {/* See more link for popover */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-brand-primary hover:text-brand-dark transition-smooth cursor-pointer"
        >
          See more
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Popup for See More */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
              <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "gainers" ? "bg-positive animate-pulse" : "bg-negative"}`} />
                Top {activeTab === "gainers" ? "Gainers" : "Losers"} Today
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-smooth cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <TopMoversTable stocks={getFullMoversStocks()} />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface border-t border-border-light flex justify-end rounded-b-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-brand-primary text-white font-bold text-xs rounded-xl hover:opacity-90 transition-smooth cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default TopMovers;
