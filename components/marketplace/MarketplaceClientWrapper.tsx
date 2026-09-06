"use client";

import { useState, useEffect } from "react";
import { MarketplaceControls } from "./MarketplaceControls";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { MarketplaceContent } from "./MarketplaceContent";
import { FilterFab } from "./filterUi";

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
  _count: { purchases: number; materialViews?: number };
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
  initialSort = "trending",
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
    if (sort && sort !== "trending") params.set("sort", sort);
    grades.forEach((g) => params.append("grade", g));
    subjects.forEach((s) => params.append("subject", s));
    materialTypes.forEach((t) => params.append("type", t));
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    params.delete("cursor");
    window.history.replaceState({}, "", `/marketplace?${params.toString()}`);
  }, [search, sort, grades, subjects, materialTypes, minPrice, maxPrice]);


  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
      <div className="relative z-20 shrink-0 bg-[#f5faf7]">
        <MarketplaceControls
          initialSearch={search}
          initialSort={sort}
          initialMaterialType={materialTypes[0] ?? ""}
          onSearchChange={setSearch}
          onSortChange={setSort}
          onMaterialTypeChange={setMaterialTypes}
          mobileTriggerRender={
            <div className="lg:hidden shrink-0 self-center">
              <FilterFab
                onClick={() => setFilterSheetOpen(true)}
                activeCount={
                  grades.length + subjects.length + materialTypes.length
                  + (minPrice !== undefined ? 1 : 0)
                  + (maxPrice !== undefined ? 1 : 0)
                }
              />
            </div>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 pt-4 lg:flex-row lg:items-stretch">
        <div className="hidden min-h-0 w-64 shrink-0 overflow-y-auto lg:block">
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
            externalForceOpen={filterSheetOpen}
            onExternalForceClose={() => setFilterSheetOpen(false)}
          />
        </div>

        <div
          id="marketplace-results"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-12"
        >
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
