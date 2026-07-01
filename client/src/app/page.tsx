import TopMovers from "@/components/TopMovers";
import YourInvestment from "@/components/YourInvestment";
import ProductsTools from "@/components/ProductsTools";

export default function DashboardPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Main Grid: 2:1 ratio on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Movers (66%) */}
        <div className="lg:col-span-2">
          <TopMovers />
        </div>

        {/* Right Column: Investment + Products (33%) */}
        <div className="lg:col-span-1 space-y-5">
          <YourInvestment />
          <ProductsTools />
        </div>
      </div>
    </div>
  );
}
