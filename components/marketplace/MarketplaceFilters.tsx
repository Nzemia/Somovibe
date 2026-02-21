"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MarketplaceFiltersProps = {
  initialGrades?: string[];
  initialSubjects?: string[];
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialVerifiedOnly?: boolean;
  // Optional callbacks for optimistic UI
  onGradesChange?: (grades: string[]) => void;
  onSubjectsChange?: (subjects: string[]) => void;
  onMinPriceChange?: (price: string) => void;
  onMaxPriceChange?: (price: string) => void;
  onVerifiedOnlyChange?: (verified: boolean) => void;
};

const GRADE_GROUPS = [
  { value: "1-3", label: "Grades 1–3" },
  { value: "4-6", label: "Grades 4–6" },
  { value: "7-9", label: "Grades 7–9" },
];

const SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Science",
  "Social Studies",
];

export function MarketplaceFilters({
  initialGrades = [],
  initialSubjects = [],
  initialMinPrice = "",
  initialMaxPrice = "",
  initialVerifiedOnly = false,
  onGradesChange,
  onSubjectsChange,
  onMinPriceChange,
  onMaxPriceChange,
  onVerifiedOnlyChange,
}: MarketplaceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialGrades);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubjects);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  
  const isInitialMount = useRef(true);
  const isUpdatingUrl = useRef(false);

  // Sync state with URL params only on initial mount or external URL changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only sync if URL changed externally (not from our own update)
    if (!isUpdatingUrl.current) {
      setSelectedGrades(initialGrades);
      setSelectedSubjects(initialSubjects);
      setMinPrice(initialMinPrice);
      setMaxPrice(initialMaxPrice);
      setVerifiedOnly(initialVerifiedOnly);
    }
  }, [initialGrades, initialSubjects, initialMinPrice, initialMaxPrice, initialVerifiedOnly]);

  // Update URL when filters change (only if no callbacks provided - parent handles URL sync)
  useEffect(() => {
    // Skip if callbacks are provided (parent handles URL sync)
    if (onGradesChange || onSubjectsChange) {
      return;
    }

    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Check if current URL params match our state to avoid unnecessary updates
    const currentGrades = searchParams.getAll("grade");
    const currentSubjects = searchParams.getAll("subject");
    const currentMinPrice = searchParams.get("minPrice") || "";
    const currentMaxPrice = searchParams.get("maxPrice") || "";
    const currentVerifiedOnly = searchParams.get("verifiedOnly") === "true";
    
    const gradesChanged = JSON.stringify([...selectedGrades].sort()) !== JSON.stringify([...currentGrades].sort());
    const subjectsChanged = JSON.stringify([...selectedSubjects].sort()) !== JSON.stringify([...currentSubjects].sort());
    const minPriceChanged = minPrice !== currentMinPrice;
    const maxPriceChanged = maxPrice !== currentMaxPrice;
    const verifiedOnlyChanged = verifiedOnly !== currentVerifiedOnly;
    
    if (!gradesChanged && !subjectsChanged && !minPriceChanged && !maxPriceChanged && !verifiedOnlyChanged) {
      return; // No changes, skip update
    }

    isUpdatingUrl.current = true;
    const params = new URLSearchParams();
    
    // Preserve search and sort from URL
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    
    // Update grades (remove all first, then add selected)
    params.delete("grade");
    if (selectedGrades.length > 0) {
      selectedGrades.forEach((grade) => params.append("grade", grade));
    }
    
    // Update subjects (remove all first, then add selected)
    params.delete("subject");
    if (selectedSubjects.length > 0) {
      selectedSubjects.forEach((subject) => params.append("subject", subject));
    }
    
    // Update price range
    if (minPrice) {
      params.set("minPrice", minPrice);
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }
    
    // Update verified only
    if (verifiedOnly) {
      params.set("verifiedOnly", "true");
    }
    
    // Remove cursor when filters change
    params.delete("cursor");
    
    router.push(`/marketplace?${params.toString()}`);
    
    // Reset flag after a short delay to allow URL to update
    setTimeout(() => {
      isUpdatingUrl.current = false;
    }, 100);
  }, [selectedGrades, selectedSubjects, minPrice, maxPrice, verifiedOnly, router, onGradesChange, onSubjectsChange]); // Removed searchParams from deps

  const handleGradeToggle = (grade: string) => {
    const newGrades = selectedGrades.includes(grade)
      ? selectedGrades.filter((g) => g !== grade)
      : [...selectedGrades, grade];
    setSelectedGrades(newGrades);
    onGradesChange?.(newGrades); // Optimistic UI update
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    setSelectedSubjects(newSubjects);
    onSubjectsChange?.(newSubjects); // Optimistic UI update
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    onMinPriceChange?.(value); // Optimistic UI update
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    onMaxPriceChange?.(value); // Optimistic UI update
  };

  const handleVerifiedOnlyChange = (checked: boolean) => {
    setVerifiedOnly(checked);
    onVerifiedOnlyChange?.(checked); // Optimistic UI update
  };

  const handleClearFilters = () => {
    setSelectedGrades([]);
    setSelectedSubjects([]);
    setMinPrice("");
    setMaxPrice("");
    setVerifiedOnly(false);
    onGradesChange?.([]);
    onSubjectsChange?.([]);
    onMinPriceChange?.("");
    onMaxPriceChange?.("");
    onVerifiedOnlyChange?.(false);
  };

  const filtersContent = (
    <div className="space-y-5">
      {/* Grade */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Grade</h3>
        <div className="space-y-1 text-sm text-slate-700">
          {GRADE_GROUPS.map((group) => (
            <label key={group.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGrades.includes(group.value)}
                onChange={() => handleGradeToggle(group.value)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{group.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Subject</h3>
        <div className="space-y-1 text-sm text-slate-700">
          {SUBJECTS.map((subject) => (
            <label key={subject} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectToggle(subject)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">
          Price range (KES)
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Verified only */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Verified only</h3>
          <p className="text-xs text-slate-500">
            Show resources from verified teachers only.
          </p>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => handleVerifiedOnlyChange(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`h-5 w-9 rounded-full relative transition-colors ${
              verifiedOnly ? "bg-blue-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                verifiedOnly ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </span>
        </label>
      </div>

      {/* Clear filters */}
      {(selectedGrades.length > 0 ||
        selectedSubjects.length > 0 ||
        minPrice ||
        maxPrice ||
        verifiedOnly) && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile filters */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mt-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <svg
            className="h-4 w-4 text-slate-500"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 4H16M6 10H14M8 16H12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span>Filters</span>
        </button>

        {mobileOpen && (
          <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            {filtersContent}
          </div>
        )}
      </section>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-full">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm sticky top-24">
          {filtersContent}
        </div>
      </aside>
    </>
  );
}

