"use client";

import React from "react";
import MiniSparkline from "./charts/MiniSparkline";
import type { StockData } from "@/lib/types";

interface StockCardProps {
  stock: StockData;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  return (
    <div className="flex flex-col min-w-[160px] p-4 border border-border rounded-xl stock-card-hover cursor-pointer bg-white">
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{
          backgroundColor: stock.logoColor
            ? `${stock.logoColor}15`
            : "#f0f0f0",
        }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: stock.logoColor || "#333" }}
        >
          {stock.logoInitial || stock.symbol.charAt(0)}
        </span>
      </div>

      {/* Company Name */}
      <p className="text-sm font-medium text-text-primary mb-2 truncate">
        {stock.companyName}
      </p>

      {/* Price */}
      <p className="text-sm font-semibold text-text-primary mb-0.5">
        ₹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>

      {/* Change */}
      <p
        className={`text-xs font-semibold ${
          stock.isPositive ? "text-positive" : "text-negative"
        }`}
      >
        {stock.isPositive ? "" : ""}
        {stock.change.toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
      </p>
    </div>
  );
};

export default StockCard;
