import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  getUpstoxStatus,
  getMarketQuotes,
  getMarketIndices,
  UpstoxStockQuote,
  UpstoxIndexQuote,
} from "../lib/upstoxApi";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export const useMarketData = (symbolsToTrack?: string[]) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // States for stock data and index data
  const [stocks, setStocks] = useState<Record<string, UpstoxStockQuote>>({});
  const [indices, setIndices] = useState<Record<string, UpstoxIndexQuote>>({});

  // Use refs to store the latest values for in-memory batching updates
  const stocksRef = useRef<Record<string, UpstoxStockQuote>>({});
  const indicesRef = useRef<Record<string, UpstoxIndexQuote>>({});
  const pendingUpdatesRef = useRef<{
    stocks: Record<string, UpstoxStockQuote>;
    indices: Record<string, UpstoxIndexQuote>;
  }>({ stocks: {}, indices: {} });

  const socketRef = useRef<Socket | null>(null);
  const flushIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    const initData = async () => {
      // 1. Check if authenticated
      const status = await getUpstoxStatus();
      if (!active) return;
      setIsAuthenticated(status.authenticated);
      setIsConnected(status.connected);

      if (status.authenticated) {
        // 2. Fetch initial snapshot from REST APIs
        const initialIndices = await getMarketIndices();
        const initialQuotes = await getMarketQuotes(symbolsToTrack);
        if (!active) return;

        // Map initial indices
        const indicesMap: Record<string, UpstoxIndexQuote> = {};
        initialIndices.forEach((ind) => {
          indicesMap[ind.name] = ind;
        });
        indicesRef.current = indicesMap;
        setIndices(indicesMap);

        // Map initial stocks
        const stocksMap: Record<string, UpstoxStockQuote> = {};
        initialQuotes.forEach((stock) => {
          stocksMap[stock.symbol] = stock;
        });
        stocksRef.current = stocksMap;
        setStocks(stocksMap);

        // 3. Connect Socket.IO client (Requirement 2.2)
        const socket = io(BACKEND_URL, {
          transports: ["websocket", "polling"],
          withCredentials: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("🔌 Connected to market data socket server");
          // Tell server we want to receive live updates
          socket.emit("upstox:subscribe");
        });

        // Handle full cache snapshot on load
        socket.on("market:snapshot", (snapshot: UpstoxStockQuote[]) => {
          const snapshotMap: Record<string, UpstoxStockQuote> = {};
          snapshot.forEach((stock) => {
            snapshotMap[stock.symbol] = stock;
          });
          stocksRef.current = { ...stocksRef.current, ...snapshotMap };
          setStocks((prev) => ({ ...prev, ...snapshotMap }));
        });

        // Listen to live ticks (Requirement 2.3 - buffer to avoid over-rendering)
        socket.on("market:tick", (tick: UpstoxStockQuote) => {
          pendingUpdatesRef.current.stocks[tick.symbol] = tick;
        });

        // Listen to live index updates
        socket.on("market:indices", (indexUpdates: UpstoxIndexQuote[]) => {
          indexUpdates.forEach((ind) => {
            pendingUpdatesRef.current.indices[ind.name] = ind;
          });
        });

        // Listen to connection/auth updates
        socket.on("upstox:status", (status: { connected: boolean; authenticated: boolean }) => {
          setIsConnected(status.connected);
          setIsAuthenticated(status.authenticated);
        });

        // 4. Set up batching flush timer (flushes updates every 300ms) (Requirement 2.3)
        flushIntervalRef.current = setInterval(() => {
          const hasStockUpdates = Object.keys(pendingUpdatesRef.current.stocks).length > 0;
          const hasIndexUpdates = Object.keys(pendingUpdatesRef.current.indices).length > 0;

          if (hasStockUpdates || hasIndexUpdates) {
            if (hasStockUpdates) {
              const updatedStocks = { ...stocksRef.current, ...pendingUpdatesRef.current.stocks };
              stocksRef.current = updatedStocks;
              setStocks(updatedStocks);
              pendingUpdatesRef.current.stocks = {};
            }

            if (hasIndexUpdates) {
              const updatedIndices = { ...indicesRef.current, ...pendingUpdatesRef.current.indices };
              indicesRef.current = updatedIndices;
              setIndices(updatedIndices);
              pendingUpdatesRef.current.indices = {};
            }
          }
        }, 300);
      }
    };

    initData();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }
    };
  }, [symbolsToTrack]);

  // Transform states to lists for ease of use in UI
  const stockList = Object.values(stocks);
  const indexList = Object.values(indices);

  // Return helper lists matching mockData structure for quick swaps
  const gainers = stockList
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent);

  const losers = stockList
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent);

  const volumeShockers = stockList
    .filter((s) => s.volume > 0)
    .sort((a, b) => b.volume - a.volume);

  return {
    isAuthenticated,
    isConnected,
    stocks,
    indices,
    stockList,
    indexList,
    gainers,
    losers,
    volumeShockers,
    socket: socketRef.current,
  };
};
