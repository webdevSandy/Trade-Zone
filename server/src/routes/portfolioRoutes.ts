import { Router, Response } from "express";
import { prisma } from "../lib/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { fetchMarketQuotes, isAuthenticated } from "../services/upstoxService";

const router = Router();

// ─── Fallback Mock Prices (for when Upstox is disconnected) ─────────────────────
const MOCK_PRICES: Record<string, number> = {
  RELIANCE: 2987.30,
  TCS: 4102.60,
  INFY: 1678.90,
  HDFCBANK: 1645.30,
  TATAMOTORS: 992.15,
  SBIN: 805.60,
  SUZLON: 62.80,
  IRFC: 148.35,
  NHPC: 89.45,
  TATAPOWER: 412.60,
  PAYTM: 485.20,
  YESBANK: 22.45,
  IDEA: 8.75,
};

// ─── Helper: Get Current Stock Price ─────────────────────────────────────────────
// Resolves prices from Upstox API or falls back to static dictionary
// ─────────────────────────────────────────────────────────────────────────────────
const getStockPrices = async (symbols: string[]): Promise<Record<string, number>> => {
  const prices: Record<string, number> = {};
  
  // Set default fallback values
  symbols.forEach(sym => {
    prices[sym] = MOCK_PRICES[sym.toUpperCase()] || 150.0;
  });

  if (symbols.length === 0) return prices;

  // Try to load live quotes if connected to Upstox
  if (isAuthenticated()) {
    try {
      const quotes = await fetchMarketQuotes(symbols);
      quotes.forEach(q => {
        if (q.price > 0) {
          prices[q.symbol.toUpperCase()] = q.price;
        }
      });
    } catch (error: any) {
      console.warn("⚠️ Failed to resolve live quotes for portfolio, using mock fallbacks:", error.message);
    }
  }

  return prices;
};

// ─── Helper: Determine Cap Size (for Donut Chart Distribution) ──────────────────
// Maps stock symbols to cap size categories
// ─────────────────────────────────────────────────────────────────────────────────
const getCapCategory = (symbol: string): "Large Cap" | "Mid Cap" | "Small Cap" => {
  const sym = symbol.toUpperCase();
  const largeCaps = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "SBIN"];
  const midCaps = ["TATAMOTORS", "TATAPOWER", "IRFC", "PAYTM"];
  
  if (largeCaps.includes(sym)) return "Large Cap";
  if (midCaps.includes(sym)) return "Mid Cap";
  return "Small Cap"; // Default fallbacks (Suzlon, YesBank, Idea, etc.)
};

// ─── GET /api/portfolio/holdings ────────────────────────────────────────────────
// Fetches the user's stock holdings merged with current market valuations.
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/holdings", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Fetch user holdings
    const holdings = await prisma.holding.findMany({
      where: { userId },
      orderBy: { stockSymbol: "asc" },
    });

    if (holdings.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    // Resolve current prices
    const symbols = holdings.map(h => h.stockSymbol);
    const prices = await getStockPrices(symbols);

    // Format output
    const formattedHoldings = holdings.map(h => {
      const currentPrice = prices[h.stockSymbol.toUpperCase()] || Number(h.averageBuyPrice);
      const investedValue = Number(h.totalQuantity) * Number(h.averageBuyPrice);
      const currentValue = Number(h.totalQuantity) * currentPrice;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

      return {
        id: h.id,
        stockSymbol: h.stockSymbol,
        companyName: h.stockSymbol + " Ltd",
        totalQuantity: h.totalQuantity,
        averageBuyPrice: Number(h.averageBuyPrice),
        currentPrice,
        pnl,
        pnlPercent,
      };
    });

    res.json({ success: true, data: formattedHoldings });
  } catch (error: any) {
    console.error("❌ Get holdings error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch stock holdings." });
  }
});

