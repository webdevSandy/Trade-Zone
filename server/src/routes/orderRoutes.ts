import { Router, Request, Response } from "express";
import type { ApiResponse, CreateOrderDto } from "../types";

const router = Router();

interface OrderData {
  id: string;
  userId: string;
  stockSymbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED";
  timestamp: string;
}

// GET /api/orders/:userId
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<ApiResponse<OrderData[]>>) => {
  try {
    const { userId } = req.params;

    const mockOrders: OrderData[] = [
      {
        id: "ord_001",
        userId,
        stockSymbol: "RELIANCE",
        orderType: "BUY",
        quantity: 10,
        executionPrice: 2934.50,
        status: "EXECUTED",
        timestamp: new Date("2024-12-20T10:30:00").toISOString(),
      },
      {
        id: "ord_002",
        userId,
        stockSymbol: "TCS",
        orderType: "BUY",
        quantity: 5,
        executionPrice: 3890.75,
        status: "EXECUTED",
        timestamp: new Date("2024-12-19T14:15:00").toISOString(),
      },
      {
        id: "ord_003",
        userId,
        stockSymbol: "INFY",
        orderType: "SELL",
        quantity: 15,
        executionPrice: 1567.25,
        status: "PENDING",
        timestamp: new Date().toISOString(),
      },
    ];

    res.json({ success: true, data: mockOrders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/orders/:userId
router.post("/:userId", async (
  req: Request<{ userId: string }, object, CreateOrderDto>,
  res: Response<ApiResponse<OrderData>>
) => {
  try {
    const { userId } = req.params;
    const { stockSymbol, orderType, quantity, executionPrice } = req.body;

    const mockOrder: OrderData = {
      id: "ord_" + Date.now(),
      userId,
      stockSymbol,
      orderType,
      quantity,
      executionPrice,
      status: "PENDING",
      timestamp: new Date().toISOString(),
    };

    res.status(201).json({ success: true, data: mockOrder, message: "Order placed successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as orderRoutes };
