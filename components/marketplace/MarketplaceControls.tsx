"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MarketplaceControlsProps = {
  initialSearch?: string;
  initialSort?: string;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: string) => void;
};

export function MarketplaceControls({
  initialSearch = "",
  initialSort = "newest",
  onSearchChange,
  onSortChange,
}: MarketplaceControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [focused, setFocused] = useState(false);
  const isInitialMount = useRef(true);
  const isUpdatingUrl = useRef(false);

  // Optimistic UI: Update parent immediately for instant filtering
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(search);
    }
  }, [search, onSearchChange]);

  useEffect(() => {
    if (onSortChange) {
      onSortChange(sort);
    }
  }, [sort, onSortChange]);

  // Sync with URL in background (non-blocking)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentSearch = searchParams.get("search") || "";
    const currentSort = searchParams.get("sort") || "newest";
    const searchChanged = search.trim() !== currentSearch.trim();
    const sortChanged = (sort || "newest") !== currentSort;

    if (!searchChanged && !sortChanged) return;

    isUpdatingUrl.current = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");
      if (sort && sort !== "newest") params.set("sort", sort);
      else params.delete("sort");
      params.delete("cursor");
      router.replace(`/marketplace?${params.toString()}`, { scroll: false });
      setTimeout(() => {
        isUpdatingUrl.current = false;
      }, 100);
    }, search ? 300 : 0); // Reduced debounce for faster feel

    return () => clearTimeout(timer);
  }, [search, sort, router, searchParams]);

  return (
    <section className="w-full bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
          {/* Search - premium marketplace style */}
          <div className="flex-1 w-full min-w-0">
            <label className="sr-only" htmlFor="marketplace-search">
              Search resources
            </label>
            <div
              className={`
                flex items-center gap-3 w-full rounded-xl border bg-slate-50/80 transition-all duration-200
                ${focused ? "border-blue-400 bg-white ring-2 ring-blue-500/20 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
              `}
            >
              <span className="pl-4 text-slate-400 shrink-0" aria-hidden="true">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </span>
              <input
                id="marketplace-search"
                type="search"
                placeholder="Search notes, schemes, exams, Grade 3..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="flex-1 min-w-0 py-3 pr-4 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm md:text-base focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sort - integrated premium dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              Sort
            </span>
            <div className="relative w-full sm:w-52">
              <select
                id="marketplace-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="
                  w-full py-3 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/80
                  text-sm font-medium text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                  hover:border-slate-300 hover:bg-slate-50
                  transition-colors appearance-none cursor-pointer
                "
              >
                <option value="newest">Newest first</option>
                <option value="popular">Most popular</option>
                <option value="rated">Highest rated</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
