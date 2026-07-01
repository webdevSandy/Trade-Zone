// ─── TypeScript Interfaces for TradAdda Frontend ────────────────────────────────

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  volume?: number;
  sparklineData: number[];
  logoColor?: string;
  logoInitial?: string;
}

export interface PortfolioMetrics {
  currentValue: number;
  investedAmount: number;
  totalReturns: number;
  totalReturnsPercent: number;
  oneDayReturns: number;
  oneDayReturnsPercent: number;
}

export interface PortfolioDistribution {
  label: string;
  value: number;
  color: string;
}

export interface ProductItem {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: string;
}

export interface OrderData {
  id: string;
  stockSymbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED";
  timestamp: string;
}

export interface HoldingData {
  id: string;
  stockSymbol: string;
  companyName: string;
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface PositionData {
  id: string;
  stockSymbol: string;
  companyName: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  isIntraday: boolean;
  pnl: number;
  pnlPercent: number;
}

export interface WatchlistData {
  id: string;
  name: string;
  stocks: string[];
}

export type TabType = "explore" | "holdings" | "positions" | "orders" | "watchlist";
export type MoverTab = "gainers" | "losers" | "volume";