// ─── GET /api/portfolio/summary ─────────────────────────────────────────────────
// Returns aggregated user portfolio stats (Invested, Current Value, P&L, Allocation).
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/summary", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Load user wallet & holdings
    const userWithWalletAndHoldings = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        holdings: true,
      },
    });

    if (!userWithWalletAndHoldings) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }

    const walletBalance = Number(userWithWalletAndHoldings.wallet?.balance || 0);
    const holdings = userWithWalletAndHoldings.holdings;

    if (holdings.length === 0) {
      res.json({
        success: true,
        data: {
          currentValue: 0,
          investedAmount: 0,
          totalReturns: 0,
          totalReturnsPercent: 0,
          oneDayReturns: 0,
          oneDayReturnsPercent: 0,
          walletBalance,
          distribution: [],
        },
      });
      return;
    }

    // Fetch current prices
    const symbols = holdings.map(h => h.stockSymbol);
    const prices = await getStockPrices(symbols);

    let totalInvested = 0;
    let totalCurrent = 0;

    // Distribution categories
    const capDistribution: Record<string, number> = {
      "Large Cap": 0,
      "Mid Cap": 0,
      "Small Cap": 0,
    };

    holdings.forEach(h => {
      const currentPrice = prices[h.stockSymbol.toUpperCase()] || Number(h.averageBuyPrice);
      const investedVal = Number(h.totalQuantity) * Number(h.averageBuyPrice);
      const currentVal = Number(h.totalQuantity) * currentPrice;

      totalInvested += investedVal;
      totalCurrent += currentVal;

      const category = getCapCategory(h.stockSymbol);
      capDistribution[category] += currentVal;
    });

    const totalReturns = totalCurrent - totalInvested;
    const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Map distribution to UI structure
    const colorsMap = {
      "Large Cap": "#4F46E5",
      "Mid Cap": "#06B6D4",
      "Small Cap": "#F59E0B",
    };

    const distribution = Object.entries(capDistribution)
      .filter(([_, val]) => val > 0)
      .map(([label, val]) => {
        const percentage = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0;
        return {
          label,
          value: Math.round(percentage),
          color: colorsMap[label as keyof typeof colorsMap] || "#8B5CF6",
        };
      });

    res.json({
      success: true,
      data: {
        currentValue: totalCurrent,
        investedAmount: totalInvested,
        totalReturns,
        totalReturnsPercent,
        oneDayReturns: totalReturns * 0.05, // Mock 1D returns for display
        oneDayReturnsPercent: totalReturnsPercent * 0.05,
        walletBalance,
        distribution,
      },
    });
  } catch (error: any) {
    console.error("❌ Get summary error:", error.message);
    res.status(500).json({ success: false, error: "Failed to load portfolio metrics summary." });
  }
});

