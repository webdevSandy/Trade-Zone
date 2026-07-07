"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, Phone, User, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Register fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // State helpers
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Clear errors when toggling tabs
  useEffect(() => {
    clearError();
    setValidationError(null);
  }, [activeTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    // ── Input Validations ───────────────────────────────────────────────────
    if (activeTab === "register") {
      if (!name.trim() || !email.trim() || !phone.trim() || !password) {
        setValidationError("All fields are required.");
        return;
      }
      if (password.length < 6) {
        setValidationError("Password must be at least 6 characters.");
        return;
      }
      // Simple phone number validation (10 digits)
      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        setValidationError("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setValidationError("Email and password are required.");
        return;
      }
    }

    setIsSubmitting(true);
    let success = false;

    if (activeTab === "login") {
      success = await login(email, password);
    } else {
      // Send cleaned phone number
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      success = await register(name, email, cleanPhone, password);
    }

    setIsSubmitting(false);
    if (success) {
      onClose();
      // Reset fields
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        
        {/* Glow effect in background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface text-text-secondary hover:text-text-primary transition-smooth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
            Welcome to Trade Zone
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {activeTab === "login" 
              ? "Access your dashboard and live market indicators" 
              : "Register to get ₹1,00,000 free trading credit!"}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-border mb-5">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-smooth ${
              activeTab === "login"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-smooth ${
              activeTab === "register"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Banners */}
        {(validationError || error) && (
          <div className="flex items-start gap-2 bg-negative-bg border border-negative/10 text-negative rounded-xl p-3 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Sign Up Only) */}
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-smooth"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="trader@tradezone.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-smooth"
              />
            </div>
          </div>

          {/* Phone Field (Sign Up Only) */}
          {activeTab === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-smooth"
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-brand-primary transition-smooth"
              />
            </div>
          </div>

          {/* Sparkles promo for Register */}
          {activeTab === "register" && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-brand-primary/10 rounded-xl p-3 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
              <span>We&apos;ll set up a demo wallet with ₹1,00,000 to practice trading instantly!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-brand-primary text-white hover:opacity-90 font-bold text-sm transition-smooth disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting 
              ? "Connecting..." 
              : activeTab === "login" 
                ? "Sign In" 
                : "Create Account"}
          </button>
        </form>

        {/* Footer switch prompt */}
        <p className="text-center text-xs text-text-secondary mt-6">
          {activeTab === "login" 
            ? "New to Trade Zone? " 
            : "Already have an account? "}
          <button
            onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
            className="text-brand-primary hover:text-brand-dark font-semibold outline-none hover:underline"
          >
            {activeTab === "login" ? "Create one here" : "Sign in here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
