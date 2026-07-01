import { Router, Request, Response } from "express";
import type { ApiResponse } from "../types";

const router = Router();

interface HoldingData {
  id: string;
  userId: string;
  stockSymbol: string;
  companyName: string;
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

// GET /api/holdings/:userId
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<ApiResponse<HoldingData[]>>) => {
  try {
    const { userId } = req.params;

    const mockHoldings: HoldingData[] = [
      {
        id: "hld_001",
        userId,
        stockSymbol: "RELIANCE",
        companyName: "Reliance Industries Ltd",
        totalQuantity: 10,
        averageBuyPrice: 2934.50,
        currentPrice: 2987.30,
        pnl: 528.00,
        pnlPercent: 1.80,
      },
      {
        id: "hld_002",
        userId,
        stockSymbol: "TCS",
        companyName: "Tata Consultancy Services",
        totalQuantity: 5,
        averageBuyPrice: 3890.75,
        currentPrice: 4102.60,
        pnl: 1059.25,
        pnlPercent: 5.44,
      },
      {
        id: "hld_003",
        userId,
        stockSymbol: "HDFCBANK",
        companyName: "HDFC Bank Ltd",
        totalQuantity: 20,
        averageBuyPrice: 1645.30,
        currentPrice: 1678.90,
        pnl: 672.00,
        pnlPercent: 2.04,
      },
    ];

    res.json({ success: true, data: mockHoldings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch holdings";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as holdingRoutes };
