"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Interfaces ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  pancard: string | null;
  walletBalance: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  updatePan: (pancard: string) => Promise<boolean>;
  clearError: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ─── Auth Provider Component ─────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Session Rehydration on Mount ──────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to rehydrate session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Login failed");
        return false;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Something went wrong during login");
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Registration failed");
        return false;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Something went wrong during registration");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updatePan = async (pancard: string): Promise<boolean> => {
    setError(null);
    if (!token) return false;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/update-pan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pancard }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "PAN update failed");
        return false;
      }

      // Update local user state
      if (user) {
        setUser({ ...user, pancard: data.user.pancard });
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update PAN card");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        updatePan,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ─────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
