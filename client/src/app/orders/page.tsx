"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/mockData";
import { History, FileText, CheckCircle2 } from "lucide-react";

interface Order {
  id: string;
  stockSymbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  executionPrice: number;
  status: string;
  timestamp: string;
}

export default function OrdersPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) return;
      setLoading(true);
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${BACKEND_URL}/api/portfolio/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-64 bg-card rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4 text-text-secondary">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-text-primary">Check order history</h2>
        <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
          Please register or sign in to verify your stock transactions history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ─── Orders Table ─────────────────────────────────────────────────────────── */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <History className="w-5 h-5 text-brand-primary" />
            Order Book & Logs ({orders.length})
          </h2>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border-light text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Order Type</th>
                  <th className="p-4 text-right">Quantity</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Total Value</th>
                  <th className="p-4 pr-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-sm">
                {orders.map((o) => {
                  const date = new Date(o.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  const isBuy = o.orderType === "BUY";
                  return (
                    <tr key={o.id} className="hover:bg-surface transition-smooth group">
                      <td className="p-4 pl-6 text-text-secondary font-medium">{date}</td>
                      <td className="p-4">
                        <Link href={`/stock/${o.stockSymbol.toLowerCase()}`}>
                          <span className="font-bold text-text-primary group-hover:text-brand-primary cursor-pointer">
                            {o.stockSymbol}
                          </span>
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isBuy ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"}`}>
                          {o.orderType}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-text-primary">{o.quantity}</td>
                      <td className="p-4 text-right font-medium text-text-primary">{formatCurrency(o.executionPrice)}</td>
                      <td className="p-4 text-right font-bold text-text-primary">{formatCurrency(o.quantity * o.executionPrice)}</td>
                      <td className="p-4 pr-6 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-positive bg-positive-bg border border-positive/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Executed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto text-text-secondary">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">No orders placed yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              You haven&apos;t placed any mock trades. Search for a stock, open its detail page, and make a simulated buy or sell to see logs here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
