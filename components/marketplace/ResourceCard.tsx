"use client";

import { useState } from "react";
import Link from "next/link";
import PurchaseButton from "@/app/marketplace/PurchaseButton";

type PdfItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  materialType: string;
  thumbnailUrl?: string | null;
  createdAt?: Date | string;
  teacher: {
    name?: string | null;
    email: string;
    teacherProfile?: { isActive: boolean } | null;
  };
  _count: { purchases: number };
  reviews: { rating: number }[];
};

type ResourceCardProps = {
  resource: PdfItem;
  isPurchased: boolean;
  user: { id: string; email: string; phone: string | null } | null;
};

const SUBJECT_GRADIENT: Record<string, { from: string; to: string }> = {
  Mathematics:           { from: "#6d28d9", to: "#4c1d95" },
  English:               { from: "#2563eb", to: "#1e40af" },
  Kiswahili:             { from: "#0d9488", to: "#0f766e" },
  Science:               { from: "#0284c7", to: "#075985" },
  "Social Studies":      { from: "#d97706", to: "#b45309" },
  Agriculture:           { from: "#65a30d", to: "#4d7c0f" },
  "Home Science":        { from: "#db2777", to: "#9d174d" },
  "Creative Arts":       { from: "#c026d3", to: "#86198f" },
  ICT:                   { from: "#0ea5e9", to: "#0369a1" },
  "Physical Education":  { from: "#ea580c", to: "#9a3412" },
  Music:                 { from: "#7c3aed", to: "#5b21b6" },
  "Religious Education": { from: "#b45309", to: "#78350f" },
  "Business Studies":    { from: "#059669", to: "#065f46" },
  Geography:             { from: "#16a34a", to: "#14532d" },
  History:               { from: "#d97706", to: "#92400e" },
};

const TYPE_LABELS: Record<string, string> = {
  PDF: "PDF Notes", PDF_SLIDES: "Slides", POWERPOINT: "PowerPoint",
  CLASS_INSTRUCTIONS: "Instructions", SCHEME_OF_WORK: "Scheme of Work",
  LESSON_PLAN: "Lesson Plan", EXAM_QUIZ: "Exam / Quiz",
};

function computeAvgRating(reviews: { rating: number }[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function ResourceCard({ resource, isPurchased, user }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const grad = SUBJECT_GRADIENT[resource.subject] ?? { from: "#006832", to: "#003318" };
  const teacherHandle = resource.teacher.name || resource.teacher.email.split("@")[0];
  const isVerified = resource.teacher.teacherProfile?.isActive === true;
  const avgRating = computeAvgRating(resource.reviews);
  const salesCount = resource._count.purchases;
  const typeLabel = TYPE_LABELS[resource.materialType] ?? resource.materialType;

  return (
    <article
      className={`group flex flex-col rounded-2xl bg-white border-2 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer
        ${expanded ? "border-[#008c43] shadow-lg shadow-[#008c43]/10 z-10 relative" : "border-gray-100 hover:shadow-md hover:-translate-y-0.5"}`}
      onClick={() => setExpanded(v => !v)}
    >

      {/* ── Cover ── */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ height: "clamp(130px, 38vw, 172px)" }}
      >
        {/* Background */}
        {resource.thumbnailUrl ? (
          <img src={resource.thumbnailUrl} alt={resource.title}
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.80) 100%)" }} />

        {/* Type badge */}
        <span className="absolute top-2 left-2 bg-black/30 border border-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm uppercase tracking-wide">
          {typeLabel}
        </span>

        {/* Owned badge */}
        {isPurchased && (
          <span className="absolute top-2 right-2 bg-[#008c43] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            ✓ Owned
          </span>
        )}

        {/* Expand hint */}
        <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>

        {/* Title overlay — big Oswald */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 pt-5">
          <h3
            className="text-white uppercase text-center leading-tight line-clamp-3 text-xl sm:text-2xl font-bold tracking-wide drop-shadow-lg"
            style={{ fontFamily: "var(--font-oswald), sans-serif", fontWeight: 700 }}
          >
            {resource.title}
          </h3>
        </div>
      </div>

      {/* ── Compact body (always visible) ── */}
      <div className="px-2.5 sm:px-3.5 pt-2.5 pb-3">

        {/* Subject + grade chips */}
        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0faf5] text-[#006832] border border-[#d1e8dc] truncate max-w-[90px] sm:max-w-none">
            {resource.subject}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
            {resource.grade}
          </span>
        </div>

        {/* Title in body (smaller, descriptive) */}
        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 mb-1">
          {resource.title}
        </p>

        {/* Short description */}
        <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Price row (compact, always visible) */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-100"
          onClick={e => e.stopPropagation()} // don't let buy-button clicks toggle the card
        >
          <span className="text-sm font-extrabold text-[#008c43]">
            KES {resource.price.toLocaleString()}
          </span>
          <PurchaseButton
            pdfId={resource.id}
            title={resource.title}
            price={resource.price}
            isPurchased={isPurchased}
            user={user}
            variant="secondary"
          />
        </div>
      </div>

      {/* ── Expanded panel (slides down) ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-3 sm:px-3.5 pb-4 pt-1 border-t border-gray-100 space-y-3">

          {/* Full description */}
          <p className="text-xs text-gray-600 leading-relaxed">
            {resource.description}
          </p>

          {/* Extra chips row */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {typeLabel}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0faf5] text-[#006832] border border-[#d1e8dc]">
              {resource.subject}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {resource.grade}
            </span>
          </div>

          {/* Teacher row */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
              {teacherHandle[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-800 truncate">{teacherHandle}</span>
                {isVerified && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#006832] bg-[#f0faf5] border border-[#d1e8dc] px-1.5 py-0.5 rounded-full shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="none">
                      <path d="M9.99992 2.5L4.16659 5.20833V9.99999C4.16659 13.5417 6.63325 16.8667 9.99992 17.5C13.3666 16.8667 15.8333 13.5417 15.8333 9.99999V5.20833L9.99992 2.5Z"
                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7.5 9.99999L9.16667 11.6667L12.5 8.33333"
                        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
            {/* Stats */}
            <div className="flex items-center gap-2 shrink-0 text-[10px]">
              {avgRating !== null && (
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {avgRating.toFixed(1)}
                </span>
              )}
              {salesCount > 0 && (
                <span className="text-gray-400">{salesCount} sold</span>
              )}
            </div>
          </div>

          {/* View full details link */}
          <Link
            href={`/marketplace/${resource.id}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border-2 border-[#008c43] text-[#008c43] text-xs font-bold hover:bg-[#f0faf5] transition-colors"
            onClick={e => e.stopPropagation()}
          >
            View full details
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

        </div>
      </div>

    </article>
  );
}
