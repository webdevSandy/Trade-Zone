import { Router, Request, Response } from "express";
import axios from "axios";
import { STOCK_INSTRUMENTS } from "../config/instruments";
import {
  getLoginUrl,
  exchangeCodeForToken,
  isAuthenticated,
  getAccessToken,
  clearToken,
  fetchMarketQuotes,
  fetchMarketIndices,
  fetchTopGainers,
  fetchTopLosers,
  fetchVolumeShockers,
} from "../services/upstoxService";
import { connectToUpstoxFeed, isFeedConnected } from "../services/upstoxWebSocket";

const router = Router();

// ─── GET /admin-login — Secret-protected admin OAuth redirect ───────────────────
// Only the admin uses this route to authenticate with Upstox once daily.
// Protected by a query string secret to prevent unauthorized access.
//
// Usage: GET /api/upstox/admin-login?secret=YOUR_ADMIN_SECRET
// ─────────────────────────────────────────────────────────────────────────────────

router.get("/admin-login", (_req: Request, res: Response) => {
  try {
    // ── Validate admin secret ───────────────────────────────────────────────
    const { secret } = _req.query;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error("❌ ADMIN_SECRET not configured in environment variables");
      res.status(500).json({
        success: false,
        error: "Server misconfiguration: ADMIN_SECRET not set",
      });
      return;
    }

    if (!secret || secret !== adminSecret) {
      res.status(403).json({
        success: false,
        error: "Forbidden: Invalid or missing admin secret",
      });
      return;
    }

    // ── Redirect to Upstox OAuth login page ─────────────────────────────────
    const loginUrl = getLoginUrl();
    res.redirect(loginUrl);
  } catch (error: any) {
    console.error("❌ Admin login error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to initiate admin login",
    });
  }
});

// ─── GET /callback — Handle Upstox OAuth callback ───────────────────────────────
// Upstox redirects here after admin login with an authorization code.
// We exchange the code for an access_token and persist it to the database.
// ─────────────────────────────────────────────────────────────────────────────────

