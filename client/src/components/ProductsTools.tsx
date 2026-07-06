"use client";

import React from "react";
import { TrendingUp, Landmark, Layers, PieChart, ChevronRight } from "lucide-react";
import { productItems } from "@/lib/mockData";

const iconMap: Record<string, React.ReactNode> = {
  "trending-up": <TrendingUp className="w-5 h-5" />,
  "landmark": <Landmark className="w-5 h-5" />,
  "layers": <Layers className="w-5 h-5" />,
  "pie-chart": <PieChart className="w-5 h-5" />,
};

const iconBgMap: Record<string, string> = {
  "trending-up": "bg-blue-50 text-blue-600",
  "landmark": "bg-emerald-50 text-emerald-600",
  "layers": "bg-amber-50 text-amber-600",
  "pie-chart": "bg-violet-50 text-violet-600",
};

const ProductsTools: React.FC = () => {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="p-5">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Products & Tools
        </h3>

        <div className="space-y-1">
          {productItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-surface transition-smooth group"
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  iconBgMap[item.icon] || "bg-gray-50 text-gray-600"
                }`}
              >
                {iconMap[item.icon]}
              </div>

              {/* Label */}
              <span className="text-sm font-medium text-text-primary flex-1 text-left">
                {item.name}
              </span>

              {/* Badge */}
              {item.badge && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: item.badgeColor,
                    backgroundColor: `${item.badgeColor}15`,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-smooth" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsTools;
