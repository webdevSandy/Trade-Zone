"use client";

import React from "react";
import DonutChart from "./charts/DonutChart";
import { portfolioMetrics, portfolioDistribution, formatCurrency } from "@/lib/mockData";

const YourInvestment: React.FC = () => {
  const hasInvestments = true; // Toggle to show/hide investment data

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      <div className="p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Your investments
        </h3>

        {hasInvestments ? (
          <div className="space-y-5">
            {/* Portfolio Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Current value
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(portfolioMetrics.currentValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Invested amount
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {formatCurrency(portfolioMetrics.investedAmount)}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-border-light"></div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Total returns
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-positive">
                    +{formatCurrency(portfolioMetrics.totalReturns)}
                  </span>
                  <span className="text-xs text-positive ml-1.5">
                    (+{portfolioMetrics.totalReturnsPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">1D returns</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-positive">
                    +{formatCurrency(portfolioMetrics.oneDayReturns)}
                  </span>
                  <span className="text-xs text-positive ml-1.5">
                    (+{portfolioMetrics.oneDayReturnsPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="pt-2">
              <DonutChart
                data={portfolioDistribution}
                width={220}
                height={240}
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-32 h-32 mb-4 rounded-2xl bg-surface flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-violet-100 flex items-center justify-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-brand-primary"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-text-secondary font-medium">
              You haven&apos;t invested yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourInvestment;
