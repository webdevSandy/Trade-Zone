import type {
  MarketIndex,
  StockData,
  PortfolioMetrics,
  PortfolioDistribution,
  ProductItem,
} from "./types";

// ─── Market Indices ─────────────────────────────────────────────────────────────

export const marketIndices: MarketIndex[] = [
  {
    name: "NIFTY",
    value: 24006.0,
    change: 140.25,
    changePercent: 0.59,
    isPositive: true,
  },
  {
    name: "SENSEX",
    value: 76918.79,
    change: 440.12,
    changePercent: 0.58,
    isPositive: true,
  },
  {
    name: "BANKNIFTY",
    value: 58014.4,
    change: 471.5,
    changePercent: 0.82,
    isPositive: true,
  },
  {
    name: "MIDCPNIFTY",
    value: 14541.9,
    change: 115.55,
    changePercent: 0.8,
    isPositive: true,
  },
  {
    name: "FINNIFTY",
    value: 26799.55,
    change: -32.45,
    changePercent: -0.12,
    isPositive: false,
  },
];

// ─── Sparkline Data Generators ──────────────────────────────────────────────────

const generateSparkline = (
  base: number,
  volatility: number,
  trend: "up" | "down",
  points: number = 20
): number[] => {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    const randomChange = (Math.random() - 0.5) * volatility;
    const trendBias = trend === "up" ? volatility * 0.15 : -volatility * 0.15;
    current = current + randomChange + trendBias;
    data.push(Math.round(current * 100) / 100);
  }
  return data;
};

// ─── Most Bought Stocks (Horizontal Cards) ──────────────────────────────────────

export const mostBoughtStocks: StockData[] = [
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries",
    price: 2987.30,
    change: 14.50,
    changePercent: 0.49,
    isPositive: true,
    logoColor: "#1A73E8",
    logoInitial: "R",
    sparklineData: generateSparkline(2980, 30, "up"),
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services",
    price: 4102.60,
    change: 25.40,
    changePercent: 0.62,
    isPositive: true,
    logoColor: "#0D47A1",
    logoInitial: "T",
    sparklineData: generateSparkline(4090, 40, "up"),
  },
  {
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Ltd",
    price: 1645.30,
    change: -5.15,
    changePercent: -0.31,
    isPositive: false,
    logoColor: "#0066B3",
    logoInitial: "H",
    sparklineData: generateSparkline(1650, 15, "down"),
  },
  {
    symbol: "INFY",
    companyName: "Infosys Ltd",
    price: 1678.90,
    change: 12.30,
    changePercent: 0.74,
    isPositive: true,
    logoColor: "#FF9800",
    logoInitial: "I",
    sparklineData: generateSparkline(1670, 20, "up"),
  },
];

// ─── Top Gainers ────────────────────────────────────────────────────────────────

export const topGainers: StockData[] = [
  {
    symbol: "ETERNAL",
    companyName: "Eternal (Zomato)",
    price: 279.85,
    change: 15.25,
    changePercent: 5.76,
    isPositive: true,
    volume: 60074143,
    logoColor: "#E23744",
    logoInitial: "E",
    sparklineData: generateSparkline(265, 8, "up"),
  },
  {
    symbol: "RITES",
    companyName: "RITES Ltd",
    price: 234.27,
    change: 29.78,
    changePercent: 14.55,
    isPositive: true,
    volume: 38521670,
    logoColor: "#E91E63",
    logoInitial: "R",
    sparklineData: generateSparkline(210, 10, "up"),
  },
  {
    symbol: "IRFC",
    companyName: "Indian Railway Finance Corp",
    price: 148.35,
    change: 8.92,
    changePercent: 6.4,
    isPositive: true,
    volume: 45892310,
    logoColor: "#3F51B5",
    logoInitial: "I",
    sparklineData: generateSparkline(140, 4, "up"),
  },
  {
    symbol: "TATAPOWER",
    companyName: "Tata Power Company",
    price: 412.6,
    change: 18.45,
    changePercent: 4.68,
    isPositive: true,
    volume: 28156790,
    logoColor: "#0D47A1",
    logoInitial: "T",
    sparklineData: generateSparkline(395, 10, "up"),
  },
  {
    symbol: "SUZLON",
    companyName: "Suzlon Energy Ltd",
    price: 62.8,
    change: 3.15,
    changePercent: 5.28,
    isPositive: true,
    volume: 72345890,
    logoColor: "#00BFA5",
    logoInitial: "S",
    sparklineData: generateSparkline(59, 2, "up"),
  },
  {
    symbol: "NHPC",
    companyName: "NHPC Limited",
    price: 89.45,
    change: 3.78,
    changePercent: 4.41,
    isPositive: true,
    volume: 34567890,
    logoColor: "#1976D2",
    logoInitial: "N",
    sparklineData: generateSparkline(86, 2, "up"),
  },
];

// ─── Top Losers ─────────────────────────────────────────────────────────────────

