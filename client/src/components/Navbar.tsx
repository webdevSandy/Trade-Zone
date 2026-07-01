"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";

const Navbar: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="#"
                className="px-3 py-2 text-sm font-semibold text-text-primary hover:bg-surface rounded-md transition-smooth"
              >
                Stocks
              </a>
              <a
                href="#"
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-smooth"
              >
                F&O
              </a>
              <a
                href="#"
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-smooth"
              >
                Mutual Funds
              </a>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div
              className={`relative flex items-center border rounded-lg px-3 py-2 transition-smooth ${
                searchFocused
                  ? "border-brand-primary shadow-[0_0_0_2px_rgba(0,179,134,0.15)]"
                  : "border-border bg-surface"
              }`}
            >
              <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Groww...."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-border rounded text-[10px] text-text-muted font-medium ml-2 flex-shrink-0">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-smooth">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full"></span>
            </button>

            {/* Profile Avatar */}
            <button className="flex items-center gap-2 p-1 hover:bg-surface rounded-lg transition-smooth">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center ring-2 ring-white">
                <span className="text-white text-xs font-semibold">RS</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
