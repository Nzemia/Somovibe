"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export type AnalyticsRow = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  status: string;
  materialType: string;
  createdAt: string;
  views: number;
  salesCount: number;
  downloads: number;
  earnings: number;
  buyerEmails: string[];
};

const PAGE_SIZE = 10;

type SortKey = "newest" | "oldest" | "most_views" | "most_sales" | "most_earnings" | "price_high" | "price_low";

const STATUS_OPTIONS = [
  { value: "ALL",      label: "All",      dot: "bg-gray-400"   },
  { value: "APPROVED", label: "Approved", dot: "bg-emerald-500" },
  { value: "PENDING",  label: "Pending",  dot: "bg-amber-400"  },
  { value: "REJECTED", label: "Rejected", dot: "bg-red-500"    },
];

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING:  "bg-amber-50  text-amber-700  border border-amber-200",
  REJECTED: "bg-red-50    text-red-600    border border-red-200",
};

// SVG type icons — same as upload page
const TYPE_ICONS: Record<string, React.ReactNode> = {
  PDF: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="8" y="4" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M22 4v7h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 17h10M13 21h7M13 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  PDF_SLIDES: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="5" y="8" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 14l4 4 3-3 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  POWERPOINT: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="5" y="6" width="26" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="15" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M18 10v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  CLASS_INSTRUCTIONS: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="10" y="6" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M15 17l2 2 4-4M15 23l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  SCHEME_OF_WORK: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="6" y="8" width="28" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 18h28M6 24h28M6 30h28M18 18v16M26 18v16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  LESSON_PLAN: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="7" y="5" width="22" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 13h11M12 18h11M12 23h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  EXAM_QUIZ: (
    <svg viewBox="0 0 40 40" fill="none" className="w-4 h-4">
      <rect x="8" y="5" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 13h10M13 18h10M13 23h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export function AnalyticsMaterials({ materials }: { materials: AnalyticsRow[] }) {
  const [query,         setQuery]         = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [sort,          setSort]          = useState<SortKey>("newest");
  const [page,          setPage]          = useState(1);

  const subjects = useMemo(
    () => ["ALL", ...Array.from(new Set(materials.map(m => m.subject))).sort()],
    [materials]
  );

  const filtered = useMemo(() => {
    let rows = [...materials];
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
    if (statusFilter  !== "ALL") rows = rows.filter(m => m.status  === statusFilter);
    if (subjectFilter !== "ALL") rows = rows.filter(m => m.subject === subjectFilter);
    rows.sort((a, b) => {
      if (sort === "newest")        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest")        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "most_views")    return b.views      - a.views;
      if (sort === "most_sales")    return b.salesCount - a.salesCount;
      if (sort === "most_earnings") return b.earnings   - a.earnings;
      if (sort === "price_high")    return b.price      - a.price;
      if (sort === "price_low")     return a.price      - b.price;
      return 0;
    });
    return rows;
  }, [materials, query, statusFilter, subjectFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const anyFilter  = query || statusFilter !== "ALL" || subjectFilter !== "ALL";

  function set<T>(setter: (v: T) => void, val: T) { setter(val); setPage(1); }

  return (
    <div className="space-y-4">

      {/* ── Filter bar — identical structure to TeacherMaterials ── */}
      <div className="bg-white rounded-2xl border border-[#e8f5ee] p-3 flex flex-col sm:flex-row gap-2.5">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search materials…"
            value={query}
            onChange={e => set(setQuery, e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => set(setStatusFilter, s.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                statusFilter === s.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Subject */}
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <select
            value={subjectFilter}
            onChange={e => set(setSubjectFilter, e.target.value)}
            className="pl-7 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] appearance-none cursor-pointer min-w-[110px]"
          >
            {subjects.map(s => <option key={s} value={s}>{s === "ALL" ? "All Subjects" : s}</option>)}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Sort */}
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M9 17h6" />
          </svg>
          <select
            value={sort}
            onChange={e => set(setSort, e.target.value as SortKey)}
            className="pl-7 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most_views">Most views</option>
            <option value="most_sales">Most sales</option>
            <option value="most_earnings">Most earnings</option>
            <option value="price_high">Price ↓</option>
            <option value="price_low">Price ↑</option>
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-400">
          {filtered.length === 0
            ? "No results"
            : `${filtered.length} material${filtered.length !== 1 ? "s" : ""}${anyFilter ? " found" : ""}`}
        </p>
        {anyFilter && (
          <button
            onClick={() => { set(setQuery, ""); set(setStatusFilter, "ALL"); set(setSubjectFilter, "ALL"); }}
            className="text-xs text-[#008c43] font-semibold hover:text-[#006832]"
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {paged.length === 0 ? (
        <div className="bg-white rounded-2xl py-14 text-center border border-[#e8f5ee]">
          <div className="w-12 h-12 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-bold text-gray-900 mb-1">
            {materials.length === 0 ? "No materials yet" : "No results found"}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {materials.length === 0 ? "Upload your first resource to see analytics" : "Try adjusting your filters"}
          </p>
          {materials.length === 0 && (
            <Link href="/teacher/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-xl text-sm"
              style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Material
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl overflow-hidden border border-[#e8f5ee]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fdfb] border-b border-[#eaf5f0]">
                  <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Material</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Views</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Sales</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Downloads</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Conv.</th>
                  <th className="text-center px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Earnings</th>
                  <th className="text-left px-3 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5fbf8]">
                {paged.map(m => {
                  const conv = m.views > 0 ? ((m.salesCount / m.views) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={m.id} className="hover:bg-[#f8fdfb] transition-colors">
                      {/* Material identity */}
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                            {TYPE_ICONS[m.materialType] ?? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm leading-snug">{m.title}</p>
                            <p className="text-xs text-gray-400">{m.subject} · {m.grade}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-sky-600">{m.views}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-emerald-600">{m.salesCount}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-violet-600">{m.downloads}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-amber-600">{conv}%</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-sm font-bold text-[#008c43]">KES {m.earnings.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[m.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                          {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {m.status === "APPROVED" && (
                          <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Buyers row — shows below each approved material with purchases */}
            {paged.some(m => m.buyerEmails.length > 0) && (
              <div className="border-t border-[#eaf5f0] px-5 py-3 bg-[#f8fdfb]">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Recent buyers</p>
                <div className="space-y-2">
                  {paged.filter(m => m.buyerEmails.length > 0).map(m => (
                    <div key={`buyers-${m.id}`} className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-500 min-w-[140px] truncate font-medium">{m.title}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.buyerEmails.slice(0, 5).map((email, i) => (
                          <span key={i} className="text-xs bg-[#f0faf5] text-[#006832] font-medium px-2.5 py-0.5 rounded-full">
                            {email.split("@")[0]}
                          </span>
                        ))}
                        {m.buyerEmails.length > 5 && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                            +{m.buyerEmails.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile — connected list with stat chips */}
          <div className="sm:hidden bg-white rounded-2xl overflow-hidden border border-[#e8f5ee] divide-y divide-[#f0faf5]">
            {paged.map(m => {
              const conv = m.views > 0 ? ((m.salesCount / m.views) * 100).toFixed(1) : "0.0";
              const ss = STATUS_STYLE[m.status] ?? "bg-gray-100 text-gray-600 border border-gray-200";
              return (
                <div key={m.id} className="px-4 py-4">
                  {/* Header row */}
                  <div className="flex items-start gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                      {TYPE_ICONS[m.materialType] ?? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{m.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">{m.subject} · {m.grade}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${ss}`}>
                          {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    {m.status === "APPROVED" && (
                      <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                    )}
                  </div>

                  {/* Stat chips */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: "Views",     value: m.views,                              bg: "bg-sky-50",     text: "text-sky-700"     },
                      { label: "Sales",     value: m.salesCount,                         bg: "bg-emerald-50", text: "text-emerald-700" },
                      { label: "DLs",       value: m.downloads,                          bg: "bg-violet-50",  text: "text-violet-700"  },
                      { label: "Conv.",     value: `${conv}%`,                           bg: "bg-amber-50",   text: "text-amber-700"   },
                      { label: "KES",       value: m.earnings.toLocaleString(),          bg: "bg-[#f0faf5]",  text: "text-[#008c43]"   },
                    ].map(s => (
                      <div key={s.label} className={`flex flex-col items-center py-2 rounded-xl ${s.bg}`}>
                        <span className={`text-xs font-extrabold leading-none ${s.text}`}>{s.value}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Pagination — identical to TeacherMaterials ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="w-7 text-center text-gray-400 text-xs">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      safePage === p ? "bg-[#008c43] text-white" : "text-gray-600 hover:bg-[#f0faf5] hover:text-[#008c43]"
                    }`}>
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
