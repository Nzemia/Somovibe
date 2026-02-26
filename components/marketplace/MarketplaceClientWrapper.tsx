"use client";

import { useState, useEffect } from "react";
import { MarketplaceControls } from "./MarketplaceControls";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { MarketplaceContent } from "./MarketplaceContent";

export type PdfItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  materialType: string;
  thumbnailUrl?: string | null;
  createdAt: Date | string;
  teacher: {
    name?: string | null;
    email: string;
    teacherProfile?: { isActive: boolean } | null;
  };
  _count: { purchases: number };
  reviews: { rating: number }[];
};

type Props = {
  initialPdfs: PdfItem[];
  purchasedPdfIds: Set<string>;
  user: { id: string; email: string; phone: string | null } | null;
  initialSearch?: string;
  initialSort?: string;
  initialGrades?: string[];
  initialSubjects?: string[];
  initialMaterialTypes?: string[];
  initialMinPrice?: number;
  initialMaxPrice?: number;
};

export function MarketplaceClientWrapper({
  initialPdfs,
  purchasedPdfIds,
  user,
  initialSearch = "",
  initialSort = "newest",
  initialGrades = [],
  initialSubjects = [],
  initialMaterialTypes = [],
  initialMinPrice,
  initialMaxPrice,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [grades, setGrades] = useState<string[]>(initialGrades);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [materialTypes, setMaterialTypes] = useState<string[]>(initialMaterialTypes);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);

  // Sync URL in background (non-blocking)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (sort && sort !== "newest") params.set("sort", sort);
    grades.forEach((g) => params.append("grade", g));
    subjects.forEach((s) => params.append("subject", s));
    materialTypes.forEach((t) => params.append("type", t));
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    params.delete("cursor");
    window.history.replaceState({}, "", `/marketplace?${params.toString()}`);
  }, [search, sort, grades, subjects, materialTypes, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Search + sort bar */}
      <MarketplaceControls
        initialSearch={search}
        initialSort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
        totalCount={initialPdfs.length}
      />

      {/* Sidebar + grid */}
      <div className="flex flex-col lg:flex-row gap-6 pt-4 pb-12 items-start">
        <div className="w-full lg:w-60 lg:shrink-0 lg:sticky lg:top-24">
          <MarketplaceFilters
            initialGrades={grades}
            initialSubjects={subjects}
            initialMaterialTypes={materialTypes}
            initialMinPrice={minPrice?.toString()}
            initialMaxPrice={maxPrice?.toString()}
            initialSort={sort}
            onGradesChange={setGrades}
            onSubjectsChange={setSubjects}
            onMaterialTypesChange={setMaterialTypes}
            onMinPriceChange={(val) => setMinPrice(val ? parseInt(val) : undefined)}
            onMaxPriceChange={(val) => setMaxPrice(val ? parseInt(val) : undefined)}
            onSortChange={setSort}
          />
        </div>

        <div className="flex-1 min-w-0">
          <MarketplaceContent
            initialPdfs={initialPdfs}
            purchasedPdfIds={purchasedPdfIds}
            user={user}
            search={search}
            sort={sort}
            grades={grades}
            subjects={subjects}
            materialTypes={materialTypes}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSearchChange={setSearch}
          />
        </div>
      </div>
    </div>
  );
}
