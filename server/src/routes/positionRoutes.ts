import { Router, Request, Response } from "express";
import type { ApiResponse } from "../types";

const router = Router();

interface PositionData {
  id: string;
  userId: string;
  stockSymbol: string;
  companyName: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  isIntraday: boolean;
  pnl: number;
  pnlPercent: number;
}

// GET /api/positions/:userId
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<ApiResponse<PositionData[]>>) => {
  try {
    const { userId } = req.params;

    const mockPositions: PositionData[] = [
      {
        id: "pos_001",
        userId,
        stockSymbol: "TATAMOTORS",
        companyName: "Tata Motors Ltd",
        quantity: 50,
        entryPrice: 985.40,
        currentPrice: 992.15,
        isIntraday: true,
        pnl: 337.50,
        pnlPercent: 0.69,
      },
      {
        id: "pos_002",
        userId,
        stockSymbol: "SBIN",
        companyName: "State Bank of India",
        quantity: 100,
        entryPrice: 810.25,
        currentPrice: 805.60,
        isIntraday: true,
        pnl: -465.00,
        pnlPercent: -0.57,
      },
    ];

    res.json({ success: true, data: mockPositions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch positions";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as positionRoutes };
