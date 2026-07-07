const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface UpstoxStatus {
  authenticated: boolean;
  connected: boolean;
}

export interface UpstoxStockQuote {
  symbol: string;
  companyName: string;
  instrumentKey: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp?: number;
  domain?: string;
  logoColor?: string;
  sparklineData?: number[];
}

export interface UpstoxIndexQuote {
  name: string;
  instrumentKey: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

// ─── API Requests ───────────────────────────────────────────────────────────────

export const getUpstoxLoginUrl = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/login`);
    const data = await res.json();
    return data.success ? data.loginUrl : null;
  } catch (error) {
    console.error("Error fetching Upstox login URL:", error);
    return null;
  }
};

export const getUpstoxStatus = async (): Promise<UpstoxStatus> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/status`);
    const data = await res.json();
    return {
      authenticated: data.authenticated || false,
      connected: data.connected || false,
    };
  } catch (error) {
    console.error("Error fetching Upstox status:", error);
    return { authenticated: false, connected: false };
  }
};

export const logoutUpstox = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/logout`);
    const data = await res.json();
    return data.success || false;
  } catch (error) {
    console.error("Error logging out Upstox:", error);
    return false;
  }
};

export const getMarketIndices = async (): Promise<UpstoxIndexQuote[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/indices`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching indices:", error);
    return [];
  }
};

export const getMarketQuotes = async (symbols?: string[]): Promise<UpstoxStockQuote[]> => {
  try {
    const url = new URL(`${BACKEND_URL}/api/upstox/quotes`);
    if (symbols && symbols.length > 0) {
      url.searchParams.append("symbols", symbols.join(","));
    }
    const res = await fetch(url.toString());
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
};

export const getTopGainers = async (limit = 10): Promise<UpstoxStockQuote[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/top-gainers?limit=${limit}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching top gainers:", error);
    return [];
  }
};

export const getTopLosers = async (limit = 10): Promise<UpstoxStockQuote[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/top-losers?limit=${limit}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching top losers:", error);
    return [];
  }
};

export const getVolumeShockers = async (limit = 10): Promise<UpstoxStockQuote[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/volume-shockers?limit=${limit}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching volume shockers:", error);
    return [];
  }
};

export const searchInstruments = async (query: string): Promise<UpstoxStockQuote[]> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/upstox/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error searching instruments:", error);
    return [];
  }
};
