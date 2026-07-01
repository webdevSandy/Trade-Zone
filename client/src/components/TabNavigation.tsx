"use client";

import React, { useState } from "react";
import { Monitor } from "lucide-react";
import type { TabType } from "@/lib/types";

const tabs: { id: TabType; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "holdings", label: "Holdings" },
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Orders" },
  { id: "watchlist", label: "Watchlist" },
];

const TabNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("explore");

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Tab Links */}
          <div className="flex items-center gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium transition-smooth ${
                  activeTab === tab.id
                    ? "text-text-primary tab-active"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Terminal & Market Status */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-smooth">
              <Monitor className="w-4 h-4" />
              <span className="font-medium">Terminal</span>
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1">
              <div className="w-2 h-2 rounded-full bg-positive animate-pulse"></div>
              <span className="text-xs font-medium text-text-secondary">
                9:15
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