router.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TradAdda — Error</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f0f0f; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .card { background: #1a1a2e; border-radius: 16px; padding: 40px; max-width: 480px; text-align: center; border: 1px solid #e74c3c33; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { color: #e74c3c; font-size: 24px; margin-bottom: 8px; }
          p { color: #888; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">❌</div>
          <h1>Authorization Failed</h1>
          <p>Authorization code was not provided by Upstox. Please try the login flow again.</p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  try {
    // Exchange the authorization code for an access token
    // This also persists the token to the Neon database via the service layer
    const token = await exchangeCodeForToken(code);

    // Attempt to start the live WebSocket feed with the new token
    try {
      await connectToUpstoxFeed();
      console.log("📡 Live feed connected after token refresh");
    } catch (feedError: any) {
      console.error("⚠️ Live feed connection failed (token is still saved):", feedError.message);
    }

    // Return a styled HTML success page
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TradAdda — Token Saved</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f0f0f; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .card { background: #1a1a2e; border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; border: 1px solid #00d4aa33; box-shadow: 0 0 40px #00d4aa11; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { color: #00d4aa; font-size: 24px; margin-bottom: 8px; }
          p { color: #aaa; line-height: 1.6; margin: 8px 0; }
          .token-preview { background: #0d1117; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-family: 'Fira Code', monospace; font-size: 13px; color: #58a6ff; word-break: break-all; border: 1px solid #30363d; }
          .timestamp { color: #666; font-size: 12px; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">✅</div>
          <h1>Upstox Token Saved!</h1>
          <p>The access token has been securely saved to the database and is now active.</p>
          <div class="token-preview">${token.substring(0, 20)}...${token.substring(token.length - 10)}</div>
          <p class="timestamp">Updated at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          <p style="margin-top: 20px; color: #00d4aa; font-weight: 500;" id="countdown-text">Redirecting you to the dashboard in 3 seconds...</p>
          <script>
            let count = 3;
            const interval = setInterval(() => {
              count--;
              if (count <= 0) {
                clearInterval(interval);
                window.location.href = "${process.env.CLIENT_URL || 'http://localhost:3000'}";
              } else {
                document.getElementById('countdown-text').innerText = "Redirecting you to the dashboard in " + count + " seconds...";
              }
            }, 1000);
          </script>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error("❌ Upstox callback error:", error.response?.data || error.message);

    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TradAdda — Token Error</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f0f0f; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .card { background: #1a1a2e; border-radius: 16px; padding: 40px; max-width: 520px; text-align: center; border: 1px solid #e74c3c33; }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h1 { color: #e74c3c; font-size: 24px; margin-bottom: 8px; }
          p { color: #888; line-height: 1.6; }
          .error-detail { background: #0d1117; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-family: 'Fira Code', monospace; font-size: 13px; color: #f97583; word-break: break-all; border: 1px solid #30363d; text-align: left; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">❌</div>
          <h1>Token Exchange Failed</h1>
          <p>Failed to exchange the authorization code for an access token.</p>
          <div class="error-detail">${error.response?.data?.message || error.message || "Unknown error"}</div>
          <p style="margin-top: 20px; color: #666;">Please try the admin login flow again.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ─── GET /status — Check auth status ────────────────────────────────────────────

router.get("/status", (_req: Request, res: Response) => {
  res.json({
    success: true,
    authenticated: isAuthenticated(),
    connected: isFeedConnected(),
  });
});

// ─── GET /logout — Clear token ──────────────────────────────────────────────────

router.get("/logout", (_req: Request, res: Response) => {
  clearToken();
  res.json({ success: true, message: "Logged out from Upstox" });
});

// ─── GET /quotes — Fetch market quotes ──────────────────────────────────────────

router.get("/quotes", async (req: Request, res: Response) => {
  try {
    const { symbols } = req.query;
    if (!symbols || typeof symbols !== "string") {
      res.json({ success: true, data: [] });
      return;
    }

    const requested = symbols.split(",");
    const resultQuotes: any[] = [];

    const { livePriceCache } = require("../services/upstoxWebSocket");
    const { STOCK_INSTRUMENTS } = require("../config/instruments");

    for (const sym of requested) {
      let symbolUpper = sym.toUpperCase();
      if (symbolUpper.includes("|") || symbolUpper.includes(":")) {
        const parts = symbolUpper.split(/[|:]/);
        const key = symbolUpper;
        const resolvedSymbol = Object.keys(STOCK_INSTRUMENTS).find(
          k => STOCK_INSTRUMENTS[k].instrumentKey === key
        );
        symbolUpper = resolvedSymbol || parts[parts.length - 1];
      }

      let quote = livePriceCache[symbolUpper];
      if (!quote) {
        const yahooSymbol = symbolUpper === "NIFTY" ? "^NSEI" : symbolUpper === "SENSEX" ? "^BSESN" : symbolUpper === "BANKNIFTY" ? "^NSEBANK" : `${symbolUpper}.NS`;
        const { getYahooPrice } = require("../services/upstoxWebSocket");
        const data = await getYahooPrice(yahooSymbol);
        
        const info = STOCK_INSTRUMENTS[symbolUpper];
        if (data) {
          livePriceCache[symbolUpper] = {
            symbol: symbolUpper,
            companyName: info?.companyName || `${symbolUpper} Ltd`,
            instrumentKey: info?.instrumentKey || `NSE_EQ|${symbolUpper}`,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            isPositive: data.change >= 0,
            volume: 100000,
            open: data.price - data.change,
            high: data.price,
            low: data.price,
            close: data.price - data.change,
            timestamp: Date.now()
          };
          quote = livePriceCache[symbolUpper];
        }
      }

      if (quote) {
        resultQuotes.push({
          symbol: quote.symbol,
          companyName: quote.companyName,
          instrumentKey: quote.instrumentKey,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          isPositive: quote.isPositive,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close,
          volume: quote.volume,
          timestamp: quote.timestamp
        });
      } else {
        resultQuotes.push({
          symbol: symbolUpper,
          companyName: `${symbolUpper} Ltd`,
          instrumentKey: `NSE_EQ|${symbolUpper}`,
          price: 150.00,
          change: 0.00,
          changePercent: 0.00,
          isPositive: true
        });
      }
    }

    res.json({ success: true, data: resultQuotes });
  } catch (error: any) {
    console.error("Quotes error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch quotes",
    });
  }
});

// ─── GET /search — Live autocomplete instrument search ──────────────────────────

router.get("/search", async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({
      success: false,
      error: "Not authenticated with Upstox. Please login first.",
    });
    return;
  }

  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.json({ success: true, data: [] });
      return;
    }

    const token = await getAccessToken();
    const searchResponse = await axios.get(
      "https://api.upstox.com/v2/instruments/search",
      {
        params: { query: q, exchanges: "NSE,BSE" },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const items = searchResponse.data?.data || [];
    if (items.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    // De-duplicate by trading symbol to prevent double NSE/BSE entries in autocomplete
    const uniqueItems: any[] = [];
    const seenSymbols = new Set<string>();

    for (const item of items) {
      const symbol = item.trading_symbol.toUpperCase();
      if (!seenSymbols.has(symbol)) {
        seenSymbols.add(symbol);
        uniqueItems.push(item);
      }
    }

    // Limit to top 8 and extract instrument keys
    const topItems = uniqueItems.slice(0, 8);
    const instrumentKeys = topItems.map((item: any) => item.instrument_key);

    // Fetch live quotes for these items in batch
    const quotes = await fetchMarketQuotes(instrumentKeys);
    const quotesMap = new Map<string, any>();
    quotes.forEach((q) => {
      quotesMap.set(q.symbol.toUpperCase(), q);
    });

    // Merge search items with live quote data
    const results = topItems.map((item: any) => {
      const symbol = item.trading_symbol.toUpperCase();
      const quote = quotesMap.get(symbol);
      const stockInfo = STOCK_INSTRUMENTS[symbol];

      return {
        symbol: item.trading_symbol,
        companyName: stockInfo?.companyName || item.name || item.short_name || item.trading_symbol,
        instrumentKey: item.instrument_key,
        price: quote ? quote.price : 350.0,
        change: quote ? quote.change : 0.0,
        changePercent: quote ? quote.changePercent : 0.0,
        isPositive: quote ? quote.isPositive : true,
        domain: stockInfo?.domain,
        logoColor: stockInfo?.logoColor || "#4B5563",
      };
    });

    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Search API error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to search instruments",
    });
  }
});

// ─── GET /indices — Fetch market indices ────────────────────────────────────────

router.get("/indices", async (_req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({
      success: false,
      error: "Not authenticated with Upstox. Please login first.",
    });
    return;
  }

  try {
    const indices = await fetchMarketIndices();
    res.json({ success: true, data: indices });
  } catch (error: any) {
    console.error("Indices error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch indices",
    });
  }
});

// ─── GET /top-gainers ───────────────────────────────────────────────────────────

router.get("/top-gainers", async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({
      success: false,
      error: "Not authenticated with Upstox",
    });
    return;
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const gainers = await fetchTopGainers(limit);
    res.json({ success: true, data: gainers });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch top gainers",
    });
  }
});

