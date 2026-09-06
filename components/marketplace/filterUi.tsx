"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

export const MATERIAL_TYPES = [
  { value: "PDF",                label: "PDF Notes" },
  { value: "PDF_SLIDES",         label: "Slides" },
  { value: "POWERPOINT",         label: "PowerPoint" },
  { value: "CLASS_INSTRUCTIONS", label: "Instructions" },
  { value: "SCHEME_OF_WORK",     label: "Scheme of Work" },
  { value: "LESSON_PLAN",        label: "Lesson Plan" },
  { value: "EXAM_QUIZ",          label: "Exam / Quiz" },
];

export const GRADE_GROUPS = [
  { value: "1-3", label: "Grades 1–3" },
  { value: "4-6", label: "Grades 4–6" },
  { value: "7-9", label: "Grades 7–9" },
  { value: "secondary", label: "Forms 1–4" },
];

export const SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science", "Social Studies",
  "Agriculture", "Home Science", "Creative Arts", "ICT",
  "Physical Education", "Music", "Religious Education",
  "Business Studies", "Geography", "History",
];

export const PRICE_RANGES = [
  { value: "0-99", label: "Under KES 100" },
  { value: "100-200", label: "KES 100–200" },
  { value: "200-500", label: "KES 200–500" },
  { value: "500+", label: "KES 500+" },
];

export const SORT_OPTIONS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most sold" },
  { value: "rated", label: "Highest rated" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
];

export type TypeCardStyle = {
  stage: string;
  paper: string;
  accent: string;
  ink: string;
  line: string;
  tilt: string;
};

export const TYPE_CARD: Record<string, TypeCardStyle> = {
  PDF: {
    stage: "linear-gradient(155deg, #fecaca 0%, #fee2e2 48%, #fff1f2 100%)",
    paper: "#fff7f7", accent: "#dc2626", ink: "#7f1d1d", line: "#fecaca",
    tilt: "rotate-[-8deg] group-hover:rotate-[-2deg]",
  },
  PDF_SLIDES: {
    stage: "linear-gradient(155deg, #e9d5ff 0%, #f3e8ff 48%, #faf5ff 100%)",
    paper: "#faf5ff", accent: "#7c3aed", ink: "#3b0764", line: "#e9d5ff",
    tilt: "rotate-[-5deg] group-hover:rotate-[-1deg]",
  },
  POWERPOINT: {
    stage: "linear-gradient(155deg, #fed7aa 0%, #ffedd5 48%, #fff7ed 100%)",
    paper: "#fff7ed", accent: "#ea580c", ink: "#7c2d12", line: "#fed7aa",
    tilt: "rotate-[6deg] group-hover:rotate-[1deg]",
  },
  CLASS_INSTRUCTIONS: {
    stage: "linear-gradient(155deg, #99f6e4 0%, #ccfbf1 48%, #f0fdfa 100%)",
    paper: "#f0fdfa", accent: "#0d9488", ink: "#134e4a", line: "#99f6e4",
    tilt: "rotate-[-6deg] group-hover:rotate-[-1deg]",
  },
  SCHEME_OF_WORK: {
    stage: "linear-gradient(155deg, #c7d2fe 0%, #e0e7ff 48%, #eef2ff 100%)",
    paper: "#eef2ff", accent: "#4f46e5", ink: "#1e1b4b", line: "#c7d2fe",
    tilt: "rotate-[7deg] group-hover:rotate-[2deg]",
  },
  LESSON_PLAN: {
    stage: "linear-gradient(155deg, #fecdd3 0%, #ffe4e6 48%, #fff1f2 100%)",
    paper: "#fff1f2", accent: "#e11d48", ink: "#881337", line: "#fecdd3",
    tilt: "rotate-[-7deg] group-hover:rotate-[-2deg]",
  },
  EXAM_QUIZ: {
    stage: "linear-gradient(155deg, #fde68a 0%, #fef3c7 48%, #fffbeb 100%)",
    paper: "#fffbeb", accent: "#d97706", ink: "#78350f", line: "#fde68a",
    tilt: "rotate-[5deg] group-hover:rotate-[1deg]",
  },
};

