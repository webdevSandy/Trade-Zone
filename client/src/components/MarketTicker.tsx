"use client";

import React from "react";
import { Globe } from "lucide-react";
import { marketIndices } from "@/lib/mockData";
import { useMarketDataContext } from "@/context/MarketDataContext";

const MarketTicker: React.FC = () => {
  const { indexList, isConnected, isAuthenticated } = useMarketDataContext();
  
  const indexOrder = ["NIFTY", "SENSEX", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];
  const displayIndices = [...(indexList.length > 0 ? indexList : marketIndices)].sort(
    (a, b) => indexOrder.indexOf(a.name) - indexOrder.indexOf(b.name)
  );

  return (
    <div className="bg-card border-b border-border overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 min-w-max">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-border mr-1">
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              }`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {isConnected ? "Live" : isAuthenticated ? "Connected" : "Mock"}
              </span>
            </div>

            {displayIndices.map((index) => (
              <div
                key={index.name}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <span className="text-xs font-semibold text-text-primary tracking-wide">
                  {index.name}
                </span>
                <span className="text-xs font-medium text-text-primary">
                  {index.value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    index.isPositive ? "text-positive" : "text-negative"
                  }`}
                >
                  {index.isPositive ? "" : ""}
                  {Math.abs(index.change).toFixed(2)} (
                  {Math.abs(index.changePercent).toFixed(2)}%)
                </span>
              </div>
            ))}

            {/* Globe / Others indicator */}
            <button className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-smooth">
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
