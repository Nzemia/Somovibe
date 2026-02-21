"use client";

import { useState, useMemo } from "react";
import Lottie from "lottie-react";
import { ResourceCard } from "./ResourceCard";
import emptyAnimation from "@/public/animations/Empty.json";
import type { PdfItem } from "./MarketplaceClientWrapper";

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
  verifiedOnly: boolean;
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
  verifiedOnly,
}: Props) {
  const [allPdfs] = useState<PdfItem[]>(initialPdfs);

  const filtered = useMemo(() => {
    let list = [...allPdfs];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.grade.toLowerCase().includes(q) ||
        p.teacher.email.toLowerCase().includes(q) ||
        (p.teacher.name ?? "").toLowerCase().includes(q)
      );
    }

    // Grade
    if (grades.length > 0) {
      const matches = grades.flatMap(r => {
        if (r === "1-3") return ["Grade 1", "Grade 2", "Grade 3"];
        if (r === "4-6") return ["Grade 4", "Grade 5", "Grade 6"];
        if (r === "7-9") return ["Grade 7", "Grade 8", "Grade 9"];
        return [];
      });
      list = list.filter(p => matches.some(g => p.grade.startsWith(g)));
    }

    // Subject
    if (subjects.length > 0) {
      list = list.filter(p => subjects.includes(p.subject));
    }

    // Material type
    if (materialTypes.length > 0) {
      list = list.filter(p => materialTypes.includes(p.materialType));
    }

    // Price
    if (minPrice !== undefined) list = list.filter(p => p.price >= minPrice);
    if (maxPrice !== undefined) list = list.filter(p => p.price <= maxPrice);

    // Verified only
    if (verifiedOnly) list = list.filter(p => p.teacher.teacherProfile?.isActive === true);

    // Sort
    return [...list].sort((a, b) => {
      if (sort === "price-low")  return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "oldest")     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "popular")    return b._count.purchases - a._count.purchases;
      if (sort === "rated")      return avgRating(b.reviews) - avgRating(a.reviews);
      // newest (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allPdfs, search, sort, grades, subjects, materialTypes, minPrice, maxPrice, verifiedOnly]);

  const hasActiveFilters = Boolean(
    search.trim() || grades.length || subjects.length || materialTypes.length ||
    minPrice !== undefined || maxPrice !== undefined || verifiedOnly
  );

  if (filtered.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} searchTerm={search} />;
  }

  return (
    <div>
      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-bold text-gray-800">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters && " · filtered"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(pdf => (
          <ResourceCard
            key={pdf.id}
            resource={pdf}
            isPurchased={purchasedPdfIds.has(pdf.id)}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasActiveFilters, searchTerm }: { hasActiveFilters: boolean; searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-52 h-52 mb-4">
        <Lottie animationData={emptyAnimation} loop />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1.5">
        {hasActiveFilters
          ? searchTerm ? `No results for "${searchTerm}"` : "No materials match your filters"
          : "No materials yet"}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        {hasActiveFilters
          ? "Try different keywords or adjust your filters."
          : "Quality CBC learning materials are coming soon."}
      </p>
    </div>
  );
}
