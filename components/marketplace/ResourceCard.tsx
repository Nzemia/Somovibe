"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PurchaseButton from "@/app/marketplace/PurchaseButton";
import { FALLBACK_CARD, TYPE_CARD, TYPE_LABELS } from "./filterUi";

type PdfItem = {
  id: string;
  slug?: string | null;
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

function computeAvgRating(reviews: { rating: number }[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function ResourceCard({ resource, isPurchased, user }: ResourceCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const typeCard = TYPE_CARD[resource.materialType] ?? FALLBACK_CARD;
  const teacherHandle = resource.teacher.name || resource.teacher.email.split("@")[0];
  const isVerified = resource.teacher.teacherProfile?.isActive === true;
  const avgRating = computeAvgRating(resource.reviews);
  const salesCount = resource._count.purchases;
  const typeLabel = TYPE_LABELS[resource.materialType] ?? resource.materialType;

  return (
    <article
      className={`group flex flex-col rounded-2xl bg-white border-2 shadow-sm transition-all duration-300 overflow-hidden
        ${expanded ? "border-[#008c43] shadow-lg shadow-[#008c43]/10 z-10 relative" : "border-gray-100 hover:shadow-md hover:-translate-y-0.5"}`}
    >

      {/* ── Cover — tilted type card ── */}
      <Link
        className="relative overflow-hidden shrink-0 cursor-pointer block"
        style={{ height: "clamp(148px, 40vw, 188px)" }}
        href={`/marketplace/${resource.slug ?? resource.id}`}
        prefetch={true}
      >
        <div className="absolute inset-0" style={{ background: typeCard.stage }} />
        <div
          className="absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-40"
          style={{ background: typeCard.accent }}
        />
        <div
          className="absolute -left-8 -bottom-10 h-28 w-28 rounded-full opacity-25"
          style={{ background: typeCard.accent }}
        />

        {isPurchased && (
          <span className="absolute top-2 right-2 z-10 bg-[#008c43] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
            ✓ Owned
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute h-[78%] w-[58%] rounded-md bg-white/70 shadow-sm rotate-[10deg] translate-x-2.5"
            aria-hidden
          />
          <div
            className={`relative h-[80%] w-[60%] overflow-hidden rounded-md shadow-xl transition-transform duration-300 ease-out group-hover:scale-[1.04] ${typeCard.tilt}`}
            style={{ boxShadow: `0 16px 32px -12px ${typeCard.accent}66, 0 4px 12px rgba(15,23,42,0.14)` }}
          >
            {resource.thumbnailUrl && !imgFailed ? (
              <img
                src={resource.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: typeCard.paper }} />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: resource.thumbnailUrl && !imgFailed
                  ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.72) 55%, rgba(255,255,255,0.94) 100%)"
                  : undefined,
              }}
            />
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1.5 w-full shrink-0" style={{ background: typeCard.accent }} />
              <div className="flex min-h-0 flex-1 flex-col px-2.5 pb-2 pt-1.5">
                <span
                  className="mb-1 w-fit rounded-[3px] px-1.5 py-px text-[8px] font-extrabold uppercase tracking-wider"
                  style={{ background: `${typeCard.accent}18`, color: typeCard.accent }}
                >
                  {typeLabel}
                </span>
                <h3
                  className="line-clamp-4 text-sm font-black uppercase leading-snug tracking-wide sm:text-base"
                  style={{ fontFamily: "var(--font-oswald), sans-serif", fontWeight: 800, color: typeCard.ink }}
                >
                  {resource.title}
                </h3>
                <div className="mt-auto space-y-1 pt-2" aria-hidden>
                  <div className="h-px w-full" style={{ background: typeCard.line }} />
                  <div className="h-px w-4/5" style={{ background: typeCard.line }} />
                  <div className="h-px w-3/5" style={{ background: typeCard.line }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Compact body — click toggles expand ── */}
      <div
        className="px-2.5 sm:px-3.5 pt-2.5 pb-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >

        {/* Subject + grade chips */}
        <div className="flex flex-wrap items-center gap-1 mb-1.5">
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f0faf5] text-[#006832] border border-[#d1e8dc] truncate max-w-[90px] sm:max-w-none">
            {resource.subject}
          </span>
          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
            {resource.grade}
          </span>
        </div>

        {/* Title in body (smaller, descriptive) with expand indicator */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 flex-1">
            {resource.title}
          </p>
          <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Short description */}
        <p className="text-[11px] text-gray-400 line-clamp-1 mb-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Price row — stop propagation so buy button doesn't toggle expand */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-100"
          onClick={e => e.stopPropagation()}
        >
          <span className="text-sm font-extrabold text-[#008c43]">
            KES {resource.price.toLocaleString()}
          </span>
          <PurchaseButton
            pdfId={resource.id}
            slug={resource.slug}
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
            href={`/marketplace/${resource.slug ?? resource.id}`}
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
