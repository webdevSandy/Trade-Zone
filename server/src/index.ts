import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { upstoxRoutes } from "./routes/upstoxRoutes";
import { authRoutes } from "./routes/authRoutes";
import { portfolioRoutes } from "./routes/portfolioRoutes";
import { initSocketIO, connectToUpstoxFeed, isFeedConnected } from "./services/upstoxWebSocket";
import { initAppConfigTable, getConfigValue } from "./lib/neonDb";
import { loadTokenFromDb, isAuthenticated } from "./services/upstoxService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ─── Create HTTP Server (needed for Socket.IO) ─────────────────────────────────

const httpServer = createServer(app);

// ─── Initialize Socket.IO ───────────────────────────────────────────────────────

initSocketIO(httpServer);

// ─── Middleware ─────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging (Morgan) ───────────────────────────────────────────────────
// Logs all HTTP requests in a concise, color-coded format.
// In production, switch to 'combined' for full Apache-style logs.

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Global Rate Limiter ────────────────────────────────────────────────────────
// Prevents brute-force and DDoS attacks. 100 requests per 15 minutes per IP.

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // allow 10k requests in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again after 15 minutes.",
  },
});

app.use("/api/", globalLimiter);

// ─── Strict Rate Limiter for Admin Routes ───────────────────────────────────────
// Admin login route gets a tighter limit: 5 attempts per 15 minutes.

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many admin login attempts. Please try again after 15 minutes.",
  },
});

app.use("/api/upstox/admin-login", adminLimiter);

// ─── Health Check (Enhanced) ────────────────────────────────────────────────────

const serverStartTime = Date.now();

app.get("/api/health", (_req, res) => {
  const uptimeMs = Date.now() - serverStartTime;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  res.json({
    success: true,
    message: "TradAdda API is running",
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    upstoxAuthenticated: isAuthenticated(),
    upstoxFeedConnected: isFeedConnected(),
    environment: process.env.NODE_ENV || "development",
    memoryUsage: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
  });
});

// ─── Token Status Endpoint ──────────────────────────────────────────────────────
// Returns when the token was last updated (without exposing the token itself).

app.get("/api/upstox/token-info", async (_req, res) => {
  try {
    const result = await (await import("./lib/neonDb")).neonPool.query(
      "SELECT updated_at FROM app_config WHERE key_name = $1",
      ["upstox_access_token"]
    );

    if (result.rows.length === 0) {
      res.json({
        success: true,
        tokenStored: false,
        message: "No token found in database. Admin login required.",
      });
      return;
    }

    const updatedAt = result.rows[0].updated_at;
    const ageMs = Date.now() - new Date(updatedAt).getTime();
    const ageHours = Math.round(ageMs / (1000 * 60 * 60) * 10) / 10;

    res.json({
      success: true,
      tokenStored: true,
      isActive: isAuthenticated(),
      lastUpdated: updatedAt,
      ageHours: ageHours,
      message: ageHours > 18
        ? "⚠️ Token may have expired. Admin re-login recommended."
        : `✅ Token is ${ageHours}h old. Valid for ~${Math.round(18 - ageHours)}h more.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch token info: " + error.message,
    });
  }
});

// ─── API Routes ─────────────────────────────────────────────────────────────────

app.use("/api/upstox", upstoxRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────────
// Catches any unhandled errors thrown in routes/middleware.
// Prevents the server from crashing on unexpected exceptions.

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("💥 Unhandled error:", err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // Step 1: Initialize the app_config table in Neon PostgreSQL
    await initAppConfigTable();

    // Step 2: Load persisted access token from the database into memory
    await loadTokenFromDb();
  } catch (error: any) {
    console.error("⚠️ Startup initialization warning:", error.message);
    console.log("⚠️ Server will continue without DB-backed token persistence");
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 TradAdda server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Token info: http://localhost:${PORT}/api/upstox/token-info`);
    console.log(`📡 Socket.IO ready for real-time connections`);

    // Auto-connect to live feed if a token is available (env var OR database)
    if (isAuthenticated()) {
      console.log("🔑 Access token detected. Starting live feed...");
      connectToUpstoxFeed().catch((err) => {
        console.error("❌ Auto-connection to Upstox feed failed:", err);
      });
    }
  });
};

startServer();

export default app;
