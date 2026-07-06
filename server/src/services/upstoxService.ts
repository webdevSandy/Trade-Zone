import axios from "axios";
import {
  INDEX_INSTRUMENTS,
  STOCK_INSTRUMENTS,
  getAllStockInstrumentKeys,
  getAllIndexInstrumentKeys,
  getSymbolFromInstrumentKey,
} from "../config/instruments";
import { getConfigValue, upsertConfigValue } from "../lib/neonDb";

// ─── Constants ──────────────────────────────────────────────────────────────────

const UPSTOX_TOKEN_KEY = "upstox_access_token";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UpstoxTokenResponse {
  access_token: string;
  token_type: string;
  exchange?: string;
}

export interface FormattedQuote {
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
  lastTradeTime: string;
  domain?: string;
  logoColor?: string;
}

export interface FormattedIndex {
  name: string;
  instrumentKey: string;
  value: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

// ─── Token Storage (In-Memory Cache + Database Persistence) ─────────────────────
// Priority order for token resolution:
//   1. UPSTOX_ACCESS_TOKEN env var (highest — backward-compatible override)
//   2. In-memory cache (fastest)
//   3. Database lookup via app_config table (persistent across restarts)
// ─────────────────────────────────────────────────────────────────────────────────

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

// Cache for REST quotes and indices to avoid hitting Upstox rate limits (UDAPI10005)
let cachedQuotes: { data: FormattedQuote[]; timestamp: number } | null = null;
let cachedIndices: { data: FormattedIndex[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000; // 10 seconds cache TTL


/**
 * Saves the access token both in-memory and to the Neon database.
 * Called after a successful OAuth token exchange.
 */
export const setAccessToken = async (token: string): Promise<void> => {
  // Update in-memory cache
  accessToken = token;

  // Upstox tokens are valid for one trading day (until ~3:30 AM next day)
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 18);
  tokenExpiry = expiry;

  // Persist to database using UPSERT
  try {
    await upsertConfigValue(UPSTOX_TOKEN_KEY, token);
    console.log("🔑 Access token persisted to database");
  } catch (error: any) {
    console.error("⚠️ Failed to persist token to DB (in-memory still set):", error.message);
  }
};

/**
 * Retrieves the current access token.
 * Checks: env var → in-memory cache (with expiry check) → database.
 */
export const getAccessToken = async (): Promise<string | null> => {
  // Priority 1: Environment variable override (backward compatibility)
  if (process.env.UPSTOX_ACCESS_TOKEN) {
    return process.env.UPSTOX_ACCESS_TOKEN;
  }

  // Priority 2: In-memory cache (with expiry check)
  if (accessToken) {
    if (tokenExpiry && new Date() > tokenExpiry) {
      // Token expired — clear the cache
      accessToken = null;
      tokenExpiry = null;
      console.log("⏰ In-memory token expired, checking database...");
    } else {
      return accessToken;
    }
  }

  // Priority 3: Database lookup
  try {
    const dbToken = await getConfigValue(UPSTOX_TOKEN_KEY);
    if (dbToken) {
      // Hydrate the in-memory cache from DB
      accessToken = dbToken;
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 18);
      tokenExpiry = expiry;
      return dbToken;
    }
  } catch (error: any) {
    console.error("⚠️ Failed to read token from DB:", error.message);
  }

  return null;
};

/**
 * Synchronous check for quick auth status.
 * Uses env var or in-memory cache only (no DB call).
 * For routes that need a fast gate check without async overhead.
 */
export const isAuthenticated = (): boolean => {
  if (process.env.UPSTOX_ACCESS_TOKEN) return true;
  if (!accessToken) return false;
  if (tokenExpiry && new Date() > tokenExpiry) {
    accessToken = null;
    tokenExpiry = null;
    return false;
  }
  return true;
};

/**
 * Loads the access token from the database into in-memory cache.
 * Called once at server startup to hydrate state.
 */
export const loadTokenFromDb = async (): Promise<void> => {
  try {
    const dbToken = await getConfigValue(UPSTOX_TOKEN_KEY);
    if (dbToken) {
      accessToken = dbToken;
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 18);
      tokenExpiry = expiry;
      console.log("🔑 Access token loaded from database");
    } else {
      console.log("ℹ️ No access token found in database");
    }
  } catch (error: any) {
    console.error("⚠️ Failed to load token from DB on startup:", error.message);
  }
};

