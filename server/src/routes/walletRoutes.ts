import { Router, Request, Response } from "express";
import type { ApiResponse, UpdateWalletDto } from "../types";

const router = Router();

interface WalletData {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
}

// GET /api/wallet/:userId
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<ApiResponse<WalletData>>) => {
  try {
    const { userId } = req.params;

    const mockWallet: WalletData = {
      id: "wlt_" + Date.now(),
      userId,
      balance: 245000.50,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: mockWallet });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch wallet";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/wallet/:userId/transaction
router.post("/:userId/transaction", async (
  req: Request<{ userId: string }, object, UpdateWalletDto>,
  res: Response<ApiResponse<WalletData>>
) => {
  try {
    const { userId } = req.params;
    const { amount, type } = req.body;

    const currentBalance = 245000.50;
    const newBalance = type === "DEPOSIT"
      ? currentBalance + amount
      : currentBalance - amount;

    const mockWallet: WalletData = {
      id: "wlt_" + Date.now(),
      userId,
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: mockWallet, message: `${type} of ₹${amount} successful` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transaction failed";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as walletRoutes };
