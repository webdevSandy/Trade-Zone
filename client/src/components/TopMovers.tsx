"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import StockCard from "./StockCard";
import TopMoversTable from "./TopMoversTable";
import type { MoverTab } from "@/lib/types";
import {
  mostBoughtStocks,
  topGainers,
  topLosers,
  volumeShockers,
} from "@/lib/mockData";

const moverTabs: { id: MoverTab; label: string }[] = [
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "volume", label: "Volume shockers" },
];

const TopMovers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MoverTab>("gainers");

  const getActiveStocks = () => {
    switch (activeTab) {
      case "gainers":
        return topGainers;
      case "losers":
        return topLosers;
      case "volume":
        return volumeShockers;
      default:
        return topGainers;
    }
  };

  return (
    <div className="space-y-6">
      {/* Most Bought Stocks Section */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Most bought stocks on Groww
        </h2>

        {/* Horizontal Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mostBoughtStocks.map((stock) => (
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
        <h2 className="text-base font-semibold text-text-primary mb-4">
          Top movers today
        </h2>

        {/* Tab Pills + Filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {moverTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-smooth ${
                activeTab === tab.id ? "pill-active" : "pill-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Index Dropdown */}
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-border text-text-secondary hover:bg-surface transition-smooth ml-auto">
            NIFTY 100
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <TopMoversTable stocks={getActiveStocks()} />
        </div>
      </div>
    </div>
  );
};

export default TopMovers;
