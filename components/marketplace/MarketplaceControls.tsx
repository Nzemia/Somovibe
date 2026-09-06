"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaperSearch, PaperSelect, SORT_OPTIONS, TypePicker } from "./filterUi";

type Props = {
  initialSearch?: string;
  initialSort?: string;
  initialMaterialType?: string;
  onSearchChange?: (search: string) => void;
  onSortChange?: (sort: string) => void;
  onMaterialTypeChange?: (types: string[]) => void;
};

export function MarketplaceControls({
  initialSearch = "",
  initialSort = "trending",
  initialMaterialType = "",
  onSearchChange,
  onSortChange,
  onMaterialTypeChange,
  mobileTriggerRender,
}: Props & { mobileTriggerRender?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [materialType, setMaterialType] = useState(initialMaterialType);
  const [focused, setFocused] = useState(false);
  const isInitialMount = useRef(true);
  const isUpdatingUrl = useRef(false);

  useEffect(() => { onSearchChange?.(search); }, [search, onSearchChange]);
  useEffect(() => { onSortChange?.(sort); }, [sort, onSortChange]);

  useEffect(() => {
    setMaterialType(initialMaterialType);
  }, [initialMaterialType]);

  // Sync with URL in background (debounced, non-blocking)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const currentSearch = searchParams.get("search") || "";
    const currentSort = searchParams.get("sort") || "trending";
    if (search.trim() === currentSearch.trim() && (sort || "newest") === currentSort) return;

    isUpdatingUrl.current = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("search", search.trim()); else params.delete("search");
      if (sort && sort !== "trending") params.set("sort", sort); else params.delete("sort");
      params.delete("cursor");
      router.replace(`/marketplace?${params.toString()}`, { scroll: false });
      setTimeout(() => { isUpdatingUrl.current = false; }, 100);
    }, search ? 300 : 0);

    return () => clearTimeout(timer);
  }, [search, sort, router, searchParams]);

  return (
    <div className="pt-5 pb-1">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch w-full">

        <div className="flex-1 flex gap-2 items-stretch">
          {mobileTriggerRender}
          <div className="flex-1">
            <label className="sr-only" htmlFor="marketplace-search">Search resources</label>
            <PaperSearch focused={focused}>
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
                className="flex-1 py-2.5 pr-3 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  className="pr-3 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Clear search">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </PaperSearch>
          </div>
        </div>

        <div className="flex items-stretch gap-3 shrink-0">
          <TypePicker
            value={materialType}
            onChange={(next) => {
              setMaterialType(next);
              onMaterialTypeChange?.(next ? [next] : []);
            }}
          />
          <div className="hidden sm:block min-w-[168px]">
            <PaperSelect
              value={sort}
              onChange={setSort}
              label="Sort"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </PaperSelect>
          </div>
        </div>
      </div>
    </div>
  );
}
