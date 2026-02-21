"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  initialSearch?: string;
  initialSort?: string;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: string) => void;
  totalCount?: number;
};

export function MarketplaceControls({
  initialSearch = "",
  initialSort = "newest",
  onSearchChange,
  onSortChange,
  totalCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [focused, setFocused] = useState(false);
  const isInitialMount = useRef(true);
  const isUpdatingUrl = useRef(false);

  useEffect(() => { onSearchChange?.(search); }, [search, onSearchChange]);
  useEffect(() => { onSortChange?.(sort); }, [sort, onSortChange]);

  // Sync with URL in background (debounced, non-blocking)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const currentSearch = searchParams.get("search") || "";
    const currentSort = searchParams.get("sort") || "newest";
    if (search.trim() === currentSearch.trim() && (sort || "newest") === currentSort) return;

    isUpdatingUrl.current = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("search", search.trim()); else params.delete("search");
      if (sort && sort !== "newest") params.set("sort", sort); else params.delete("sort");
      params.delete("cursor");
      router.replace(`/marketplace?${params.toString()}`, { scroll: false });
      setTimeout(() => { isUpdatingUrl.current = false; }, 100);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, sort, router, searchParams]);

  return (
    <div className="pt-5 pb-1">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

        {/* Search */}
        <div className="flex-1">
          <label className="sr-only" htmlFor="marketplace-search">Search resources</label>
          <div className={`flex items-center gap-2.5 rounded-xl border-2 bg-white transition-all duration-200 ${
            focused ? "border-[#008c43] ring-2 ring-[#008c43]/15" : "border-gray-200 hover:border-gray-300"
          }`}>
            <span className="pl-3.5 text-gray-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              id="marketplace-search"
              type="search"
              placeholder="Search by title, subject, grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 py-2.5 pr-3 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="pr-3 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Clear search">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sort + count — hidden on mobile (sort lives in the Filter & Sort sheet) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {totalCount !== undefined && (
            <span className="hidden sm:inline text-xs text-gray-400 font-medium whitespace-nowrap">
              {totalCount.toLocaleString()} materials
            </span>
          )}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 pl-4 pr-9 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#008c43] focus:ring-2 focus:ring-[#008c43]/15 hover:border-gray-300 transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most sold</option>
              <option value="rated">Highest rated</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
