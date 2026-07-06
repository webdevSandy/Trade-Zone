"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8 mt-auto z-10 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-white">
                T
              </div>
              <span className="text-base font-bold text-text-primary tracking-tight">Trade Zone</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
              Premium stock trading indicators and analytics dashboard. Practice trading risk-free with live Yahoo Finance data integration.
            </p>
          </div>

          {/* Col 2: Major Markets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Major Indices</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">NIFTY 50 Index</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">SENSEX Index</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">BANKNIFTY Index</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">FINNIFTY Index</span></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Upstox API Docs</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Yahoo Finance API</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">SEBI Regulations</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">NSE India</span></li>
            </ul>
          </div>

          {/* Col 4: Legal & Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Privacy Policy</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Terms of Service</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Cookie Policy</span></li>
              <li><span className="hover:text-brand-primary cursor-pointer transition-smooth">Risk Disclosure</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/70 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Trade Zone. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-text-primary cursor-pointer transition-smooth">Twitter</span>
            <span className="hover:text-text-primary cursor-pointer transition-smooth">GitHub</span>
            <span className="hover:text-text-primary cursor-pointer transition-smooth">LinkedIn</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-[10px] text-text-muted/75 leading-relaxed max-w-5xl mx-auto">
            Disclaimer: Stock trading involves high risk. All financial instruments, indices, and quotes loaded in demo mode are synced using third-party APIs (Yahoo Finance) for analytics practice. Please review SEBI guidelines before engaging in real market trading.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
