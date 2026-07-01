import { Router, Request, Response } from "express";
import type { ApiResponse, CreateWatchlistDto, AddToWatchlistDto } from "../types";

const router = Router();

interface WatchlistData {
  id: string;
  userId: string;
  name: string;
  stocks: string[];
}

// GET /api/watchlists/:userId
router.get("/:userId", async (req: Request<{ userId: string }>, res: Response<ApiResponse<WatchlistData[]>>) => {
  try {
    const { userId } = req.params;

    const mockWatchlists: WatchlistData[] = [
      {
        id: "wl_001",
        userId,
        name: "My Favourites",
        stocks: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ITC"],
      },
      {
        id: "wl_002",
        userId,
        name: "Banking Stocks",
        stocks: ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK", "AXISBANK"],
      },
    ];

    res.json({ success: true, data: mockWatchlists });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch watchlists";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/watchlists/:userId
router.post("/:userId", async (
  req: Request<{ userId: string }, object, CreateWatchlistDto>,
  res: Response<ApiResponse<WatchlistData>>
) => {
  try {
    const { userId } = req.params;
    const { name, stocks } = req.body;

    const mockWatchlist: WatchlistData = {
      id: "wl_" + Date.now(),
      userId,
      name,
      stocks,
    };

    res.status(201).json({ success: true, data: mockWatchlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create watchlist";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/watchlists/:watchlistId/stocks
router.post("/:watchlistId/stocks", async (
  req: Request<{ watchlistId: string }, object, AddToWatchlistDto>,
  res: Response<ApiResponse<{ message: string }>>
) => {
  try {
    const { stockSymbol } = req.body;
    res.json({ success: true, data: { message: `${stockSymbol} added to watchlist` } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add stock";
    res.status(500).json({ success: false, error: message });
  }
});

export { router as watchlistRoutes };
