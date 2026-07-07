"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Link2, Sun, Moon, LogOut, Wallet, UserCheck, ShieldAlert } from "lucide-react";
import { useMarketDataContext } from "@/context/MarketDataContext";
import { getUpstoxLoginUrl, logoutUpstox, searchInstruments, UpstoxStockQuote } from "@/lib/upstoxApi";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import Link from "next/link";
import { STOCK_METADATA } from "@/lib/instruments";

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [filteredStocks, setFilteredStocks] = useState<UpstoxStockQuote[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { isAuthenticated, isConnected, stockList } = useMarketDataContext();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Authentication Context State
  const { user, logout, updatePan } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  
  interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    isRead: boolean;
    type: "info" | "warning" | "success";
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Welcome to Trade Zone!",
      description: "₹1,00,000 demo credit has been successfully added to your wallet.",
      time: "Just now",
      isRead: false,
      type: "success",
    },
    {
      id: "2",
      title: "PAN Verification Required",
      description: "Link your PAN card to verify compliance with Indian trading standards.",
      time: "1 hour ago",
      isRead: false,
      type: "warning",
    },
    {
      id: "3",
      title: "Market Feed Active",
      description: "Quotes are synced using Yahoo Finance and Upstox API live streams.",
      time: "2 hours ago",
      isRead: true,
      type: "info",
    }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close notification and profile dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced live search fetch from backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStocks([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchInstruments(searchQuery);
        setFilteredStocks(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync theme setting on mount
  useEffect(() => {
    const storedTheme = localStorage.theme;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleConnectUpstox = async () => {
    if (isAuthenticated) {
      const loggedOut = await logoutUpstox();
      if (loggedOut) {
        window.location.reload();
      }
    } else {
      const secret = prompt("Enter Admin Secret to authenticate Upstox:");
      if (secret) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        window.location.href = `${backendUrl}/api/upstox/admin-login?secret=${encodeURIComponent(secret)}`;
      }
    }
  };

  // Helper to extract initials
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Left: Brand & Navigation */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
                <img
                  src="/logo.png"
                  alt="Trade Zone Logo"
                  className="w-16 h-16 object-contain invert dark:invert-100"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <a
                  href="/"
                  className="px-3 py-2 text-lg font-semibold text-text-primary hover:bg-surface rounded-md transition-smooth"
                >
                  Trade zone
                </a>
              </nav>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block relative">
              <div
                className={`relative flex items-center border rounded-lg px-3 py-2 transition-smooth ${searchFocused
                  ? "border-brand-primary shadow-[0_0_0_2px_rgba(0,179,134,0.15)]"
                  : "border-border bg-surface"
                  }`}
              >
                <Search className="w-4 h-4 text-text-muted mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Trade Zone...."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-card border border-border rounded text-[10px] text-text-muted font-medium ml-2 shrink-0">
                  Ctrl+K
                </kbd>
              </div>

              {/* Search Results Dropdown */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-border-light max-h-[320px] overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()} // Prevents blur on click
                >
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <Link
                        key={stock.symbol}
                        href={`/stock/${stock.symbol.toLowerCase()}`}
                        onClick={() => {
                          setSearchQuery("");
                          setSearchFocused(false);
                        }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-surface transition-smooth cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden bg-surface"
                            style={{
                              backgroundColor: !stock.domain && stock.logoColor
                                ? `${stock.logoColor}15`
                                : "#f0f0f0",
                            }}
                          >
                            {stock.domain ? (
                              <img
                                src={`https://www.google.com/s2/favicons?sz=64&domain=${stock.domain}`}
                                alt={stock.companyName}
                                className="w-full h-full object-contain p-1 rounded-full bg-white"
                              />
                            ) : (
                              stock.symbol.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary truncate max-w-[240px]" title={stock.companyName}>
                              {stock.companyName}
                            </p>
                            <p className="text-xs text-text-secondary font-medium uppercase mt-0.5">
                              Stock • {stock.symbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-text-primary">
                            ₹{stock.price.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <p
                            className={`text-xs font-semibold ${
                              stock.isPositive ? "text-positive" : "text-negative"
                            }`}
                          >
                            {stock.isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-text-secondary">
                      No stocks found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">

              {/* Upstox Connection Button */}
              {user && user.isAdmin && (
                <button
                  onClick={handleConnectUpstox}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isConnected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                    : isAuthenticated
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                      : "bg-surface border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    }`}
                  title={
                    isConnected
                      ? "Upstox Live Stream Connected. Click to Log Out."
                      : isAuthenticated
                        ? "Connected but WebSocket data stream offline. Click to Log Out."
                        : "Connect Upstox for Live Stock Prices"
                  }
                >
                  {isConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Upstox Live</span>
                    </>
                  ) : isAuthenticated ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Upstox Connected</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Connect Upstox</span>
                    </>
                  )}
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-smooth"
                aria-label="Toggle theme"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-smooth cursor-pointer ${
                    isNotifOpen ? "bg-surface text-text-primary" : ""
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some((n) => !n.isRead) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-card animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown Popover */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 animate-[fadeIn_0.15s_ease-out]">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                      <h4 className="text-sm font-bold text-text-primary">Notifications</h4>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          onClick={() => {
                            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                          }}
                          className="text-[10px] text-brand-primary font-bold hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                              );
                            }}
                            className={`p-2.5 rounded-xl border transition-smooth cursor-pointer ${
                              n.isRead
                                ? "bg-card border-transparent opacity-75 hover:opacity-100"
                                : "bg-surface border-border hover:border-brand-primary/20"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 shrink-0">
                                {n.type === "success" && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                )}
                                {n.type === "warning" && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                )}
                                {n.type === "info" && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs text-text-primary truncate ${!n.isRead ? "font-bold" : "font-medium"}`}>
                                  {n.title}
                                </p>
                                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                                  {n.description}
                                </p>
                                <span className="text-[9px] text-text-muted mt-1 block">{n.time}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-text-secondary">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Block */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-surface rounded-lg transition-smooth"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center ring-2 ring-white dark:ring-border">
                      <span className="text-white text-xs font-semibold">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
                  </button>

                  {/* Settings Dropdown Popover */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 animate-[fadeIn_0.15s_ease-out]">
                      <div className="border-b border-border pb-3 mb-3">
                        <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                        <p className="text-xs text-text-secondary truncate">{user.email}</p>
                      </div>

                      <div className="space-y-2.5">
                        {/* Demo Wallet Credit indicator */}
                        <div className="flex items-center justify-between text-xs p-2 bg-surface border border-border-light rounded-xl">
                          <span className="text-text-secondary flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-brand-primary" />
                            Funds
                          </span>
                          <span className="font-bold text-text-primary">
                            ₹{user.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Optional PAN Card verification indicator */}
                        {user.pancard ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-positive font-semibold px-2 py-1.5 bg-positive-bg rounded-xl border border-positive/10">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">PAN Card Verified: {user.pancard}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              const pan = prompt("Please enter your 10-digit PAN Card (E.g. ABCDE1234F):");
                              if (pan) {
                                updatePan(pan).then((success) => {
                                  if (success) alert("PAN Card registered successfully!");
                                  else alert("Failed to register PAN Card. Format should match ABCDE1234F");
                                });
                              }
                            }}
                            className="w-full flex items-center justify-between gap-1 px-2.5 py-2 bg-negative-bg border border-negative/10 hover:opacity-90 rounded-xl text-left cursor-pointer transition-smooth"
                          >
                            <span className="text-[11px] font-bold text-negative flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              Verify PAN Card
                            </span>
                            <span className="text-[10px] font-extrabold text-negative underline">Add</span>
                          </button>
                        )}

                        {/* Log Out Button */}
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold text-text-secondary hover:text-negative hover:bg-negative-bg/10 rounded-xl transition-smooth text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-1.5 rounded-lg bg-brand-primary text-white font-bold text-xs hover:opacity-90 transition-smooth cursor-pointer"
                >
                  Sign In
                </button>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* Auth Portal Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