export const FALLBACK_CARD: TypeCardStyle = {
  stage: "linear-gradient(155deg, #bbf7d0 0%, #dcfce7 48%, #f0fdf4 100%)",
  paper: "#f0fdf4", accent: "#008c43", ink: "#14532d", line: "#bbf7d0",
  tilt: "rotate-[-6deg] group-hover:rotate-[-1deg]",
};

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  MATERIAL_TYPES.map((t) => [t.value, t.label])
);

export const TYPE_ACCENT: Record<string, string> = Object.fromEntries(
  Object.entries(TYPE_CARD).map(([key, style]) => [key, style.accent])
);

export const GRADE_CARD: Record<string, { paper: string; accent: string; ink: string; tilt: string }> = {
  "1-3":       { paper: "#eff6ff", accent: "#2563eb", ink: "#1e3a8a", tilt: "-rotate-2" },
  "4-6":       { paper: "#f0fdf4", accent: "#16a34a", ink: "#14532d", tilt: "rotate-1" },
  "7-9":       { paper: "#fffbeb", accent: "#d97706", ink: "#78350f", tilt: "-rotate-1" },
  secondary:   { paper: "#f5f3ff", accent: "#7c3aed", ink: "#4c1d95", tilt: "rotate-2" },
};

export function priceRangeFromBounds(min?: number, max?: number): string {
  if (min === undefined && max === undefined) return "";
  if (min === 0 && max === 99) return "0-99";
  if (min === 100 && max === 200) return "100-200";
  if (min === 200 && max === 500) return "200-500";
  if (min === 500 && max === undefined) return "500+";
  if (min !== undefined && max !== undefined) return `${min}-${max}`;
  if (min !== undefined) return `${min}+`;
  return "";
}

export function boundsFromPriceRange(value: string): { min?: number; max?: number } {
  if (!value) return {};
  if (value.endsWith("+")) {
    const min = Number.parseInt(value, 10);
    return Number.isNaN(min) ? {} : { min };
  }
  const [rawMin, rawMax] = value.split("-");
  const min = Number.parseInt(rawMin, 10);
  const max = Number.parseInt(rawMax, 10);
  return {
    min: Number.isNaN(min) ? undefined : min,
    max: Number.isNaN(max) ? undefined : max,
  };
}

export function FilterSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
      style={{ fontFamily: "var(--font-oswald), sans-serif", color: "#64748b" }}
    >
      {children}
    </p>
  );
}

export function PaperPanel({
  children,
  stage = "linear-gradient(155deg, #e2e8f0 0%, #f1f5f9 48%, #f8fafc 100%)",
}: {
  children: ReactNode;
  stage?: string;
}) {
  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-2xl" style={{ background: stage }} />
      <div className="absolute inset-x-2 inset-y-1 rotate-[2deg] rounded-lg bg-white/55 shadow-sm" aria-hidden />
      <div className="relative overflow-hidden rounded-xl bg-white/95 shadow-[0_14px_28px_-16px_rgba(15,23,42,0.35)]">
        <div className="p-4 space-y-5">{children}</div>
      </div>
    </div>
  );
}

