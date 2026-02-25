"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  initialGrades?: string[];
  initialSubjects?: string[];
  initialMaterialTypes?: string[];
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialVerifiedOnly?: boolean;
  initialSort?: string;
  onGradesChange?: (v: string[]) => void;
  onSubjectsChange?: (v: string[]) => void;
  onMaterialTypesChange?: (v: string[]) => void;
  onMinPriceChange?: (v: string) => void;
  onMaxPriceChange?: (v: string) => void;
  onVerifiedOnlyChange?: (v: boolean) => void;
  onSortChange?: (v: string) => void;
};

const GRADE_GROUPS = [
  { value: "1-3", label: "Grades 1–3" },
  { value: "4-6", label: "Grades 4–6" },
  { value: "7-9", label: "Grades 7–9" },
];

const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science", "Social Studies",
  "Agriculture", "Home Science", "Creative Arts", "ICT",
  "Physical Education", "Music", "Religious Education",
  "Business Studies", "Geography", "History",
];

const MATERIAL_TYPES = [
  { value: "PDF",                label: "PDF Notes" },
  { value: "PDF_SLIDES",         label: "Slides" },
  { value: "POWERPOINT",         label: "PowerPoint" },
  { value: "CLASS_INSTRUCTIONS", label: "Instructions" },
  { value: "SCHEME_OF_WORK",     label: "Scheme of Work" },
  { value: "LESSON_PLAN",        label: "Lesson Plan" },
  { value: "EXAM_QUIZ",          label: "Exam / Quiz" },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "oldest",     label: "Oldest first" },
  { value: "popular",    label: "Most sold" },
  { value: "rated",      label: "Highest rated" },
  { value: "price-low",  label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
];

function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

const pillBase = "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 cursor-pointer";
const pillOn  = "bg-[#008c43] text-white border-[#008c43] shadow-sm";
const pillOff = "bg-white text-gray-600 border-gray-200 hover:border-[#008c43]/60 hover:text-[#008c43]";

const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#008c43] focus:ring-1 focus:ring-[#008c43]/20 transition-colors";

