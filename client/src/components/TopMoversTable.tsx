"use client";

import React from "react";
import Link from "next/link";
import MiniSparkline from "./charts/MiniSparkline";
import { formatVolume } from "@/lib/mockData";
import type { StockData } from "@/lib/types";

interface TopMoversTableProps {
  stocks: StockData[];
}

const TopMoversTable: React.FC<TopMoversTableProps> = ({ stocks }) => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2.5 border-b border-border-light">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Company
        </span>
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider text-right min-w-[160px]">
          Market price (1D)
        </span>
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider text-right min-w-[100px]">
          Volume
        </span>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border-light">
        {stocks.map((stock) => (
          <Link
            key={stock.symbol}
            href={`/stock/${stock.symbol.toLowerCase()}`}
            className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3.5 hover:bg-surface cursor-pointer transition-smooth items-center"
          >
            {/* Company Info */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-surface"
                style={{
                  backgroundColor: !stock.domain && stock.logoColor
                    ? `${stock.logoColor}15`
                    : "#f0f0f0",
                }}
              >
                {stock.domain ? (
                  <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${stock.domain}`}
                    alt={stock.companyName}
                    className="w-full h-full object-contain p-1 bg-white"
                    onError={(e) => {
                      // Hide image on error to show fallback letter
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    className="text-xs font-bold"
                    style={{ color: stock.logoColor || "#333" }}
                  >
                    {stock.logoInitial || stock.symbol.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-text-primary truncate">
                {stock.companyName}
              </span>
            </div>

            {/* Price + Sparkline */}
            <div className="flex items-center gap-3 min-w-[160px] justify-end">
              <MiniSparkline
                data={stock.sparklineData || []}
                isPositive={stock.isPositive}
                width={80}
                height={28}
              />
              <div className="text-right">
                <p className="text-sm font-semibold text-text-primary">
                  ₹
                  {stock.price.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    stock.isPositive ? "text-positive" : "text-negative"
                  }`}
                >
                  {stock.change.toFixed(2)} (
                  {Math.abs(stock.changePercent).toFixed(2)}%)
                </p>
              </div>
            </div>

            {/* Volume */}
            <div className="text-right min-w-[100px]">
              <p className="text-sm font-medium text-text-primary">
                {stock.volume ? formatVolume(stock.volume) : "—"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopMoversTable;
