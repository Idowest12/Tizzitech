import React from "react";
import { Category, Condition } from "../types";
import { BRANDS, CATEGORIES } from "../data";
import { SlidersHorizontal } from "lucide-react";

interface FiltersProps {
  selectedCategory: Category | "All" | "Tech" | "Accessories";
  setSelectedCategory: (c: Category | "All" | "Tech" | "Accessories") => void;
  selectedCondition: Condition | "All";
  setSelectedCondition: (c: Condition | "All") => void;
  selectedBrands: string[];
  toggleBrand: (brand: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  highestPriceLimit: number;
}

export function Filters({
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  selectedBrands,
  toggleBrand,
  maxPrice,
  setMaxPrice,
  highestPriceLimit,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-10">
      {/* Categories */}
      <div className="order-1 lg:order-4 group">
        <details className="group" open>
          <summary className="text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest cursor-pointer list-none flex justify-between items-center group-hover:text-neutral-300 transition-colors">
            Category
            <SlidersHorizontal className="w-4 h-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="flex flex-col gap-4 mt-4 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`text-left text-sm font-bold tracking-widest uppercase transition-all ${
                selectedCategory === "All"
                  ? "text-blue-500"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All Categories
            </button>

            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`text-left text-sm font-bold tracking-widest uppercase transition-all ${
                  selectedCategory === category
                    ? "text-blue-500"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* Price Range */}
      <div className="order-3 group">
        <details className="group" open>
          <summary className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-widest cursor-pointer list-none flex justify-between items-center group-hover:text-neutral-300 transition-colors">
            Max Price
            <SlidersHorizontal className="w-4 h-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
            <input
              type="range"
              min="0"
              max={highestPriceLimit}
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-blue-500 mt-4 font-bold tracking-widest uppercase">
              <span>₦0</span>
              <span>₦{maxPrice.toLocaleString()}</span>
            </div>
          </div>
        </details>
      </div>

      {/* Brands */}
      <div className="order-4 lg:order-1 group">
        <details className="group" open={false}>
          <summary className="text-xs font-bold text-neutral-500 mb-6 uppercase tracking-widest cursor-pointer list-none flex justify-between items-center group-hover:text-neutral-300 transition-colors">
            Brands
            <SlidersHorizontal className="w-4 h-4 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent mt-4 animate-in slide-in-from-top-2 duration-200">
            {BRANDS.map((brand) => (
              <label
                key={brand}
                className="flex items-center cursor-pointer group/item"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-4 w-4 rounded-none border-neutral-700 bg-black text-blue-600 focus:ring-blue-600 focus:ring-offset-black transition-colors"
                />
                <span className="ml-3 text-sm font-bold uppercase tracking-widest text-neutral-400 group-hover/item:text-white transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