export function MarketplaceFilters({
  initialGrades = [],
  initialSubjects = [],
  initialMaterialTypes = [],
  initialMinPrice = "",
  initialMaxPrice = "",
  initialVerifiedOnly = false,
  initialSort = "newest",
  onGradesChange,
  onSubjectsChange,
  onMaterialTypesChange,
  onMinPriceChange,
  onMaxPriceChange,
  onVerifiedOnlyChange,
  onSortChange,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Local sheet state — applied on "Show results"
  const [draftGrades,  setDraftGrades]  = useState(initialGrades);
  const [draftSubjects,setDraftSubjects]= useState(initialSubjects);
  const [draftTypes,   setDraftTypes]   = useState(initialMaterialTypes);
  const [draftMin,     setDraftMin]     = useState(initialMinPrice);
  const [draftMax,     setDraftMax]     = useState(initialMaxPrice);
  const [draftVerified,setDraftVerified]= useState(initialVerifiedOnly);
  const [draftSort,    setDraftSort]    = useState(initialSort);

  // Desktop live state
  const [grades,   setGrades]   = useState(initialGrades);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [types,    setTypes]    = useState(initialMaterialTypes);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [verified, setVerified] = useState(initialVerifiedOnly);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (sheetOpen) document.body.style.overflow = "hidden";
    else           document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  // Escape key closes sheet
  useEffect(() => {
    if (!sheetOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSheetOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [sheetOpen]);

  const openSheet = () => {
    // Seed draft from current desktop state
    setDraftGrades(grades); setDraftSubjects(subjects); setDraftTypes(types);
    setDraftMin(minPrice);  setDraftMax(maxPrice);      setDraftVerified(verified);
    setDraftSort(draftSort);
    setSheetOpen(true);
  };

  const applySheet = () => {
    setGrades(draftGrades);   onGradesChange?.(draftGrades);
    setSubjects(draftSubjects); onSubjectsChange?.(draftSubjects);
    setTypes(draftTypes);     onMaterialTypesChange?.(draftTypes);
    setMinPrice(draftMin);    onMinPriceChange?.(draftMin);
    setMaxPrice(draftMax);    onMaxPriceChange?.(draftMax);
    setVerified(draftVerified); onVerifiedOnlyChange?.(draftVerified);
    onSortChange?.(draftSort);
    setSheetOpen(false);
  };

  const clearSheet = () => {
    setDraftGrades([]); setDraftSubjects([]); setDraftTypes([]);
    setDraftMin(""); setDraftMax(""); setDraftVerified(false); setDraftSort("newest");
  };

  const clearDesktop = () => {
    setGrades([]); onGradesChange?.([]);
    setSubjects([]); onSubjectsChange?.([]);
    setTypes([]); onMaterialTypesChange?.([]);
    setMinPrice(""); onMinPriceChange?.("");
    setMaxPrice(""); onMaxPriceChange?.("");
    setVerified(false); onVerifiedOnlyChange?.(false);
  };

  const handleDesktopGrade   = (v: string) => { const n = toggleItem(grades, v);   setGrades(n);   onGradesChange?.(n); };
  const handleDesktopSubject = (v: string) => { const n = toggleItem(subjects, v); setSubjects(n); onSubjectsChange?.(n); };
  const handleDesktopType    = (v: string) => { const n = toggleItem(types, v);    setTypes(n);    onMaterialTypesChange?.(n); };

  const draftActiveCount = draftGrades.length + draftSubjects.length + draftTypes.length
    + (draftMin ? 1 : 0) + (draftMax ? 1 : 0) + (draftVerified ? 1 : 0)
    + (draftSort !== "newest" ? 1 : 0);

  const desktopActiveCount = grades.length + subjects.length + types.length
    + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (verified ? 1 : 0);

  /* ─────────────── DESKTOP sidebar ─────────────── */
  const desktopSidebar = (
    <aside className="hidden lg:block">
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
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

        {/* Material type */}
        <SidebarSection title="Material Type">
          <div className="flex flex-wrap gap-1.5">
            {MATERIAL_TYPES.map(t => (
              <button key={t.value} onClick={() => handleDesktopType(t.value)}
                className={`${pillBase} ${types.includes(t.value) ? pillOn : pillOff}`}>
                {t.label}
              </button>
            ))}
          </div>
        </SidebarSection>

        {/* Grade */}
        <SidebarSection title="Grade">
          <div className="space-y-1.5">
            {GRADE_GROUPS.map(g => (
              <CheckRow key={g.value} label={g.label} checked={grades.includes(g.value)}
                onChange={() => handleDesktopGrade(g.value)} />
            ))}
          </div>
        </SidebarSection>

        {/* Subject */}
        <SidebarSection title="Subject">
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {SUBJECTS.map(s => (
              <CheckRow key={s} label={s} checked={subjects.includes(s)}
                onChange={() => handleDesktopSubject(s)} />
            ))}
          </div>
        </SidebarSection>

        {/* Price */}
        <SidebarSection title="Price (KES)">
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice}
              onChange={e => { setMinPrice(e.target.value); onMinPriceChange?.(e.target.value); }}
              className={inputCls} />
            <span className="text-gray-300 font-bold shrink-0">–</span>
            <input type="number" placeholder="Max" value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); onMaxPriceChange?.(e.target.value); }}
              className={inputCls} />
          </div>
        </SidebarSection>

        {/* Verified */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-gray-800">Verified teachers only</p>
            <p className="text-xs text-gray-400 mt-0.5">Active on Somovibe</p>
          </div>
          <Toggle on={verified} onToggle={() => { setVerified(!verified); onVerifiedOnlyChange?.(!verified); }} />
        </div>
      </div>
    </aside>
  );

  /* ─────────────── MOBILE trigger button ─────────────── */
  const mobileTrigger = (
    <div className="lg:hidden mb-3">
      <button
        onClick={openSheet}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-800 shadow-sm hover:border-[#008c43] hover:text-[#008c43] transition-colors active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filters &amp; Sort
        {(desktopActiveCount > 0 || draftSort !== "newest") && (
          <span className="bg-[#008c43] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
            {desktopActiveCount + (draftSort !== "newest" ? 1 : 0)}
          </span>
        )}
      </button>
    </div>
  );

  /* ─────────────── BOTTOM SHEET ─────────────── */
  const bottomSheet = mounted && sheetOpen && createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setSheetOpen(false)}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl flex flex-col max-h-[90dvh] animate-in slide-in-from-bottom duration-300">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-extrabold text-gray-900">Filters &amp; Sort</h2>
          <button onClick={() => setSheetOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Sort */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Sort by</p>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setDraftSort(o.value)}
                  className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-left transition-all ${
                    draftSort === o.value
                      ? "bg-[#008c43] text-white border-[#008c43]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#008c43]/50"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Grade</p>
            <div className="flex flex-wrap gap-2">
              {GRADE_GROUPS.map(g => (
                <button key={g.value} onClick={() => setDraftGrades(n => toggleItem(n, g.value))}
                  className={`${pillBase} py-2 ${draftGrades.includes(g.value) ? pillOn : pillOff}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Material type */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Material Type</p>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_TYPES.map(t => (
                <button key={t.value} onClick={() => setDraftTypes(n => toggleItem(n, t.value))}
                  className={`${pillBase} py-2 ${draftTypes.includes(t.value) ? pillOn : pillOff}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Subject</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setDraftSubjects(n => toggleItem(n, s))}
                  className={`${pillBase} py-2 ${draftSubjects.includes(s) ? pillOn : pillOff}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Price Range (KES)</p>
            <div className="flex items-center gap-3">
              <input type="number" placeholder="Min" value={draftMin}
                onChange={e => setDraftMin(e.target.value)}
                className={inputCls} />
              <span className="text-gray-300 font-bold shrink-0">–</span>
              <input type="number" placeholder="Max" value={draftMax}
                onChange={e => setDraftMax(e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Verified only */}
          <div className="flex items-center justify-between pb-2">
            <div>
              <p className="text-sm font-bold text-gray-800">Verified teachers only</p>
              <p className="text-xs text-gray-400 mt-0.5">Materials from active Somovibe teachers</p>
            </div>
            <Toggle on={draftVerified} onToggle={() => setDraftVerified(v => !v)} />
          </div>

        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-white">
          <button onClick={clearSheet}
            className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shrink-0">
            Clear all
          </button>
          <button onClick={applySheet}
            className="flex-1 py-3 rounded-2xl text-white text-sm font-extrabold transition-all shadow-md shadow-[#008c43]/20 active:scale-[0.98]"
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
      {mobileTrigger}
      {bottomSheet}
      {desktopSidebar}
    </>
  );
}

/* ── Shared sub-components ── */

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-[#008c43] border-[#008c43]" : "border-gray-300 group-hover:border-[#008c43]"
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor">
            <path d="M2 6l3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle}
      className={`relative w-11 rounded-full transition-colors shrink-0 ${on ? "bg-[#008c43]" : "bg-gray-200"}`}
      style={{ height: "24px" }}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
