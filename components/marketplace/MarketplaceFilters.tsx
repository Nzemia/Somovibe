"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FilterSectionLabel,
  GradeChoiceGrid,
  PaperInput,
  PaperPanel,
  PaperSelect,
  SORT_OPTIONS,
  SUBJECTS,
  TypeChoiceGrid,
} from "./filterUi";

type Props = {
  initialGrades?: string[];
  initialSubjects?: string[];
  initialMaterialTypes?: string[];
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialSort?: string;
  onGradesChange?: (v: string[]) => void;
  onSubjectsChange?: (v: string[]) => void;
  onMaterialTypesChange?: (v: string[]) => void;
  onMinPriceChange?: (v: string) => void;
  onMaxPriceChange?: (v: string) => void;
  onSortChange?: (v: string) => void;
  externalForceOpen?: boolean;
  onExternalForceClose?: () => void;
};

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

export function MarketplaceFilters({
  initialGrades = [],
  initialSubjects = [],
  initialMaterialTypes = [],
  initialMinPrice = "",
  initialMaxPrice = "",
  initialSort = "newest",
  onGradesChange,
  onSubjectsChange,
  onMaterialTypesChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  externalForceOpen,
  onExternalForceClose,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [draftGrades,  setDraftGrades]  = useState(initialGrades);
  const [draftSubjects,setDraftSubjects]= useState(initialSubjects);
  const [draftTypes,   setDraftTypes]   = useState(initialMaterialTypes);
  const [draftMin,     setDraftMin]     = useState(initialMinPrice);
  const [draftMax,     setDraftMax]     = useState(initialMaxPrice);
  const [draftSort,    setDraftSort]    = useState(initialSort);

  const [grades,   setGrades]   = useState(initialGrades);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [types,    setTypes]    = useState(initialMaterialTypes);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setGrades(initialGrades); }, [initialGrades]);
  useEffect(() => { setSubjects(initialSubjects); }, [initialSubjects]);
  useEffect(() => { setTypes(initialMaterialTypes); }, [initialMaterialTypes]);
  useEffect(() => { setMinPrice(initialMinPrice); }, [initialMinPrice]);
  useEffect(() => { setMaxPrice(initialMaxPrice); }, [initialMaxPrice]);
  useEffect(() => { setDraftSort(initialSort); }, [initialSort]);

  useEffect(() => {
    if (externalForceOpen) {
      openSheet();
      onExternalForceClose?.();
    }
  }, [externalForceOpen, onExternalForceClose]);

  useEffect(() => {
    if (sheetOpen) document.body.style.overflow = "hidden";
    else           document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSheetOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sheetOpen]);

  const openSheet = () => {
    setDraftGrades(grades); setDraftSubjects(subjects); setDraftTypes(types);
    setDraftMin(minPrice);  setDraftMax(maxPrice);
    setDraftSort(draftSort);
    setSheetOpen(true);
  };

  const applySheet = () => {
    setGrades(draftGrades);   onGradesChange?.(draftGrades);
    setSubjects(draftSubjects); onSubjectsChange?.(draftSubjects);
    setTypes(draftTypes);     onMaterialTypesChange?.(draftTypes);
    setMinPrice(draftMin);    onMinPriceChange?.(draftMin);
    setMaxPrice(draftMax);    onMaxPriceChange?.(draftMax);
    onSortChange?.(draftSort);
    setSheetOpen(false);
  };

  const clearSheet = () => {
    setDraftGrades([]); setDraftSubjects([]); setDraftTypes([]);
    setDraftMin(""); setDraftMax(""); setDraftSort("newest");
  };

  const clearDesktop = () => {
    setGrades([]); onGradesChange?.([]);
    setSubjects([]); onSubjectsChange?.([]);
    setTypes([]); onMaterialTypesChange?.([]);
    setMinPrice(""); onMinPriceChange?.("");
    setMaxPrice(""); onMaxPriceChange?.("");
  };

  const handleDesktopGrade = (v: string) => {
    const n = toggleItem(grades, v);
    setGrades(n);
    onGradesChange?.(n);
  };

  const draftActiveCount = draftGrades.length + draftSubjects.length + draftTypes.length
    + (draftMin ? 1 : 0) + (draftMax ? 1 : 0)
    + (draftSort !== "newest" && draftSort !== "trending" ? 1 : 0);

  const desktopActiveCount = grades.length + subjects.length
    + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const desktopSidebar = (
    <aside className="hidden lg:block px-1 py-1">
      <PaperPanel>
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-bold text-gray-900 flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Filters
            {desktopActiveCount > 0 && (
              <span className="bg-[#008c43] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {desktopActiveCount}
              </span>
            )}
          </span>
          {desktopActiveCount > 0 && (
            <button onClick={clearDesktop} className="text-xs text-[#008c43] font-semibold hover:underline">
              Clear all
            </button>
          )}
        </div>

        <div>
          <FilterSectionLabel>Grade</FilterSectionLabel>
          <GradeChoiceGrid values={grades} onToggle={handleDesktopGrade} />
        </div>

        <div>
          <FilterSectionLabel>Subject</FilterSectionLabel>
          <PaperSelect
            value={subjects[0] ?? ""}
            onChange={(next) => {
              const value = next ? [next] : [];
              setSubjects(value);
              onSubjectsChange?.(value);
            }}
            label="Subject"
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </PaperSelect>
        </div>

        <div>
          <FilterSectionLabel>Price (KES)</FilterSectionLabel>
          <div className="flex items-center gap-2">
            <PaperInput
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => { setMinPrice(e.target.value); onMinPriceChange?.(e.target.value); }}
              className="flex-1"
            />
            <span className="text-gray-300 font-bold shrink-0">–</span>
            <PaperInput
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); onMaxPriceChange?.(e.target.value); }}
              className="flex-1"
            />
          </div>
        </div>
      </PaperPanel>
    </aside>
  );

  const bottomSheet = mounted && sheetOpen && createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSheetOpen(false)}
      />

      <div
        className="relative flex max-h-[90dvh] flex-col overflow-hidden rounded-t-3xl animate-in slide-in-from-bottom duration-300"
        style={{ background: "linear-gradient(180deg, #dcfce7 0%, #ffffff 28%)" }}
      >
        <div className="h-1.5 w-full bg-[#008c43]" />
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2
            className="text-base font-extrabold text-gray-900"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Filters &amp; Sort
          </h2>
          <button onClick={() => setSheetOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-500 shadow-sm hover:bg-gray-50 transition-colors"
            style={{ boxShadow: "0 0 0 1px rgba(15,23,42,0.08)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          <div>
            <FilterSectionLabel>Sort by</FilterSectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setDraftSort(o.value)}
                  className={`relative overflow-hidden rounded-md px-3 pb-2.5 pt-3 text-left text-xs font-semibold transition-transform hover:rotate-0 ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-1"
                  } ${draftSort === o.value ? "rotate-0" : ""}`}
                  style={{
                    background: draftSort === o.value ? "#f1f5f9" : "#ffffff",
                    color: draftSort === o.value ? "#0f172a" : "#334155",
                    boxShadow: draftSort === o.value
                      ? "0 10px 18px -12px rgba(71,85,105,0.7), 0 0 0 1.5px #475569"
                      : "0 6px 12px -8px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.06)",
                  }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-slate-500" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FilterSectionLabel>Grade</FilterSectionLabel>
            <GradeChoiceGrid
              values={draftGrades}
              onToggle={(v) => setDraftGrades(n => toggleItem(n, v))}
            />
          </div>

          <div>
            <FilterSectionLabel>Material Type</FilterSectionLabel>
            <TypeChoiceGrid
              value={draftTypes[0] ?? ""}
              onChange={(next) => setDraftTypes(next ? [next] : [])}
            />
          </div>

          <div>
            <FilterSectionLabel>Subject</FilterSectionLabel>
            <PaperSelect
              value={draftSubjects[0] ?? ""}
              onChange={(next) => setDraftSubjects(next ? [next] : [])}
              label="Subject"
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </PaperSelect>
          </div>

          <div>
            <FilterSectionLabel>Price Range (KES)</FilterSectionLabel>
            <div className="flex items-center gap-3">
              <PaperInput
                type="number"
                placeholder="Min"
                value={draftMin}
                onChange={e => setDraftMin(e.target.value)}
                className="flex-1"
              />
              <span className="text-gray-300 font-bold shrink-0">–</span>
              <PaperInput
                type="number"
                placeholder="Max"
                value={draftMax}
                onChange={e => setDraftMax(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button onClick={clearSheet}
            className="px-5 py-3 rounded-md border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shrink-0 -rotate-1 hover:rotate-0">
            Clear all
          </button>
          <button onClick={applySheet}
            className="flex-1 py-3 rounded-md text-white text-sm font-extrabold transition-all shadow-md shadow-[#008c43]/20 active:scale-[0.98] rotate-1 hover:rotate-0"
            style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}>
            {draftActiveCount > 0
              ? `Show results · ${draftActiveCount} filter${draftActiveCount !== 1 ? "s" : ""}`
              : "Show results"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {bottomSheet}
      {desktopSidebar}
    </>
  );
}