export const topLosers: StockData[] = [
  {
    symbol: "PAYTM",
    companyName: "One97 Communications (Paytm)",
    price: 485.2,
    change: -32.15,
    changePercent: -6.21,
    isPositive: false,
    volume: 52341890,
    logoColor: "#00B9F1",
    logoInitial: "P",
    sparklineData: generateSparkline(520, 15, "down"),
  },
  {
    symbol: "ADANIENT",
    companyName: "Adani Enterprises Ltd",
    price: 2345.6,
    change: -89.4,
    changePercent: -3.67,
    isPositive: false,
    volume: 18923450,
    logoColor: "#1B5E20",
    logoInitial: "A",
    sparklineData: generateSparkline(2440, 40, "down"),
  },
  {
    symbol: "ZOMATO",
    companyName: "Zomato Limited",
    price: 178.9,
    change: -8.55,
    changePercent: -4.56,
    isPositive: false,
    volume: 41256780,
    logoColor: "#E23744",
    logoInitial: "Z",
    sparklineData: generateSparkline(188, 5, "down"),
  },
  {
    symbol: "NYKAA",
    companyName: "FSN E-Commerce (Nykaa)",
    price: 165.35,
    change: -7.8,
    changePercent: -4.51,
    isPositive: false,
    volume: 15678900,
    logoColor: "#FC2779",
    logoInitial: "N",
    sparklineData: generateSparkline(174, 4, "down"),
  },
  {
    symbol: "DELHIVERY",
    companyName: "Delhivery Limited",
    price: 342.1,
    change: -12.65,
    changePercent: -3.57,
    isPositive: false,
    volume: 12345670,
    logoColor: "#E53935",
    logoInitial: "D",
    sparklineData: generateSparkline(355, 8, "down"),
  },
  {
    symbol: "POLICYBZR",
    companyName: "PB Fintech (PolicyBazaar)",
    price: 1256.8,
    change: -42.3,
    changePercent: -3.26,
    isPositive: false,
    volume: 8923450,
    logoColor: "#0277BD",
    logoInitial: "P",
    sparklineData: generateSparkline(1300, 20, "down"),
  },
];

// ─── Volume Shockers ────────────────────────────────────────────────────────────

export const volumeShockers: StockData[] = [
  {
    symbol: "YESBANK",
    companyName: "Yes Bank Limited",
    price: 22.45,
    change: 1.05,
    changePercent: 4.9,
    isPositive: true,
    volume: 185234560,
    logoColor: "#0066B3",
    logoInitial: "Y",
    sparklineData: generateSparkline(21, 1, "up"),
  },
  {
    symbol: "IDEA",
    companyName: "Vodafone Idea Ltd",
    price: 8.75,
    change: -0.35,
    changePercent: -3.85,
    isPositive: false,
    volume: 245678900,
    logoColor: "#E60000",
    logoInitial: "V",
    sparklineData: generateSparkline(9.1, 0.5, "down"),
  },
  {
    symbol: "SUZLON",
    companyName: "Suzlon Energy Ltd",
    price: 62.8,
    change: 3.15,
    changePercent: 5.28,
    isPositive: true,
    volume: 172345890,
    logoColor: "#00BFA5",
    logoInitial: "S",
    sparklineData: generateSparkline(59, 2, "up"),
  },
  {
    symbol: "IRFC",
    companyName: "Indian Railway Finance Corp",
    price: 148.35,
    change: 8.92,
    changePercent: 6.4,
    isPositive: true,
    volume: 145892310,
    logoColor: "#3F51B5",
    logoInitial: "I",
    sparklineData: generateSparkline(140, 4, "up"),
  },
];

// ─── Portfolio Metrics ──────────────────────────────────────────────────────────

export const portfolioMetrics: PortfolioMetrics = {
  currentValue: 245320.75,
  investedAmount: 210000.0,
  totalReturns: 35320.75,
  totalReturnsPercent: 16.82,
  oneDayReturns: 1245.5,
  oneDayReturnsPercent: 0.51,
};

// ─── Portfolio Distribution (Donut Chart) ───────────────────────────────────────

export const portfolioDistribution: PortfolioDistribution[] = [
  { label: "Large Cap", value: 45, color: "#4F46E5" },
  { label: "Mid Cap", value: 25, color: "#06B6D4" },
  { label: "Small Cap", value: 15, color: "#F59E0B" },
  { label: "Others", value: 15, color: "#8B5CF6" },
];

// ─── Products & Tools ───────────────────────────────────────────────────────────

export const productItems: ProductItem[] = [
  {
    id: "ipo",
    name: "IPO",
    badge: "9 open",
    badgeColor: "#00B386",
    icon: "trending-up",
  },
  {
    id: "bonds",
    name: "Bonds",
    badge: "12 open",
    badgeColor: "#00B386",
    icon: "landmark",
  },
  {
    id: "etfs",
    name: "ETFs",
    badge: "",
    badgeColor: "",
    icon: "layers",
  },
  {
    id: "mutual-funds",
    name: "Mutual Funds",
    badge: "",
    badgeColor: "",
    icon: "pie-chart",
  },
];

// ─── Utility: Format Currency ───────────────────────────────────────────────────

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-IN").format(value);
};

export const formatVolume = (volume: number): string => {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)} Cr`;
  } else if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN").format(volume);
};
