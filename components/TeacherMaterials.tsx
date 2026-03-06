"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export type MaterialRow = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  status: string;
  createdAt: string;
  salesCount: number;
};

const PAGE_SIZE = 10;
type SortKey = "newest" | "oldest" | "most_sales" | "price_high" | "price_low";

const STATUS_OPTIONS = [
  { value: "ALL",      label: "All",      dot: "bg-gray-400" },
  { value: "APPROVED", label: "Approved", dot: "bg-emerald-500" },
  { value: "PENDING",  label: "Pending",  dot: "bg-amber-400" },
  { value: "REJECTED", label: "Rejected", dot: "bg-red-500" },
];

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING:  "bg-amber-50 text-amber-700 border border-amber-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
};

export function TeacherMaterials({ materials }: { materials: MaterialRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/teacher/material/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete material");
      }

      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const [query, setQuery]               = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [sort, setSort]                 = useState<SortKey>("newest");
  const [page, setPage]                 = useState(1);

  const subjects = useMemo(
    () => ["ALL", ...Array.from(new Set(materials.map((m) => m.subject))).sort()],
    [materials]
  );

  const filtered = useMemo(() => {
    let rows = [...materials];
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.grade.toLowerCase().includes(q)
    );
    if (statusFilter !== "ALL") rows = rows.filter((m) => m.status === statusFilter);
    if (subjectFilter !== "ALL") rows = rows.filter((m) => m.subject === subjectFilter);
    rows.sort((a, b) => {
      if (sort === "newest")     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest")     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "most_sales") return b.salesCount - a.salesCount;
      if (sort === "price_high") return b.price - a.price;
      if (sort === "price_low")  return a.price - b.price;
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

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-[#e8f5ee] p-3 flex flex-col sm:flex-row gap-2.5">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search materials…"
            value={query}
            onChange={(e) => set(setQuery, e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => set(setStatusFilter, s.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                statusFilter === s.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Subject — icon + select */}
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <select
            value={subjectFilter}
            onChange={(e) => set(setSubjectFilter, e.target.value)}
            className="pl-7 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] appearance-none cursor-pointer min-w-[110px]"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Subjects" : s}</option>
            ))}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Sort — icon + select */}
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M9 17h6" />
          </svg>
          <select
            value={sort}
            onChange={(e) => set(setSort, e.target.value as SortKey)}
            className="pl-7 pr-7 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] appearance-none cursor-pointer min-w-[130px]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most_sales">Most Sales</option>
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
          {filtered.length === 0 ? "No results" : `${filtered.length} material${filtered.length !== 1 ? "s" : ""}${anyFilter ? " found" : ""}`}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-bold text-gray-900 mb-1">{materials.length === 0 ? "No materials yet" : "No results found"}</p>
          <p className="text-gray-400 text-sm mb-4">{materials.length === 0 ? "Upload your first resource" : "Try adjusting your filters"}</p>
          {materials.length === 0 && (
            <Link href="/teacher/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] text-sm">
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
                  <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Subject</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Grade</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Sales</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5fbf8]">
                {paged.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f8fdfb] transition-colors">
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="font-semibold text-gray-900 truncate">{m.title}</p>
                      <p className="text-xs text-gray-400 truncate">{m.description}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{m.subject}</td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{m.grade}</td>
                    <td className="px-4 py-3.5 font-bold text-[#008c43] text-sm">KES {m.price}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[m.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                        {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 text-sm">{m.salesCount}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {m.status === "APPROVED" && (
                          <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                        )}
                        <button
                          onClick={() => handleDelete(m.id, m.title)}
                          disabled={deletingId === m.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Material"
                        >
                          {deletingId === m.id ? (
                            <svg className="animate-spin w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile — single connected list */}
          <div className="sm:hidden bg-white rounded-2xl overflow-hidden border border-[#e8f5ee] divide-y divide-[#f0faf5]">
            {paged.map((m) => (
              <div key={m.id} className="px-4 py-3.5 flex items-start gap-3">
                {/* Status dot */}
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                  m.status === "APPROVED" ? "bg-emerald-500" :
                  m.status === "PENDING"  ? "bg-amber-400" :
                  "bg-red-500"
                }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{m.title}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                    <span>{m.subject}</span>
                    <span>{m.grade}</span>
                    <span className="font-bold text-[#008c43]">KES {m.price}</span>
                    <span>{m.salesCount} sale{m.salesCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Status badge + share */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[m.status] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                    {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                  </span>
                  {m.status === "APPROVED" && (
                    <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                  )}
                  <button
                    onClick={() => handleDelete(m.id, m.title)}
                    disabled={deletingId === m.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === m.id ? (
                      <svg className="animate-spin w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="w-7 text-center text-gray-400 text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      safePage === p ? "bg-[#008c43] text-white" : "text-gray-600 hover:bg-[#f0faf5] hover:text-[#008c43]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