export function ChoiceCard({
  selected,
  accent,
  paper,
  ink,
  tilt,
  onClick,
  children,
}: {
  selected: boolean;
  accent: string;
  paper: string;
  ink: string;
  tilt: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-md px-2.5 pb-2 pt-3 text-left text-[11px] font-bold leading-tight transition-transform duration-200 hover:rotate-0 ${
        selected ? "rotate-0" : tilt
      }`}
      style={{
        background: selected ? paper : "#ffffff",
        color: selected ? ink : "#334155",
        boxShadow: selected
          ? `0 10px 18px -12px ${accent}aa, 0 0 0 1.5px ${accent}`
          : "0 6px 12px -8px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.06)",
      }}
    >
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      {children}
    </button>
  );
}

export function TypeChoiceGrid({
  value,
  onChange,
  includeAll = true,
}: {
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {includeAll && (
        <ChoiceCard
          selected={!value}
          accent="#94a3b8"
          paper="#f8fafc"
          ink="#334155"
          tilt="-rotate-1"
          onClick={() => onChange("")}
        >
          All types
        </ChoiceCard>
      )}
      {MATERIAL_TYPES.map((t, i) => {
        const style = TYPE_CARD[t.value];
        return (
          <ChoiceCard
            key={t.value}
            selected={value === t.value}
            accent={style.accent}
            paper={style.paper}
            ink={style.ink}
            tilt={i % 2 === 0 ? "-rotate-2" : "rotate-1"}
            onClick={() => onChange(t.value)}
          >
            {t.label}
          </ChoiceCard>
        );
      })}
    </div>
  );
}

export function GradeChoiceGrid({
  values,
  onToggle,
}: {
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {GRADE_GROUPS.map((g) => {
        const style = GRADE_CARD[g.value];
        return (
          <ChoiceCard
            key={g.value}
            selected={values.includes(g.value)}
            accent={style.accent}
            paper={style.paper}
            ink={style.ink}
            tilt={style.tilt}
            onClick={() => onToggle(g.value)}
          >
            {g.label}
          </ChoiceCard>
        );
      })}
    </div>
  );
}

export function PaperSelect({
  value,
  onChange,
  label,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-colors hover:border-gray-300 focus-within:border-gray-400 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full cursor-pointer appearance-none bg-transparent py-2.5 pl-3.5 pr-9 text-sm font-semibold text-gray-900 focus:outline-none"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

export function PaperInput(props: InputHTMLAttributes<HTMLInputElement> & { accent?: string }) {
  const { accent = "#d97706", className = "", ...rest } = props;
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white ${className}`}
      style={{ boxShadow: "0 8px 16px -12px rgba(217,119,6,0.35), 0 0 0 1px rgba(15,23,42,0.08)" }}
    >
      <div className="h-1 w-full" style={{ background: accent }} />
      <input
        {...rest}
        className="w-full bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
      />
    </div>
  );
}

export function PaperSearch({
  focused,
  children,
}: {
  focused: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full">
      <div
        className={`relative flex h-full items-center rounded-xl border-2 bg-white shadow-sm transition-colors ${
          focused ? "border-gray-400" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function TypePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = Boolean(value);
  const style = selected ? (TYPE_CARD[value] ?? FALLBACK_CARD) : {
    paper: "#ffffff",
    accent: "#cbd5e1",
    ink: "#0f172a",
    stage: "#f8fafc",
  };
  const label = TYPE_LABELS[value] ?? "All types";

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1 sm:flex-none sm:min-w-[168px]">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative w-full overflow-hidden rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-semibold transition-transform duration-200 hover:rotate-0 ${
          open ? "rotate-0" : "-rotate-2"
        }`}
        style={{
          background: style.paper,
          color: style.ink,
          borderColor: selected ? style.accent : "#e5e7eb",
        }}
      >
        {selected && (
          <span className="absolute inset-x-0 top-0 h-1" style={{ background: style.accent }} />
        )}
        <span className="block truncate pr-5">{label}</span>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,280px)] rounded-xl p-2.5 shadow-xl"
          style={{ background: style.stage }}
        >
          <div className="rounded-lg bg-white/80 p-2">
            <TypeChoiceGrid
              value={value}
              onChange={(next) => {
                onChange(next);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterFab({ onClick, activeCount = 0 }: { onClick: () => void; activeCount?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filters and Sort"
      className="relative flex h-[46px] w-[46px] items-center justify-center rounded-md bg-[#f0fdf4] text-[#14532d] -rotate-3 shadow-md transition-transform hover:rotate-0 active:scale-95"
      style={{ boxShadow: "0 10px 18px -12px rgba(0,140,67,0.55), 0 0 0 1.5px #008c43" }}
    >
      <span className="absolute inset-x-0 top-0 h-1 rounded-t-md bg-[#008c43]" />
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      {activeCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#008c43] text-[9px] font-bold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}
