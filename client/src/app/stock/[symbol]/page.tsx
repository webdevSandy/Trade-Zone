"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, ShieldCheck, Award, Star, ChevronDown, Bell } from "lucide-react";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { formatCurrency, formatNumber, formatVolume } from "@/lib/mockData";
import { STOCK_METADATA } from "@/lib/instruments";

// Dynamically import ApexCharts to prevent SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

// ─── Type Interfaces ─────────────────────────────────────────────────────────────

interface StockInfo {
  name: string;
  sector: string;
  description: string;
  marketCap: string;
  peRatio: number;
  divYield: number;
  high52w: number;
  low52w: number;
  logoColor: string;
}

// ─── Mock Dictionary of Common Stocks ──────────────────────────────────────────

const STOCK_DETAILS_MAP: Record<string, StockInfo> = {
  RELIANCE: {
    name: "Reliance Industries Ltd",
    sector: "Oil & Gas / Retail / Telecom",
    description: "Reliance Industries Limited is an Indian multinational conglomerate, headquartered in Mumbai. RIL's businesses include energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.",
    marketCap: "19,85,420 Cr",
    peRatio: 26.4,
    divYield: 0.35,
    high52w: 3024.90,
    low52w: 2220.05,
    logoColor: "#1A73E8"
  },
  TCS: {
    name: "Tata Consultancy Services Ltd",
    sector: "IT Services",
    description: "Tata Consultancy Services is an Indian multinational information technology services and consulting company. It is a part of the Tata Group and operates in 150 locations across 46 countries.",
    marketCap: "14,20,560 Cr",
    peRatio: 29.8,
    divYield: 1.15,
    high52w: 4254.75,
    low52w: 3156.00,
    logoColor: "#0D47A1"
  },
  HDFCBANK: {
    name: "HDFC Bank Ltd",
    sector: "Banking / Financial Services",
    description: "HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is India's largest private sector bank by assets and the world's tenth largest bank by market capitalization.",
    marketCap: "12,70,890 Cr",
    peRatio: 19.5,
    divYield: 1.10,
    high52w: 1794.00,
    low52w: 1363.55,
    logoColor: "#0066B3"
  },
  INFY: {
    name: "Infosys Ltd",
    sector: "IT Services",
    description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services. The company was founded in Pune and is headquartered in Bangalore.",
    marketCap: "6,50,420 Cr",
    peRatio: 24.2,
    divYield: 2.18,
    high52w: 1764.40,
    low52w: 1215.30,
    logoColor: "#FF9800"
  },
  SUZLON: {
    name: "Suzlon Energy Ltd",
    sector: "Renewable Energy",
    description: "Suzlon Energy Limited is an Indian wind turbine manufacturer based in Pune, India. It is a major player in the global wind energy market, offering comprehensive wind energy solutions.",
    marketCap: "85,670 Cr",
    peRatio: 84.5,
    divYield: 0.00,
    high52w: 68.50,
    low52w: 13.20,
    logoColor: "#00BFA5"
  },
  IRFC: {
    name: "Indian Railway Finance Corp",
    sector: "Financial Services",
    description: "Indian Railway Finance Corporation (IRFC) is the dedicated market borrowing arm of the Indian Railways. It finances the acquisition of rolling stock assets, leasing of railway infrastructure assets, and national projects.",
    marketCap: "1,93,920 Cr",
    peRatio: 30.1,
    divYield: 1.01,
    high52w: 229.00,
    low52w: 32.10,
    logoColor: "#3F51B5"
  },
  TATAPOWER: {
    name: "Tata Power Company Ltd",
    sector: "Utilities / Power Generation",
    description: "The Tata Power Company Limited is an Indian electric utility and electricity generation company based in Mumbai, Maharashtra. It is part of the Tata Group and is India's largest integrated power company.",
    marketCap: "1,31,820 Cr",
    peRatio: 34.6,
    divYield: 0.48,
    high52w: 464.20,
    low52w: 212.10,
    logoColor: "#0D47A1"
  },
  PAYTM: {
    name: "One97 Communications Ltd (Paytm)",
    sector: "Fintech / Digital Payments",
    description: "One97 Communications Limited is an Indian digital payments and financial services company, based in Noida. It was founded in 2010 by Vijay Shekhar Sharma and operates the popular payment system Paytm.",
    marketCap: "30,850 Cr",
    peRatio: -18.2,
    divYield: 0.00,
    high52w: 998.30,
    low52w: 310.00,
    logoColor: "#00B9F1"
  }
};

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = use(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  const { stocks, socket } = useMarketDataContext();
  const { user, token } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamically subscribe to the opened stock ticks on the websocket feed
  useEffect(() => {
    if (socket && symbol) {
      console.log(`🔌 Requesting dynamic WebSocket subscription for: ${symbol}`);
      socket.emit("upstox:subscribe:stock", symbol);
    }
  }, [socket, symbol]);

  const [isWatchlisted, setIsWatchlisted] = useState<boolean>(false);
  const [watchlistUpdating, setWatchlistUpdating] = useState<boolean>(false);

  // Check watchlist status
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user || !token) return;
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/watchlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setIsWatchlisted(data.data.includes(symbol));
        }
      } catch (err) {
        console.error("Error checking watchlist:", err);
      }
    };
    checkWatchlist();
  }, [user, token, symbol]);

  const toggleWatchlist = async () => {
    if (!user || !token || watchlistUpdating) return;
    setWatchlistUpdating(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    try {
      if (isWatchlisted) {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/watchlist/${symbol}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setIsWatchlisted(false);
        }
      } else {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/watchlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stockSymbol: symbol }),
        });
        const data = await res.json();
        if (data.success) {
          setIsWatchlisted(true);
        }
      }
    } catch (err) {
      console.error("Error toggling watchlist:", err);
    } finally {
      setWatchlistUpdating(false);
    }
  };

  // ─── Local State ─────────────────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState<string>("1D");
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [priceType, setPriceType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [baseChartData, setBaseChartData] = useState<any[]>([]);
  const [zoomRange, setZoomRange] = useState<{ min: any; max: any } | null>(null);
  const [liveHigh, setLiveHigh] = useState<number | null>(null);
  const [liveLow, setLiveLow] = useState<number | null>(null);
  const [isIntraday, setIsIntraday] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"line" | "candle" | "bar">("line");
  const [candleInterval, setCandleInterval] = useState<string>("5M");
  const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    o: number;
    h: number;
    l: number;
    c: number;
  } | null>(null);

  // Local quote state for off-grid (non-tracked) stocks
  const [localQuote, setLocalQuote] = useState<any>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/upstox/quotes?symbols=${symbol}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setLocalQuote(data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching local quote:", err);
      }
    };
    fetchQuote();
  }, [symbol]);

  // Save viewed stock to recently viewed list in localStorage
  useEffect(() => {
    if (!symbol) return;
    try {
      const raw = localStorage.getItem("recently_viewed");
      let list: string[] = raw ? JSON.parse(raw) : [];
      list = list.filter((item) => item !== symbol);
      list.unshift(symbol);
      list = list.slice(0, 5); // store top 5 recently viewed stocks
      localStorage.setItem("recently_viewed", JSON.stringify(list));
    } catch (e) {
      console.error("Error updating recently viewed stocks:", e);
    }
  }, [symbol]);

  // ─── Live Data Resolution ────────────────────────────────────────────────────────
  // Lookup stock from live context feed or fallback to local REST-fetched quote
  const liveStock = stocks[symbol] || localQuote;
  const currentPrice = liveStock ? liveStock.price : 150.0;
  const change = liveStock ? liveStock.change : 2.5;
  const changePercent = liveStock ? liveStock.changePercent : 1.67;
  const isPositive = liveStock ? liveStock.isPositive : true;
  const openPrice = liveStock?.open || currentPrice * 0.98;
  const highPrice = liveStock?.high || currentPrice * 1.01;
  const lowPrice = liveStock?.low || currentPrice * 0.97;
  const closePrice = liveStock?.close || currentPrice * 0.99;
  const volume = liveStock?.volume || 124500;

  // Client-side metadata lookup (for domains and logos)
  const clientMeta = STOCK_METADATA.find(m => m.symbol.toUpperCase() === symbol);
  const domain = liveStock?.domain || clientMeta?.domain;
  const logoColor = liveStock?.logoColor || clientMeta?.logoColor || "#4B5563";

  // Retrieve sector info, descriptions etc.
  const staticDetails = STOCK_DETAILS_MAP[symbol] || {
    name: liveStock?.companyName || clientMeta?.companyName || `${symbol} Limited`,
    sector: "Miscellaneous / Equity",
    description: `${liveStock?.companyName || symbol} is a publicly traded company listed on the National Stock Exchange of India (NSE) or Bombay Stock Exchange (BSE). Connect live Upstox or log in to view updated real-time analytics.`,
    marketCap: "24,500 Cr",
    peRatio: 22.5,
    divYield: 0.5,
    high52w: currentPrice * 1.3,
    low52w: currentPrice * 0.7,
    logoColor: logoColor
  };

  // Reset live session bounds and zoom on configuration changes
  useEffect(() => {
    setLiveHigh(null);
    setLiveLow(null);
    setZoomRange(null);
  }, [symbol, candleInterval, chartPeriod, chartType]);

  // Track the high and low of the current price session for drawing dynamic candlestick wicks
  useEffect(() => {
    if (!currentPrice) return;
    setLiveHigh(prev => prev === null ? currentPrice : Math.max(prev, currentPrice));
    setLiveLow(prev => prev === null ? currentPrice : Math.min(prev, currentPrice));
  }, [currentPrice]);

  // Sync custom limit price input box with current market price by default
  useEffect(() => {
    if (currentPrice) {
      setCustomPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice]);

  // Fetch actual historical chart data from backend
  useEffect(() => {
    let active = true;
    const fetchHistoricalData = async () => {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      
      let yahooInterval = "5m";
      let yahooRange = "1d";

      if (chartType === "candle") {
        yahooRange = "1d";
        if (candleInterval === "30S") yahooInterval = "1m";
        else if (candleInterval === "1M") yahooInterval = "1m";
        else if (candleInterval === "2M") yahooInterval = "2m";
        else if (candleInterval === "5M") yahooInterval = "5m";
        else if (candleInterval === "10M") yahooInterval = "15m";
        else if (candleInterval === "15M") yahooInterval = "15m";
        else if (candleInterval === "30M") yahooInterval = "30m";
      } else {
        if (chartPeriod === "1D") {
          yahooRange = "1d";
          yahooInterval = "5m";
        } else if (chartPeriod === "1W") {
          yahooRange = "5d";
          yahooInterval = "15m";
        } else if (chartPeriod === "1M") {
          yahooRange = "1mo";
          yahooInterval = "1d";
        } else if (chartPeriod === "3M") {
          yahooRange = "3mo";
          yahooInterval = "1d";
        } else if (chartPeriod === "6M") {
          yahooRange = "6mo";
          yahooInterval = "1d";
        } else if (chartPeriod === "1Y") {
          yahooRange = "1y";
          yahooInterval = "1d";
        } else if (chartPeriod === "3Y") {
          yahooRange = "5y";
          yahooInterval = "1wk";
        } else if (chartPeriod === "5Y") {
          yahooRange = "5y";
          yahooInterval = "1wk";
        } else {
          yahooRange = "max";
          yahooInterval = "1mo";
        }
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/upstox/historical-chart?symbol=${symbol}&interval=${yahooInterval}&range=${yahooRange}`);
        const result = await res.json();
        if (active && result.success && result.data) {
          const formatted = result.data.map((c: any) => {
            if (chartType === "candle") {
              return {
                x: c.x,
                y: [c.open, c.high, c.low, c.close]
              };
            } else {
              return {
                x: c.x,
                y: c.close
              };
            }
          });
          setBaseChartData(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch historical chart data:", err);
      }
    };

    fetchHistoricalData();
    return () => {
      active = false;
    };
  }, [chartPeriod, chartType, candleInterval, symbol]);

  // Update the very last point/candle in real-time as live ticks come in
  useEffect(() => {
    if (baseChartData.length === 0 || isHoveringChart) return;

    const updated = [...baseChartData];
    const lastIdx = updated.length - 1;
    const lastPoint = { ...updated[lastIdx] };

    if (chartType === "candle") {
      if (!Array.isArray(lastPoint.y)) return; // Guard against async state mismatch
      const [open] = lastPoint.y;
      
      const currentHigh = liveHigh !== null ? Math.max(open, liveHigh, currentPrice) : Math.max(open, currentPrice);
      const currentLow = liveLow !== null ? Math.min(open, liveLow, currentPrice) : Math.min(open, currentPrice);

      lastPoint.y = [open, currentHigh, currentLow, currentPrice];
    } else {
      if (Array.isArray(lastPoint.y)) return; // Guard against async state mismatch
      lastPoint.y = currentPrice;
    }

    updated[lastIdx] = lastPoint;
    setChartData(updated);
  }, [currentPrice, baseChartData, chartType, liveHigh, liveLow, isHoveringChart]);

  // ─── Chart Config ────────────────────────────────────────────────────────────────
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: chartType === "candle" ? "candlestick" : chartType === "bar" ? "bar" : "area",
      toolbar: { show: true },
      sparkline: { enabled: false },
      background: "transparent",
      animations: {
        enabled: false
      },
      events: {
        zoomed: (chartContext: any, { xaxis }: any) => {
          if (xaxis) {
            setZoomRange({ min: xaxis.min, max: xaxis.max });
          } else {
            setZoomRange(null);
          }
        },
        scrolled: (chartContext: any, { xaxis }: any) => {
          if (xaxis) {
            setZoomRange({ min: xaxis.min, max: xaxis.max });
          }
        },
        mouseMove: (event: any, chartContext: any, config: any) => {
          if (!config || !config.w) return;
          const dataPointIndex = config.dataPointIndex;
          const seriesIndex = config.seriesIndex;
          if (seriesIndex !== undefined && seriesIndex >= 0 && dataPointIndex !== undefined && dataPointIndex >= 0) {
            const seriesList = config.w.config?.series;
            if (seriesList && seriesList[seriesIndex]) {
              const point = seriesList[seriesIndex].data?.[dataPointIndex];
              if (point) {
                if (Array.isArray(point.y)) {
                  const [o, h, l, c] = point.y;
                  setHoveredPoint({ o, h, l, c });
                } else if (typeof point.y === "number") {
                  setHoveredPoint({ o: point.y, h: point.y, l: point.y, c: point.y });
                } else if (point.y !== undefined) {
                  setHoveredPoint({ o: point.y, h: point.y, l: point.y, c: point.y });
                }
              }
            }
          }
        },
        mouseLeave: () => {
          setHoveredPoint(null);
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: chartType === "candle" ? 1 : chartType === "bar" ? 0 : 2
    },
    colors: chartType === "candle" ? ["#00b386", "#dc2626"] : [isPositive ? "#00b386" : "#dc2626"],
    fill: {
      type: chartType === "candle" ? "none" : chartType === "bar" ? "solid" : "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.1,
        opacityFrom: 0.25,
        opacityTo: 0.01,
        stops: [0, 100]
      }
    },
    grid: {
      show: false,
      padding: { left: 0, right: 0 }
    },
    xaxis: {
      type: "category",
      min: zoomRange?.min,
      max: zoomRange?.max,
      labels: {
        show: false
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      show: false,
      labels: {
        show: false
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#00b386",
          downward: "#dc2626"
        },
        wick: {
          useFillColor: true
        }
      },
      bar: {
        columnWidth: "60%",
        colors: {
          ranges: [
            {
              from: 0,
              to: 999999,
              color: isPositive ? "#00b386" : "#dc2626"
            }
          ]
        }
      }
    },
    tooltip: {
      theme: "dark",
      x: { show: true },
      y: {
        title: { formatter: () => "Price:" }
      }
    }
  };

  const chartSeries = [
    {
      name: chartType === "candle" ? "Candlesticks" : "Price",
      data: chartData
    }
  ];

  // ─── Order Placement ─────────────────────────────────────────────────────────────
  const finalPrice = priceType === "MARKET" ? currentPrice : parseFloat(customPrice) || currentPrice;
  const totalAmount = quantity * finalPrice;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user || !token) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${BACKEND_URL}/api/portfolio/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockSymbol: symbol,
          orderType,
          quantity,
          executionPrice: finalPrice,
          isIntraday,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderPlaced(true);
        setTimeout(() => {
          setOrderPlaced(false);
          setQuantity(1);
        }, 4000);
      } else {
        setErrorMsg(data.error || "Order execution failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Chart, Info) - 66% width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 border border-border rounded-2xl bg-card">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3.5">
                {/* Square Brand Logo */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white overflow-hidden bg-surface border border-border"
                  style={{
                    backgroundColor: !domain && logoColor ? `${logoColor}15` : "#f0f0f0",
                    color: logoColor || "#333",
                  }}
                >
                  {domain ? (
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                      alt={staticDetails.name}
                      className="w-full h-full object-contain p-1.5 rounded-xl bg-white"
                    />
                  ) : (
                    symbol.substring(0, 2)
                  )}
                </div>

                {/* Subtitle Caret INFY · NSE */}
                <div className="flex items-center gap-1 text-[11px] text-text-secondary font-bold uppercase tracking-wider">
                  <span>{symbol} · NSE</span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </div>

                {/* Company Title */}
                <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
                  {staticDetails.name}
                </h1>

                {/* Price display row */}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-semibold text-text-primary tracking-tight">
                    {formatCurrency(currentPrice)}
                  </span>
                  <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePercent.toFixed(2)}%) <span className="text-[10px] opacity-75 ml-1 font-normal">1D</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons on Right */}
              <div className="flex items-center gap-2 self-start">
                {user && user.isAdmin && (
                  <button
                    onClick={() => {
                      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                      window.location.href = `${BACKEND_URL}/api/upstox/admin-login?secret=tradezone_admin_secret_2026`;
                    }}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-smooth cursor-pointer"
                    title="Connect Upstox API"
                  >
                    {/* chain/link icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </button>
                )}
                <button
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-smooth cursor-pointer"
                  title="Set Alert"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistUpdating}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-smooth cursor-pointer ${isWatchlisted
                      ? "border-amber-500 bg-amber-500/10 text-amber-500"
                      : "border-border text-text-secondary hover:text-text-primary hover:bg-surface"
                    }`}
                  title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Star className={`w-4 h-4 ${isWatchlisted ? "fill-amber-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Interactive Price Chart */}
            <div className="mt-8">
              {/* Upper row: Timeframe Dropdown (left) & OHLC + Volume (right) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-4">
                {/* Left: Candle Interval Selector (if candle mode active) */}
                <div>
                  {chartType === "candle" ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted font-bold">Timeframe:</span>
                      <select
                        value={candleInterval}
                        onChange={(e) => setCandleInterval(e.target.value)}
                        className="bg-surface border border-border text-xs rounded-lg px-2.5 py-1 text-text-primary font-bold outline-none focus:border-brand-primary cursor-pointer"
                      >
                        <option value="30S">30s candle</option>
                        <option value="1M">1 min candle</option>
                        <option value="2M">2 min candle</option>
                        <option value="5M">5 min candle</option>
                        <option value="10M">10 min candle</option>
                        <option value="15M">15 min candle</option>
                        <option value="30M">30 min candle</option>
                      </select>
                    </div>
                  ) : (
                    <div className="text-text-muted font-bold tracking-wider uppercase">Price Chart</div>
                  )}
                </div>

                {/* Right: OHLC and Volume indicator */}
                <div className="flex items-center gap-4 flex-wrap font-semibold text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">{hoveredPoint ? "Hovered" : "Price"}</span>
                    <span>O</span>
                    <span className={hoveredPoint ? (hoveredPoint.c >= hoveredPoint.o ? "text-positive" : "text-negative") : (isPositive ? "text-positive" : "text-negative")}>
                      {hoveredPoint ? hoveredPoint.o.toFixed(2) : openPrice.toFixed(2)}
                    </span>
                    <span>H</span>
                    <span className={hoveredPoint ? (hoveredPoint.c >= hoveredPoint.o ? "text-positive" : "text-negative") : (isPositive ? "text-positive" : "text-negative")}>
                      {hoveredPoint ? hoveredPoint.h.toFixed(2) : highPrice.toFixed(2)}
                    </span>
                    <span>L</span>
                    <span className={hoveredPoint ? (hoveredPoint.c >= hoveredPoint.o ? "text-positive" : "text-negative") : (isPositive ? "text-positive" : "text-negative")}>
                      {hoveredPoint ? hoveredPoint.l.toFixed(2) : lowPrice.toFixed(2)}
                    </span>
                    <span>C</span>
                    <span className={hoveredPoint ? (hoveredPoint.c >= hoveredPoint.o ? "text-positive" : "text-negative") : (isPositive ? "text-positive" : "text-negative")}>
                      {hoveredPoint ? hoveredPoint.c.toFixed(2) : currentPrice.toFixed(2)}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-text-secondary hover:text-text-primary">
                    <input type="checkbox" defaultChecked className="rounded border-border text-brand-primary focus:ring-brand-primary w-3.5 h-3.5" />
                    <span>Volume</span>
                  </label>
                </div>
              </div>

              {/* Chart Component */}
              <div 
                className="h-[300px]"
                onMouseEnter={() => setIsHoveringChart(true)}
                onMouseLeave={() => {
                  setIsHoveringChart(false);
                  setHoveredPoint(null);
                }}
              >
                {chartData.length > 0 && (
                  <Chart
                    options={chartOptions}
                    series={chartSeries}
                    type={chartType === "candle" ? "candlestick" : chartType === "bar" ? "bar" : "area"}
                    height="100%"
                    width="100%"
                  />
                )}
              </div>

              {/* Lower Row: Time Period Pills + Candle/Line Toggle + Terminal */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-4 mt-6 gap-4">
                <div className="flex flex-wrap items-center gap-1">
                  {/* Period selectors styled as pills */}
                  {["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "All"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-smooth cursor-pointer ${chartPeriod === period
                          ? "bg-surface-hover text-text-primary border border-border"
                          : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                      {period}
                    </button>
                  ))}

                  {/* Chart type icon toggle */}
                  <button
                    onClick={() => setChartType(chartType === "candle" ? "line" : "candle")}
                    className={`p-1.5 ml-2 rounded-full border transition-smooth cursor-pointer ${chartType === "candle"
                        ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                        : "border-border text-text-secondary hover:text-text-primary"
                      }`}
                    title="Toggle Candle/Line Chart"
                  >
                    {/* squiggle/trend line vector */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                  </button>
                </div>

                {/* far-right Terminal button */}
                <button className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary border border-border hover:text-text-primary hover:bg-surface rounded-xl transition-smooth cursor-pointer font-bold">
                  <span>Terminal</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="2" y1="14" x2="6" y2="14" />
                    <line x1="10" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="16" x2="22" y2="16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Fundamentals & Stats Card */}
          <div className="p-6 border border-border rounded-2xl bg-card space-y-6">
            <h2 className="text-base font-bold text-text-primary">Market Statistics</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Open Price</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(openPrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Prev. Close</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(closePrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Today&apos;s High</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(highPrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Today&apos;s Low</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(lowPrice)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">52-Week High</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(staticDetails.high52w)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">52-Week Low</p>
                <p className="text-sm font-semibold text-text-primary">{formatCurrency(staticDetails.low52w)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Market Capitalization</p>
                <p className="text-sm font-semibold text-text-primary">{staticDetails.marketCap}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Traded Volume</p>
                <p className="text-sm font-semibold text-text-primary">{formatVolume(volume)}</p>
              </div>
            </div>

            <div className="border-t border-border-light pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Industry Sector</p>
                <p className="text-sm font-semibold text-text-primary">{staticDetails.sector}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">P/E Ratio</p>
                <p className="text-sm font-semibold text-text-primary">{staticDetails.peRatio === -18.2 ? "N/A" : staticDetails.peRatio}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-text-secondary">Div. Yield (%)</p>
                <p className="text-sm font-semibold text-text-primary">{staticDetails.divYield.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-6 border border-border rounded-2xl bg-card">
            <h2 className="text-base font-bold text-text-primary mb-3">About Company</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{staticDetails.description}</p>
          </div>
        </div>

        {/* Right Column (Trading Panel) - 33% width */}
        <div className="space-y-6">
          <div className="p-6 border border-border rounded-2xl bg-card">
            {/* Header info in card */}
            <div className="mb-4">
              <h3 className="text-base font-extrabold text-text-primary tracking-tight">{staticDetails.name.split(" Ltd")[0].split(" Limited")[0]}</h3>
              <p className="text-[11px] text-text-secondary mt-0.5 font-semibold">
                NSE {formatCurrency(currentPrice)} ({change >= 0 ? "+" : ""}{changePercent.toFixed(2)}%) · BSE {formatCurrency(currentPrice * 1.001)} <span className="text-text-muted hover:underline cursor-pointer">Depth</span>
              </p>
            </div>

            <div className="flex border-b border-border mb-5">
              <button
                onClick={() => setOrderType("BUY")}
                className={`flex-1 pb-3 text-center text-sm font-black border-b-2 transition-smooth cursor-pointer ${orderType === "BUY"
                    ? "border-positive text-positive"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
              >
                BUY
              </button>
              <button
                onClick={() => setOrderType("SELL")}
                className={`flex-1 pb-3 text-center text-sm font-black border-b-2 transition-smooth cursor-pointer ${orderType === "SELL"
                    ? "border-negative text-negative"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
              >
                SELL
              </button>
            </div>

            {orderPlaced ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-positive-bg text-positive flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <h3 className="text-base font-bold text-text-primary">Order Executed Successfully!</h3>
                <p className="text-xs text-text-secondary px-4">
                  {orderType} order for {quantity} share(s) of {symbol} at {formatCurrency(finalPrice)} has been placed on the market.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Product Type Capsules */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsIntraday(false)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-smooth cursor-pointer border ${!isIntraday
                          ? "bg-surface-hover text-text-primary border-border"
                          : "text-text-secondary border-transparent hover:text-text-primary"
                        }`}
                    >
                      Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIntraday(true)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-smooth cursor-pointer border ${isIntraday
                          ? "bg-surface-hover text-text-primary border-border"
                          : "text-text-secondary border-transparent hover:text-text-primary"
                        }`}
                    >
                      Intraday
                    </button>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold text-text-muted cursor-not-allowed border border-transparent"
                      disabled
                    >
                      MTF 4.02x
                    </button>
                  </div>

                  <button type="button" className="text-text-secondary hover:text-text-primary transition-smooth cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>
                </div>

                {/* Quantity input Row */}
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-text-secondary select-none">
                    <span>Qty NSE</span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 bg-surface border border-border rounded-lg px-2.5 py-1 text-right text-sm text-text-primary font-bold outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Price Type Row */}
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-text-secondary select-none">
                    <span
                      className="cursor-pointer hover:text-text-primary transition-smooth"
                      onClick={() => setPriceType(priceType === "MARKET" ? "LIMIT" : "MARKET")}
                    >
                      Price {priceType === "LIMIT" ? "Limit" : "Market"}
                    </span>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-text-muted cursor-pointer"
                      onClick={() => setPriceType(priceType === "MARKET" ? "LIMIT" : "MARKET")}
                    />
                  </div>
                  {priceType === "LIMIT" ? (
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      required
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="w-28 bg-surface border border-border rounded-lg px-2.5 py-1 text-right text-sm text-text-primary font-bold outline-none focus:border-brand-primary"
                    />
                  ) : (
                    <div className="w-28 py-1 text-right text-sm text-text-muted font-bold pr-2.5">
                      {currentPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Summary Info */}
                <div className="flex items-center justify-between text-xs text-text-secondary pt-4 border-t border-border-light font-bold">
                  <div>
                    Balance: <span className="text-text-primary">{formatCurrency(user ? user.walletBalance : 0)}</span>
                  </div>
                  <div>
                    Approx req.: <span className="text-text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="bg-negative-bg text-negative border border-negative/10 rounded-xl p-3 text-xs text-center font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Place button */}
                {!user ? (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full py-3 rounded-xl bg-brand-primary text-white hover:opacity-90 font-bold text-sm transition-smooth cursor-pointer"
                  >
                    Sign In to Trade
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-smooth disabled:opacity-50 disabled:cursor-not-allowed ${orderType === "BUY" ? "bg-positive hover:opacity-90" : "bg-negative hover:opacity-90"
                      }`}
                  >
                    {isSubmitting ? "Executing..." : orderType === "BUY" ? "Buy" : "Sell"}
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Secure Trading Indicator */}
          <div className="p-4 border border-border rounded-xl bg-card flex gap-3 text-xs text-text-secondary leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
            <div>
              <p className="font-semibold text-text-primary mb-0.5">Secure Transaction</p>
              <p>Your orders are routed securely to Indian stock exchanges (NSE/BSE). Live market rates are managed by Neon & Upstox Serverless API connectivity.</p>
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