export const clearToken = (): void => {
  accessToken = null;
  tokenExpiry = null;
};

// ─── OAuth: Exchange Code for Token ─────────────────────────────────────────────

export const exchangeCodeForToken = async (authCode: string): Promise<string> => {
  const apiKey = process.env.UPSTOX_API_KEY;
  const apiSecret = process.env.UPSTOX_API_SECRET;
  const redirectUri = process.env.UPSTOX_REDIRECT_URI;

  if (!apiKey || !apiSecret || !redirectUri) {
    throw new Error("Upstox API credentials not configured in .env");
  }

  const params = new URLSearchParams();
  params.append("code", authCode);
  params.append("client_id", apiKey);
  params.append("client_secret", apiSecret);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  const response = await axios.post<UpstoxTokenResponse>(
    "https://api.upstox.com/v2/login/authorization/token",
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    }
  );

  const token = response.data.access_token;

  // Persist token to both memory and database
  await setAccessToken(token);

  return token;
};

// ─── Build Login URL ────────────────────────────────────────────────────────────

export const getLoginUrl = (): string => {
  const apiKey = process.env.UPSTOX_API_KEY;
  const redirectUri = process.env.UPSTOX_REDIRECT_URI;

  if (!apiKey || !redirectUri) {
    throw new Error("Upstox API credentials not configured in .env");
  }

  return (
    `https://api.upstox.com/v2/login/authorization/dialog` +
    `?client_id=${apiKey}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`
  );
};