// ─── POST /api/portfolio/order ──────────────────────────────────────────────────
// Places a mock buy/sell trade. Updates user wallet and stock holdings/positions.
// ─────────────────────────────────────────────────────────────────────────────────
router.post("/order", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { stockSymbol, orderType, quantity, executionPrice, isIntraday } = req.body;

    if (!stockSymbol || !orderType || !quantity || !executionPrice) {
      res.status(400).json({
        success: false,
        error: "Missing required fields (stockSymbol, orderType, quantity, executionPrice).",
      });
      return;
    }

    const tradeSymbol = stockSymbol.toUpperCase().trim();
    const tradeQty = parseInt(quantity);
    const tradePrice = parseFloat(executionPrice);
    const tradeIntraday = !!isIntraday;

    if (isNaN(tradeQty) || tradeQty <= 0) {
      res.status(400).json({ success: false, error: "Quantity must be a positive integer." });
      return;
    }
    if (isNaN(tradePrice) || tradePrice <= 0) {
      res.status(400).json({ success: false, error: "Execution price must be positive." });
      return;
    }

    if (orderType !== "BUY" && orderType !== "SELL") {
      res.status(400).json({ success: false, error: "Order type must be BUY or SELL." });
      return;
    }

    // ── Execute Trade inside a Transaction ──────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new Error("User trading wallet not found.");

      const orderValue = tradeQty * tradePrice;

      if (orderType === "BUY") {
        // A. Verify Wallet Balance
        if (Number(wallet.balance) < orderValue) {
          throw new Error(`Insufficient wallet balance. Needed: ₹${orderValue.toLocaleString("en-IN")}, Available: ₹${Number(wallet.balance).toLocaleString("en-IN")}`);
        }

        // B. Deduct funds from wallet
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: { balance: { decrement: orderValue } },
        });

        let updatedHoldingOrPosition;

        if (tradeIntraday) {
          // Intraday Positions Flow
          const existingPosition = await tx.position.findFirst({
            where: { userId: userId!, stockSymbol: tradeSymbol, isIntraday: true },
          });

          if (existingPosition) {
            const oldQty = existingPosition.quantity;
            const oldAvgPrice = Number(existingPosition.entryPrice);
            const newQty = oldQty + tradeQty;
            const newAvgPrice = ((oldQty * oldAvgPrice) + orderValue) / newQty;

            updatedHoldingOrPosition = await tx.position.update({
              where: { id: existingPosition.id },
              data: {
                quantity: newQty,
                entryPrice: newAvgPrice,
              },
            });
          } else {
            updatedHoldingOrPosition = await tx.position.create({
              data: {
                userId: userId!,
                stockSymbol: tradeSymbol,
                quantity: tradeQty,
                entryPrice: tradePrice,
                isIntraday: true,
              },
            });
          }
        } else {
          // Delivery Holdings Flow
          const existingHolding = await tx.holding.findUnique({
            where: {
              userId_stockSymbol: { userId: userId!, stockSymbol: tradeSymbol },
            },
          });

          if (existingHolding) {
            const oldQty = existingHolding.totalQuantity;
            const oldAvgPrice = Number(existingHolding.averageBuyPrice);
            const newQty = oldQty + tradeQty;
            const newAvgPrice = ((oldQty * oldAvgPrice) + orderValue) / newQty;

            updatedHoldingOrPosition = await tx.holding.update({
              where: { id: existingHolding.id },
              data: {
                totalQuantity: newQty,
                averageBuyPrice: newAvgPrice,
              },
            });
          } else {
            updatedHoldingOrPosition = await tx.holding.create({
              data: {
                userId: userId!,
                stockSymbol: tradeSymbol,
                totalQuantity: tradeQty,
                averageBuyPrice: tradePrice,
              },
            });
          }
        }

        // D. Create Order record
        const order = await tx.order.create({
          data: {
            userId: userId!,
            stockSymbol: tradeSymbol,
            orderType: "BUY",
            quantity: tradeQty,
            executionPrice: tradePrice,
            status: "EXECUTED",
          },
        });

        return { wallet: updatedWallet, asset: updatedHoldingOrPosition, order };
      } else {
        // SELL Flow
        let updatedHoldingOrPosition = null;

        if (tradeIntraday) {
          // Intraday Sell
          const existingPosition = await tx.position.findFirst({
            where: { userId: userId!, stockSymbol: tradeSymbol, isIntraday: true },
          });

          if (!existingPosition || existingPosition.quantity < tradeQty) {
            throw new Error(`Insufficient positions. You hold ${existingPosition?.quantity || 0} shares of ${tradeSymbol} intraday, cannot sell ${tradeQty}.`);
          }

          // Add funds to wallet
          const updatedWallet = await tx.wallet.update({
            where: { userId },
            data: { balance: { increment: orderValue } },
          });

          const newQty = existingPosition.quantity - tradeQty;
          if (newQty === 0) {
            await tx.position.delete({ where: { id: existingPosition.id } });
          } else {
            updatedHoldingOrPosition = await tx.position.update({
              where: { id: existingPosition.id },
              data: { quantity: newQty },
            });
          }

          const order = await tx.order.create({
            data: {
              userId: userId!,
              stockSymbol: tradeSymbol,
              orderType: "SELL",
              quantity: tradeQty,
              executionPrice: tradePrice,
              status: "EXECUTED",
            },
          });

          return { wallet: updatedWallet, asset: updatedHoldingOrPosition, order };
        } else {
          // Delivery Sell
          const existingHolding = await tx.holding.findUnique({
            where: {
              userId_stockSymbol: { userId: userId!, stockSymbol: tradeSymbol },
            },
          });

          if (!existingHolding || existingHolding.totalQuantity < tradeQty) {
            throw new Error(`Insufficient holdings. You hold ${existingHolding?.totalQuantity || 0} shares of ${tradeSymbol}, cannot sell ${tradeQty}.`);
          }

          // Add funds to wallet
          const updatedWallet = await tx.wallet.update({
            where: { userId },
            data: { balance: { increment: orderValue } },
          });

          const newQty = existingHolding.totalQuantity - tradeQty;
          if (newQty === 0) {
            await tx.holding.delete({ where: { id: existingHolding.id } });
          } else {
            updatedHoldingOrPosition = await tx.holding.update({
              where: { id: existingHolding.id },
              data: { totalQuantity: newQty },
            });
          }

          const order = await tx.order.create({
            data: {
              userId: userId!,
              stockSymbol: tradeSymbol,
              orderType: "SELL",
              quantity: tradeQty,
              executionPrice: tradePrice,
              status: "EXECUTED",
            },
          });

          return { wallet: updatedWallet, asset: updatedHoldingOrPosition, order };
        }
      }
    });

    res.status(201).json({
      success: true,
      message: `${orderType} order executed successfully!`,
      walletBalance: Number(result.wallet.balance),
      asset: result.asset,
    });
  } catch (error: any) {
    console.error("❌ Place order error:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to process order transaction.",
    });
  }
});

