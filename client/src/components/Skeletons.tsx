"use client";

import React from "react";

// ─── Skeleton Primitives ────────────────────────────────────────────────────────
// Reusable shimmer components for building loading states.
// ─────────────────────────────────────────────────────────────────────────────────

const shimmerClass =
  "relative overflow-hidden bg-surface rounded before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

/** A rectangular skeleton block */
export const SkeletonBlock: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ width = "100%", height = "16px", className = "" }) => (
  <div
    className={`${shimmerClass} ${className}`}
    style={{ width, height }}
  />
);

/** A circular skeleton (for avatars/logos) */
export const SkeletonCircle: React.FC<{
  size?: string;
  className?: string;
}> = ({ size = "40px", className = "" }) => (
  <div
    className={`${shimmerClass} !rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

// ─── StockCard Skeleton ─────────────────────────────────────────────────────────

export const StockCardSkeleton: React.FC = () => (
  <div className="flex flex-col min-w-[160px] p-4 border border-border rounded-xl bg-white">
    <SkeletonBlock width="40px" height="40px" className="!rounded-lg mb-3" />
    <SkeletonBlock width="80px" height="14px" className="mb-2" />
    <SkeletonBlock width="60px" height="14px" className="mb-1" />
    <SkeletonBlock width="70px" height="12px" />
  </div>
);

// ─── TopMovers Table Row Skeleton ───────────────────────────────────────────────

export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-border-light last:border-b-0">
    <div className="flex items-center gap-3">
      <SkeletonBlock width="32px" height="32px" className="!rounded-lg" />
      <div className="space-y-1.5">
        <SkeletonBlock width="90px" height="13px" />
        <SkeletonBlock width="60px" height="11px" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <SkeletonBlock width="50px" height="24px" className="!rounded" />
      <div className="text-right space-y-1.5">
        <SkeletonBlock width="65px" height="13px" />
        <SkeletonBlock width="50px" height="11px" />
      </div>
    </div>
  </div>
);

// ─── Full TopMovers Skeleton ────────────────────────────────────────────────────

export const TopMoversSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Most Bought Cards */}
    <div>
      <SkeletonBlock width="220px" height="18px" className="mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <StockCardSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Top Movers Table */}
    <div>
      <SkeletonBlock width="160px" height="18px" className="mb-4" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} width="90px" height="32px" className="!rounded-full" />
        ))}
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

// ─── YourInvestment Skeleton ────────────────────────────────────────────────────

export const InvestmentSkeleton: React.FC = () => (
  <div className="border border-border rounded-xl bg-white overflow-hidden">
    <div className="p-5 space-y-5">
      <SkeletonBlock width="140px" height="18px" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonBlock width="100px" height="14px" />
            <SkeletonBlock width="80px" height="14px" />
          </div>
        ))}
      </div>
      {/* Donut Chart placeholder */}
      <div className="flex justify-center pt-2">
        <SkeletonCircle size="180px" />
      </div>
    </div>
  </div>
);