// ─── GET /top-losers ────────────────────────────────────────────────────────────

router.get("/top-losers", async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({
      success: false,
      error: "Not authenticated with Upstox",
    });
    return;
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const losers = await fetchTopLosers(limit);
    res.json({ success: true, data: losers });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch top losers",
    });
  }
});

// ─── GET /volume-shockers ───────────────────────────────────────────────────────

router.get("/volume-shockers", async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({
      success: false,
      error: "Not authenticated with Upstox",
    });
    return;
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const shockers = await fetchVolumeShockers(limit);
    res.json({ success: true, data: shockers });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch volume shockers",
    });
  }
});

// ─── GET /historical-chart ─────────────────────────────────────────────────────

router.get("/historical-chart", async (req: Request, res: Response) => {
  const { symbol, interval, range } = req.query;

  if (!symbol || typeof symbol !== "string") {
    res.status(400).json({ success: false, error: "Symbol is required" });
    return;
  }

  const symbolUpper = symbol.toUpperCase();
  
  // Resolve to Yahoo Symbol
  let yahooSymbol = `${symbolUpper}.NS`;
  if (symbolUpper === "NIFTY") yahooSymbol = "^NSEI";
  else if (symbolUpper === "SENSEX") yahooSymbol = "^BSESN";
  else if (symbolUpper === "BANKNIFTY") yahooSymbol = "^NSEBANK";
  else if (symbolUpper === "MIDCPNIFTY") yahooSymbol = "NIFTY_MID_SELECT.NS";
  else if (symbolUpper === "FINNIFTY") yahooSymbol = "NIFTY_FIN_SERVICE.NS";

  const queryInterval = (interval as string) || "5m";
  const queryRange = (range as string) || "1d";

  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`,
      {
        params: {
          interval: queryInterval,
          range: queryRange,
        },
        timeout: 5000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }
    );

    const result = response.data?.chart?.result?.[0];
    if (!result) {
      throw new Error("No data returned from Yahoo Finance");
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const candles: any[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] === null || closes[i] === undefined) continue;

      const timePoint = new Date(timestamps[i] * 1000);
      let label = "";
      
      if (queryInterval.endsWith("m") || queryInterval.endsWith("h")) {
        label = timePoint.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      } else {
        label = timePoint.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      }

      candles.push({
        x: label,
        open: parseFloat((opens[i] || closes[i]).toFixed(2)),
        high: parseFloat((highs[i] || closes[i]).toFixed(2)),
        low: parseFloat((lows[i] || closes[i]).toFixed(2)),
        close: parseFloat(closes[i].toFixed(2)),
        volume: volumes[i] || 0,
        timestamp: timestamps[i] * 1000
      });
    }

    res.json({ success: true, data: candles });
  } catch (error: any) {
    console.error(`❌ Failed to fetch historical chart for ${symbol}:`, error.message);
    res.json({ success: true, data: [] });
  }
});

export { router as upstoxRoutes };

