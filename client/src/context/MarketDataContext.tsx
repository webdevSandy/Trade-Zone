"use client";

import React, { createContext, useContext } from "react";
import { useMarketData } from "../hooks/useMarketData";
import { UpstoxStockQuote, UpstoxIndexQuote } from "../lib/upstoxApi";

interface MarketDataContextType {
  isAuthenticated: boolean;
  isConnected: boolean;
  stocks: Record<string, UpstoxStockQuote>;
  indices: Record<string, UpstoxIndexQuote>;
  stockList: UpstoxStockQuote[];
  indexList: UpstoxIndexQuote[];
  gainers: UpstoxStockQuote[];
  losers: UpstoxStockQuote[];
  volumeShockers: UpstoxStockQuote[];
  socket?: any;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

const TRACKED_SYMBOLS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", 
  "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK", "WIPRO", "ASIANPAINT", 
  "MARUTI", "TATAMOTORS", "SUNPHARMA", "BAJFINANCE", "TITAN", "ULTRACEMCO",
  "TATAPOWER", "SUZLON", "IRFC", "NHPC", "YESBANK", "IDEA", "ETERNAL", "PAYTM"
];

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const marketData = useMarketData(TRACKED_SYMBOLS);

  return (
    <MarketDataContext.Provider value={marketData}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketDataContext = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error("useMarketDataContext must be used within a MarketDataProvider");
  }
  return context;
};