// ─── GET /api/portfolio/orders ──────────────────────────────────────────────────
// Returns user order placement history
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });
    res.json({
      success: true,
      data: orders.map(o => ({
        ...o,
        executionPrice: Number(o.executionPrice),
      })),
    });
  } catch (error: any) {
    console.error("❌ Get orders error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch order history." });
  }
});

// ─── GET /api/portfolio/positions ───────────────────────────────────────────────
// Returns user active intraday trading positions
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/positions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const positions = await prisma.position.findMany({
      where: { userId },
      orderBy: { stockSymbol: "asc" },
    });

    if (positions.length === 0) {
      res.json({ success: true, data: [] });
      return;
    }

    const symbols = positions.map(p => p.stockSymbol);
    const prices = await getStockPrices(symbols);

    const formatted = positions.map(p => {
      const currentPrice = prices[p.stockSymbol.toUpperCase()] || Number(p.entryPrice);
      const entryValue = p.quantity * Number(p.entryPrice);
      const currentValue = p.quantity * currentPrice;
      const pnl = currentValue - entryValue;
      const pnlPercent = entryValue > 0 ? (pnl / entryValue) * 100 : 0;

      return {
        id: p.id,
        stockSymbol: p.stockSymbol,
        companyName: p.stockSymbol + " Ltd",
        quantity: p.quantity,
        entryPrice: Number(p.entryPrice),
        currentPrice,
        pnl,
        pnlPercent,
        isIntraday: p.isIntraday,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("❌ Get positions error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch positions." });
  }
});

// ─── GET /api/portfolio/watchlist ───────────────────────────────────────────────
// Returns symbols in the user's default watchlist
// ─────────────────────────────────────────────────────────────────────────────────
router.get("/watchlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let watchlist = await prisma.watchlist.findFirst({
      where: { userId },
      include: { stocks: true }
    });

    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: { userId: userId!, name: "My Watchlist" },
        include: { stocks: true }
      });
    }

    const symbols = watchlist.stocks.map(s => s.stockSymbol);
    res.json({ success: true, data: symbols });
  } catch (error: any) {
    console.error("❌ Get watchlist error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch watchlist." });
  }
});

// ─── POST /api/portfolio/watchlist ──────────────────────────────────────────────
// Adds a symbol to the user's watchlist
// ─────────────────────────────────────────────────────────────────────────────────
router.post("/watchlist", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { stockSymbol } = req.body;

    if (!stockSymbol) {
      res.status(400).json({ success: false, error: "Stock symbol is required." });
      return;
    }

    const targetSymbol = stockSymbol.toUpperCase().trim();

    // 1. Get or create watchlist
    let watchlist = await prisma.watchlist.findFirst({
      where: { userId }
    });

    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: { userId: userId!, name: "My Watchlist" }
      });
    }

    // 2. Add stock to watchlist (ignore if already exists)
    await prisma.watchlistStock.upsert({
      where: {
        watchlistId_stockSymbol: {
          watchlistId: watchlist.id,
          stockSymbol: targetSymbol
        }
      },
      create: {
        watchlistId: watchlist.id,
        stockSymbol: targetSymbol
      },
      update: {}
    });

    res.json({ success: true, message: `${targetSymbol} added to watchlist.` });
  } catch (error: any) {
    console.error("❌ Add to watchlist error:", error.message);
    res.status(500).json({ success: false, error: "Failed to add to watchlist." });
  }
});

// ─── DELETE /api/portfolio/watchlist/:symbol ─────────────────────────────────────
// Removes a symbol from the user's watchlist
// ─────────────────────────────────────────────────────────────────────────────────
router.delete("/watchlist/:symbol", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const targetSymbol = (req.params.symbol as string).toUpperCase().trim();

    const watchlist = await prisma.watchlist.findFirst({
      where: { userId }
    });

    if (!watchlist) {
      res.status(404).json({ success: false, error: "Watchlist not found." });
      return;
    }

    await prisma.watchlistStock.delete({
      where: {
        watchlistId_stockSymbol: {
          watchlistId: watchlist.id,
          stockSymbol: targetSymbol
        }
      }
    });

    res.json({ success: true, message: `${targetSymbol} removed from watchlist.` });
  } catch (error: any) {
    console.error("❌ Remove from watchlist error:", error.message);
    res.status(500).json({ success: false, error: "Failed to remove from watchlist." });
  }
});

export { router as portfolioRoutes };