// Resolve a trading symbol (like VISL) to a valid instrument key and metadata using Upstox Search API
export const resolveSymbolToKeyInfo = async (symbol: string): Promise<{ instrumentKey: string; name: string }> => {
  const token = await getAccessToken();
  if (!token) return { instrumentKey: symbol, name: symbol };

  try {
    const response = await axios.get("https://api.upstox.com/v2/instruments/search", {
      params: { query: symbol, exchanges: "NSE,BSE" },
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const items = response.data?.data || [];
    // Find the exact trading symbol match
    const exactMatch = items.find(
      (item: any) => item.trading_symbol.toUpperCase() === symbol.toUpperCase()
    );

    return exactMatch
      ? { instrumentKey: exactMatch.instrument_key, name: exactMatch.name || exactMatch.short_name || symbol }
      : { instrumentKey: symbol, name: symbol };
  } catch (error: any) {
    console.error(`Failed to resolve symbol ${symbol}:`, error.message);
    return { instrumentKey: symbol, name: symbol };
  }
};

// ─── Fetch Market Quotes (REST) ─────────────────────────────────────────────────

export const fetchMarketQuotes = async (
  instrumentKeys?: string[]
): Promise<FormattedQuote[]> => {
  const isDefaultRequest = !instrumentKeys;

  // Serve from cache if available and not expired
  if (isDefaultRequest && cachedQuotes && (Date.now() - cachedQuotes.timestamp < CACHE_TTL_MS)) {
    return cachedQuotes.data;
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated with Upstox");

  const resolvedNamesMap = new Map<string, string>();

  const keys = instrumentKeys
    ? await Promise.all(
        instrumentKeys.map(async (k) => {
          if (k.includes(":") || k.includes("|")) return k;
          const mapped = STOCK_INSTRUMENTS[k.toUpperCase()];
          if (mapped) {
            resolvedNamesMap.set(k.toUpperCase(), mapped.companyName);
            return mapped.instrumentKey;
          }
          // Resolve dynamically via Upstox Search API
          const info = await resolveSymbolToKeyInfo(k);
          resolvedNamesMap.set(k.toUpperCase(), info.name);
          return info.instrumentKey;
        })
      )
    : getAllStockInstrumentKeys();

  // Upstox allows up to 500 instruments per request
  const batchSize = 500;
  const results: FormattedQuote[] = [];

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const instrumentKeyParam = batch.join(",");

    try {
      const response = await axios.get(
        "https://api.upstox.com/v2/market-quote/quotes",
        {
          params: { instrument_key: instrumentKeyParam },
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data;
      if (data) {
        for (const [key, quote] of Object.entries(data) as [string, any][]) {
          const symbol = getSymbolFromInstrumentKey(key);
          const stockInfo = symbol ? STOCK_INSTRUMENTS[symbol] : undefined;
          const ohlc = quote.ohlc || {};
          const netChange = quote.net_change || 0;
          const price = quote.last_price || ohlc.close || 0;
          const prevClose = price - netChange;
          const calculatedChangePercent = prevClose > 0 ? (netChange / prevClose) * 100 : 0;

          const resolvedName = (symbol ? resolvedNamesMap.get(symbol.toUpperCase()) : undefined) || stockInfo?.companyName || symbol || key;

          results.push({
            symbol: symbol || key,
            companyName: resolvedName,
            instrumentKey: key,
            price: price,
            change: netChange,
            changePercent: parseFloat(calculatedChangePercent.toFixed(2)),
            isPositive: netChange >= 0,
            open: ohlc.open || 0,
            high: ohlc.high || 0,
            low: ohlc.low || 0,
            close: ohlc.close || 0,
            volume: quote.volume || 0,
            lastTradeTime: quote.last_trade_time || "",
            domain: stockInfo?.domain,
            logoColor: stockInfo?.logoColor,
          });
        }
      }
    } catch (error: any) {
      console.error(
        `Error fetching quotes batch:`,
        error.response?.data || error.message
      );
    }
  }

  if (isDefaultRequest && results.length > 0) {
    cachedQuotes = { data: results, timestamp: Date.now() };
  }

  return results;
};

// ─── Fetch Market Indices ───────────────────────────────────────────────────────

export const fetchMarketIndices = async (): Promise<FormattedIndex[]> => {
  // Serve from cache if available and not expired
  if (cachedIndices && (Date.now() - cachedIndices.timestamp < CACHE_TTL_MS)) {
    return cachedIndices.data;
  }

  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated with Upstox");

  const keys = getAllIndexInstrumentKeys();
  const instrumentKeyParam = keys.join(",");

  try {
    const response = await axios.get(
      "https://api.upstox.com/v2/market-quote/quotes",
      {
        params: { instrument_key: instrumentKeyParam },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data?.data;
    if (!data) return [];

    const results: FormattedIndex[] = [];

    for (const [key, quote] of Object.entries(data) as [string, any][]) {
      const name = getSymbolFromInstrumentKey(key);
      const ohlc = quote.ohlc || {};
      const netChange = quote.net_change || 0;

      results.push({
        name: name || key,
        instrumentKey: key,
        value: quote.last_price || ohlc.close || 0,
        change: netChange,
        changePercent: quote.net_change_percentage || 0,
        isPositive: netChange >= 0,
      });
    }

    const order = ["NIFTY", "SENSEX", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"];
    results.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

    if (results.length > 0) {
      cachedIndices = { data: results, timestamp: Date.now() };
    }

    return results;
  } catch (error: any) {
    console.error(
      "Error fetching indices:",
      error.response?.data || error.message
    );
    return [];
  }
};

// ─── Fetch Top Movers (Sorted by change%) ───────────────────────────────────────

export const fetchTopGainers = async (limit = 10): Promise<FormattedQuote[]> => {
  const quotes = await fetchMarketQuotes();
  return quotes
    .filter((q) => q.isPositive && q.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, limit);
};

export const fetchTopLosers = async (limit = 10): Promise<FormattedQuote[]> => {
  const quotes = await fetchMarketQuotes();
  return quotes
    .filter((q) => !q.isPositive && q.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, limit);
};

export const fetchVolumeShockers = async (limit = 10): Promise<FormattedQuote[]> => {
  const quotes = await fetchMarketQuotes();
  return quotes
    .filter((q) => q.volume > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit);
};
