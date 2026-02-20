"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ShareButton from "@/components/ShareButton";

export type MaterialRow = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  status: string;
  createdAt: string; // ISO string (serialized from server)
  salesCount: number;
};

const PAGE_SIZE = 10;

type SortKey = "newest" | "oldest" | "most_sales" | "price_high" | "price_low";

export function TeacherMaterials({ materials }: { materials: MaterialRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);

  /* Unique subjects from data */
  const subjects = useMemo(
    () => ["ALL", ...Array.from(new Set(materials.map((m) => m.subject))).sort()],
    [materials]
  );

  /* Filter + sort */
  const filtered = useMemo(() => {
    let rows = [...materials];

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.grade.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "ALL") rows = rows.filter((m) => m.status === statusFilter);
    if (subjectFilter !== "ALL") rows = rows.filter((m) => m.subject === subjectFilter);

    rows.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "most_sales") return b.salesCount - a.salesCount;
      if (sort === "price_high") return b.price - a.price;
      if (sort === "price_low") return a.price - b.price;
      return 0;
    });

    return rows;
  }, [materials, query, statusFilter, subjectFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* Reset to page 1 when filters change */
  function updateFilter<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid transparent" }}>
      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-transparent shadow-sm mb-4 p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search title, subject or grade…"
            value={query}
            onChange={(e) => updateFilter(setQuery, e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent bg-gray-50"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
          className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] min-w-[130px]"
        >
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Subject filter */}
        <select
          value={subjectFilter}
          onChange={(e) => updateFilter(setSubjectFilter, e.target.value)}
          className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] min-w-[130px]"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "All Subjects" : s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => updateFilter(setSort, e.target.value as SortKey)}
          className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#008c43] min-w-[140px]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_sales">Most Sales</option>
          <option value="price_high">Price: High → Low</option>
          <option value="price_low">Price: Low → High</option>
        </select>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm text-gray-500">
          {filtered.length === 0
            ? "No materials found"
            : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} material${filtered.length !== 1 ? "s" : ""}`}
        </p>
        {(query || statusFilter !== "ALL" || subjectFilter !== "ALL") && (
          <button
            onClick={() => { setQuery(""); setStatusFilter("ALL"); setSubjectFilter("ALL"); setPage(1); }}
            className="text-xs text-[#008c43] font-semibold hover:text-[#006832]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table / Empty state ── */}
      {paged.length === 0 ? (
        <div className="bg-white rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-[#f0faf5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {materials.length === 0 ? "No materials yet" : "No results found"}
          </h3>
          <p className="text-gray-400 text-sm mb-5">
            {materials.length === 0
              ? "Upload your first CBC resource and start earning"
              : "Try adjusting your search or filters"}
          </p>
          {materials.length === 0 && (
            <Link href="/teacher/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors text-sm">
              Upload Material
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fdfb] border-b border-[#e8f5ee]">
                  <th className="text-left px-5 py-3 text-gray-500 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Subject</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Grade</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Sales</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold">Date</th>
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
                    <td className="px-4 py-3.5 text-gray-600">{m.subject}</td>
                    <td className="px-4 py-3.5 text-gray-600">{m.grade}</td>
                    <td className="px-4 py-3.5 font-bold text-[#008c43]">KES {m.price}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[m.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{m.salesCount}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      {m.status === "APPROVED" && (
                        <ShareButton url={`/marketplace/${m.id}`} title={m.title} description={m.description} variant="icon" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {paged.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400 truncate">{m.description}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[m.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {m.status.charAt(0) + m.status.slice(1).toLowerCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                  <span>{m.subject}</span>
                  <span>{m.grade}</span>
                  <span className="font-bold text-[#008c43]">KES {m.price}</span>
                  <span>{m.salesCount} sale{m.salesCount !== 1 ? "s" : ""}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 px-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      safePage === p
                        ? "bg-[#008c43] text-white"
                        : "text-gray-600 hover:bg-[#f0faf5] hover:text-[#008c43]"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#008c43] hover:text-[#008c43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
