"use client";

import { useState, useMemo, useEffect } from "react";
import Lottie from "lottie-react";
import { ResourceCard } from "./ResourceCard";
import emptyAnimation from "@/public/animations/Empty.json";
import type { PdfItem } from "./MarketplaceClientWrapper";
import { smartSearch } from "@/lib/search-intelligence";
import type { SearchSuggestion } from "@/lib/search-intelligence";

const PAGE_SIZE = 12;

type Props = {
  initialPdfs: PdfItem[];
  purchasedPdfIds: Set<string>;
  user: { id: string; email: string; phone: string | null } | null;
  search: string;
  sort: string;
  grades: string[];
  subjects: string[];
  materialTypes: string[];
  minPrice?: number;
  maxPrice?: number;
  onSearchChange?: (q: string) => void;
};

function avgRating(reviews: { rating: number }[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function MarketplaceContent({
  initialPdfs,
  purchasedPdfIds,
  user,
  search,
  sort,
  grades,
  subjects,
  materialTypes,
  minPrice,
  maxPrice,
  onSearchChange,
}: Props) {
  const [allPdfs] = useState<PdfItem[]>(initialPdfs);
  const [page, setPage] = useState(1);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);

  // Reset page & suggestion state whenever filters change
  useEffect(() => {
    setPage(1);
    setSuggestionDismissed(false);
  }, [search, sort, grades, subjects, materialTypes, minPrice, maxPrice]);

  const { searchFiltered, suggestion, relatedSubjects } = useMemo(() => {
    // Apply smart search first
    const searchResult = search.trim()
      ? smartSearch(search, allPdfs)
      : { items: allPdfs, suggestion: null, relatedSubjects: [] };

    let list = [...searchResult.items];

    // Grade filter
    if (grades.length > 0) {
      const matches = grades.flatMap(r => {
        if (r === "1-3") return ["Grade 1", "Grade 2", "Grade 3"];
        if (r === "4-6") return ["Grade 4", "Grade 5", "Grade 6"];
        if (r === "7-9") return ["Grade 7", "Grade 8", "Grade 9"];
        return [];
      });
      list = list.filter(p => matches.some(g => p.grade.startsWith(g)));
    }

    // Subject filter
    if (subjects.length > 0) {
      list = list.filter(p => subjects.includes(p.subject));
    }

    // Material type filter
    if (materialTypes.length > 0) {
      list = list.filter(p => materialTypes.includes(p.materialType));
    }

    // Price filter
    if (minPrice !== undefined) list = list.filter(p => p.price >= minPrice);
    if (maxPrice !== undefined) list = list.filter(p => p.price <= maxPrice);

    // Sort
    const sorted = [...list].sort((a, b) => {
      if (sort === "price-low")  return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "oldest")     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "popular")    return b._count.purchases - a._count.purchases;
      if (sort === "rated")      return avgRating(b.reviews) - avgRating(a.reviews);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
      searchFiltered: sorted,
      suggestion: searchResult.suggestion,
      relatedSubjects: searchResult.relatedSubjects,
    };
  }, [allPdfs, search, sort, grades, subjects, materialTypes, minPrice, maxPrice]);

  const hasActiveFilters = Boolean(
    search.trim() || grades.length || subjects.length || materialTypes.length ||
    minPrice !== undefined || maxPrice !== undefined
  );

  const totalPages = Math.ceil(searchFiltered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const paginated = searchFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (searchFiltered.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        searchTerm={search}
        relatedSubjects={relatedSubjects}
        onSubjectClick={onSearchChange}
      />
    );
  }

  return (
    <div>
      {/* Smart search suggestion banner */}
      {suggestion && !suggestionDismissed && (
        <SearchSuggestionBanner
          suggestion={suggestion}
          onDismiss={() => setSuggestionDismissed(true)}
          onSearchOriginal={onSearchChange}
        />
      )}

      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">{searchFiltered.length}</span>{" "}
          result{searchFiltered.length !== 1 ? "s" : ""}
          {hasActiveFilters && " · filtered"}
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-gray-400">Page {safePage} of {totalPages}</p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {paginated.map(pdf => (
          <ResourceCard
            key={pdf.id}
            resource={pdf}
            isPurchased={purchasedPdfIds.has(pdf.id)}
            user={user}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination current={safePage} total={totalPages} onChange={setPage} />
      )}
    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleChange = (p: number) => {
    onChange(p);
    scrollUp();
  };

  // Build page numbers with ellipsis: always show first, last, current ± 1
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {/* Previous */}
      <button
        onClick={() => handleChange(current - 1)}
        disabled={current === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => handleChange(p)}
            className={`w-9 h-9 rounded-xl border-2 text-sm font-bold transition-all ${
              p === current
                ? "border-[#008c43] text-white shadow-sm"
                : "border-gray-200 text-gray-700 hover:border-[#008c43] hover:text-[#008c43]"
            }`}
            style={p === current ? { background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" } : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => handleChange(current + 1)}
        disabled={current === total}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ── Search suggestion banner ─────────────────────────────── */
function SearchSuggestionBanner({
  suggestion,
  onDismiss,
  onSearchOriginal,
}: {
  suggestion: SearchSuggestion;
  onDismiss: () => void;
  onSearchOriginal?: (q: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 text-sm">
      {/* Icon */}
      <svg
        className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-amber-800">{suggestion.label}</span>
        {onSearchOriginal && (
          <button
            onClick={() => onSearchOriginal(suggestion.originalQuery + " ")}
            className="ml-2 text-amber-600 underline underline-offset-2 hover:text-amber-800 text-xs font-medium whitespace-nowrap"
          >
            Search "{suggestion.originalQuery}" exactly
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss suggestion"
        className="shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────── */
function EmptyState({
  hasActiveFilters,
  searchTerm,
  relatedSubjects,
  onSubjectClick,
}: {
  hasActiveFilters: boolean;
  searchTerm: string;
  relatedSubjects: Array<{ subject: string; count: number }>;
  onSubjectClick?: (q: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-44 h-44 mb-2">
        <Lottie animationData={emptyAnimation} loop />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1.5">
        {hasActiveFilters
          ? searchTerm
            ? `No results for "${searchTerm}"`
            : "No materials match your filters"
          : "No materials yet"}
      </h3>

      {searchTerm ? (
        <>
          <p className="text-sm text-gray-500 max-w-xs mb-5">
            We couldn&apos;t find an exact match. Try a different spelling or browse by subject below.
          </p>

          {/* Subject suggestion pills */}
          {relatedSubjects.length > 0 && (
            <div className="w-full max-w-md">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Browse by subject
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {relatedSubjects.map(({ subject, count }) => (
                  <button
                    key={subject}
                    onClick={() => onSubjectClick?.(subject)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#008c43] hover:text-[#008c43] transition-all active:scale-95"
                  >
                    {subject}
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear search hint */}
          {onSubjectClick && (
            <button
              onClick={() => onSubjectClick("")}
              className="mt-5 text-sm text-[#008c43] font-semibold hover:underline flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Browse all materials
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center max-w-sm">
          {hasActiveFilters
            ? "Try adjusting your filters."
            : "Quality CBC learning materials are coming soon."}
        </p>
      )}
    </div>
  );
}
