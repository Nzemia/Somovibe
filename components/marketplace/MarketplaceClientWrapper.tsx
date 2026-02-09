"use client";

import { useState, useEffect } from "react";
import { MarketplaceControls } from "./MarketplaceControls";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { MarketplaceContent } from "./MarketplaceContent";

type Pdf = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  createdAt: Date | string;
  teacher: {
    email: string;
    teacherProfile?: {
      isActive: boolean;
    } | null;
  };
};

type MarketplaceClientWrapperProps = {
  initialPdfs: Pdf[];
  purchasedPdfIds: Set<string>;
  user: { id: string; email: string; phone: string | null } | null;
  initialSearch?: string;
  initialSort?: string;
  initialGrades?: string[];
  initialSubjects?: string[];
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialVerifiedOnly?: boolean;
};

export function MarketplaceClientWrapper({
  initialPdfs,
  purchasedPdfIds,
  user,
  initialSearch = "",
  initialSort = "newest",
  initialGrades = [],
  initialSubjects = [],
  initialMinPrice,
  initialMaxPrice,
  initialVerifiedOnly = false,
}: MarketplaceClientWrapperProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [grades, setGrades] = useState<string[]>(initialGrades);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);

  // Sync URL in background (non-blocking)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (sort && sort !== "newest") params.set("sort", sort);
    grades.forEach((g) => params.append("grade", g));
    subjects.forEach((s) => params.append("subject", s));
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    if (verifiedOnly) params.set("verifiedOnly", "true");
    params.delete("cursor");

    // Use replace to avoid adding to history, scroll: false for smooth UX
    window.history.replaceState(
      {},
      "",
      `/marketplace?${params.toString()}`
    );
  }, [search, sort, grades, subjects, minPrice, maxPrice, verifiedOnly]);

  return (
    <>
      <MarketplaceControls
        initialSearch={search}
        initialSort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />
      <section className="w-full mt-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 lg:flex-shrink-0 lg:ml-[10px]">
            <MarketplaceFilters
              initialGrades={grades}
              initialSubjects={subjects}
              initialMinPrice={minPrice?.toString()}
              initialMaxPrice={maxPrice?.toString()}
              initialVerifiedOnly={verifiedOnly}
              onGradesChange={setGrades}
              onSubjectsChange={setSubjects}
              onMinPriceChange={(val) => setMinPrice(val ? parseInt(val) : undefined)}
              onMaxPriceChange={(val) => setMaxPrice(val ? parseInt(val) : undefined)}
              onVerifiedOnlyChange={setVerifiedOnly}
            />
          </div>

          {/* Content - Optimistic filtering */}
          <MarketplaceContent
            initialPdfs={initialPdfs}
            purchasedPdfIds={purchasedPdfIds}
            user={user}
            search={search}
            sort={sort}
            grades={grades}
            subjects={subjects}
            minPrice={minPrice}
            maxPrice={maxPrice}
            verifiedOnly={verifiedOnly}
          />
        </div>
      </section>
    </>
  );
}
