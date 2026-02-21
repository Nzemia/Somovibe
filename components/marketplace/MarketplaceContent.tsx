"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Lottie from "lottie-react";
import { ResourceCard } from "./ResourceCard";
import emptyAnimation from "@/public/animations/Empty.json";

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

type MarketplaceContentProps = {
  initialPdfs: Pdf[];
  purchasedPdfIds: Set<string>;
  user: { id: string; email: string; phone: string | null } | null;
  search: string;
  sort: string;
  grades: string[];
  subjects: string[];
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly: boolean;
};

export function MarketplaceContent({
  initialPdfs,
  purchasedPdfIds,
  user,
  search,
  sort,
  grades,
  subjects,
  minPrice,
  maxPrice,
  verifiedOnly,
}: MarketplaceContentProps) {
  const [allPdfs] = useState<Pdf[]>(initialPdfs); // Cache all PDFs

  // Optimistic filtering - instant client-side filtering
  const filteredPdfs = useMemo(() => {
    let filtered = [...allPdfs];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (pdf) =>
          pdf.title.toLowerCase().includes(searchLower) ||
          pdf.description.toLowerCase().includes(searchLower) ||
          pdf.subject.toLowerCase().includes(searchLower) ||
          pdf.grade.toLowerCase().includes(searchLower)
      );
    }

    // Grade filter
    if (grades.length > 0) {
      const gradeMatches = grades.flatMap((gradeRange) => {
        if (gradeRange === "1-3") {
          return ["Grade 1", "Grade 2", "Grade 3"];
        } else if (gradeRange === "4-6") {
          return ["Grade 4", "Grade 5", "Grade 6"];
        } else if (gradeRange === "7-9") {
          return ["Grade 7", "Grade 8", "Grade 9"];
        }
        return [];
      });
      filtered = filtered.filter((pdf) =>
        gradeMatches.some((g) => pdf.grade.startsWith(g))
      );
    }

    // Subject filter
    if (subjects.length > 0) {
      filtered = filtered.filter((pdf) => subjects.includes(pdf.subject));
    }

    // Price filter
    if (minPrice !== undefined) {
      filtered = filtered.filter((pdf) => pdf.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((pdf) => pdf.price <= maxPrice);
    }

    // Verified only filter
    if (verifiedOnly) {
      filtered = filtered.filter(
        (pdf) => pdf.teacher.teacherProfile?.isActive === true
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "price-low") {
        return a.price - b.price;
      } else if (sort === "price-high") {
        return b.price - a.price;
      } else if (sort === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      // popular/rated fallback to newest
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return sorted;
  }, [
    allPdfs,
    search,
    grades,
    subjects,
    minPrice,
    maxPrice,
    verifiedOnly,
    sort,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() ||
    grades.length > 0 ||
    subjects.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    verifiedOnly
  );

  return (
    <div className="flex-1 w-full min-w-0 space-y-6 lg:pr-4">
          {filteredPdfs.length === 0 ? (
            <EmptyState hasActiveFilters={hasActiveFilters} searchTerm={search} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPdfs.map((pdf) => (
                <ResourceCard
                  key={pdf.id}
                  resource={pdf}
                  isPurchased={purchasedPdfIds.has(pdf.id)}
                  user={user}
                />
              ))}
            </div>
          )}
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  searchTerm,
}: {
  hasActiveFilters: boolean;
  searchTerm: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-64 h-64 mb-6">
        <Lottie animationData={emptyAnimation} loop={true} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {hasActiveFilters
          ? searchTerm
            ? `No results for "${searchTerm}"`
            : "No resources match your filters"
          : "No materials yet"}
      </h3>
      <p className="text-sm text-slate-600 text-center max-w-md">
        {hasActiveFilters
          ? searchTerm
            ? "Try different keywords or adjust your filters to find what you're looking for."
            : "Try adjusting your filters to find more resources."
          : "Check back soon for quality CBC learning materials from verified teachers."}
      </p>
    </div>
  );
}
