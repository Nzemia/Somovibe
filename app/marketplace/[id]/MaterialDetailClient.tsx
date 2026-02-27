"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import PurchaseButton from "@/app/marketplace/PurchaseButton";
import { ResourceCard } from "@/components/marketplace/ResourceCard";
import ReviewSection from "./ReviewSection";
import { DownloadSuccessModal } from "./DownloadSuccessModal";

import type { Review } from "../types";


type RelatedPdf = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  materialType: string;
  createdAt: Date | string;
  teacher: { email: string; teacherProfile?: { isActive: boolean } | null };
  _count: { purchases: number };
  reviews: { rating: number }[];
};

type Material = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  price: number;
  materialType: string;
  thumbnailUrl?: string | null;
  createdAt: Date | string;
  teacher: {
    id: string;
    name?: string | null;
    email: string;
    teacherProfile?: { isActive: boolean } | null;
    _count: { pdfs: number };
  };
  _count: { downloads: number; reviews: number; purchases: number; materialViews: number };
  reviews: Review[];
};

type Props = {
  material: Material;
  isPurchased: boolean;
  user: { id: string; email: string; phone: string | null; role: string } | null;
  moreFromTeacher: RelatedPdf[];
  similarMaterials: RelatedPdf[];
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
  CLASS_INSTRUCTIONS: "Class Instructions", SCHEME_OF_WORK: "Scheme of Work",
  LESSON_PLAN: "Lesson Plan", EXAM_QUIZ: "Exam / Quiz",
};

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function avgRatingFromReviews(reviews: { rating: number }[]): number | null {
  if (!reviews.length) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function MaterialDetailClient({ material, isPurchased, user, moreFromTeacher, similarMaterials }: Props) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [coverImgFailed, setCoverImgFailed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const grad = SUBJECT_GRADIENT[material.subject] ?? { from: "#006832", to: "#003318" };
  const teacherHandle = material.teacher.name || material.teacher.email.split("@")[0];
  const isVerified = material.teacher.teacherProfile?.isActive === true;
  const avgRating = avgRatingFromReviews(material.reviews);
  const typeLabel = TYPE_LABELS[material.materialType] ?? material.materialType;
  const isTeacher = !!user && user.id === material.teacher.id;

  const handleDownload = async () => {
    setDownloading(true);
    const t = toast.loading("Preparing download…");
    try {
      const res = await fetch(`/api/pdf/download?pdfId=${material.id}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to download"); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${material.title}.pdf`;
      document.body.appendChild(a); a.click();
      URL.revokeObjectURL(url); document.body.removeChild(a);
      toast.success("Download started!", { id: t });
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err.message || "Download failed", { id: t });
    } finally { setDownloading(false); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: material.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5faf7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* Back link */}
        <Link href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-[#008c43] font-semibold hover:text-[#006832] mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Main column ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Cover */}
            <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64"
              style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
              {material.thumbnailUrl && !coverImgFailed ? (
                <img
                  src={material.thumbnailUrl}
                  alt={material.title}
                  className="w-full h-full object-cover"
                  onError={() => setCoverImgFailed(true)}
                />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                  {/* Subject initials watermark */}
                  <span className="absolute bottom-2 left-5 text-white/10 text-8xl font-black leading-none select-none pointer-events-none">
                    {material.subject.split(" ").map(w => w[0]).join("").slice(0, 3)}
                  </span>
                </>
              )}
              {/* Type badge */}
              <span className="absolute top-4 left-4 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {typeLabel}
              </span>
              {isPurchased && (
                <span className="absolute top-4 right-4 bg-[#008c43] text-white text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Owned
                </span>
              )}
            </div>

            {/* Title + chips */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f0faf5] text-[#006832] border border-[#d1e8dc]">
                  {material.subject}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {material.grade}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {new Date(material.createdAt).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug mb-2">
                {material.title}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">{material.description}</p>
            </div>

            {/* Stats row */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip value={material._count.purchases.toString()} label="Sales" color="emerald" icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>} />
                <StatChip value={material._count.downloads.toString()} label="Downloads" color="sky" icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>} />
                <StatChip value={material._count.materialViews.toString()} label="Views" color="violet" icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>} />
                <StatChip
                  value={avgRating !== null ? avgRating.toFixed(1) : "—"}
                  label={`${material._count.reviews} reviews`}
                  color="amber"
                  icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>}
                />
              </div>
            </div>

            {/* Teacher card */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Created by</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shrink-0"
                  style={{ background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)` }}>
                  {teacherHandle[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 truncate">{teacherHandle}</span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 bg-[#f0faf5] text-[#006832] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#d1e8dc] shrink-0">
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none">
                          <path d="M9.99992 2.5L4.16659 5.20833V9.99999C4.16659 13.5417 6.63325 16.8667 9.99992 17.5C13.3666 16.8667 15.8333 13.5417 15.8333 9.99999V5.20833L9.99992 2.5Z"
                            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M7.5 9.99999L9.16667 11.6667L12.5 8.33333" stroke="currentColor"
                            strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {material.teacher._count.pdfs} material{material.teacher._count.pdfs !== 1 ? "s" : ""} on Somovibe
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <ReviewSection
              materialId={material.id}
              initialReviews={material.reviews}
              isPurchased={isPurchased}
              user={user ? { id: user.id, email: user.email, role: user.role } : null}
              isTeacher={isTeacher}
            />
          </div>

          {/* ─── Sidebar ─── */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden sticky top-24">
              {/* Price header */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <p className="text-3xl font-extrabold text-[#008c43]">KES {material.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-0.5">One-time payment · lifetime access</p>
              </div>

              <div className="px-5 py-4 space-y-3">
                {isPurchased ? (
                  <>
                    <div className="flex items-center gap-2 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl p-3">
                      <svg className="w-4 h-4 text-[#008c43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-semibold text-[#006832]">You own this material</span>
                    </div>
                    <button onClick={handleDownload} disabled={downloading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-[#008c43]/20 active:scale-95"
                      style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}>
                      {downloading ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>Downloading…</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>Download Now</>
                      )}
                    </button>
                  </>
                ) : (
                  <PurchaseButton
                    pdfId={material.id}
                    title={material.title}
                    price={material.price}
                    isPurchased={false}
                    user={user}
                    variant="primary"
                  />
                )}

                {/* Share */}
                <button onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-[#008c43] hover:text-[#008c43] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share this material
                </button>

                {/* Guarantees */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  {[
                    "Instant download after purchase",
                    "Lifetime access to the file",
                    "Quality-verified by Somovibe",
                    "Secure payment via M-Pesa",
                  ].map(g => (
                    <div key={g} className="flex items-center gap-2.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-[#008c43] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── More from this teacher ─── */}
        {moreFromTeacher.length > 0 && (
          <RelatedSection
            title={`More from ${teacherHandle}`}
            subtitle="Other materials by this teacher"
            items={moreFromTeacher}
            user={user}
            purchasedIds={new Set()}
          />
        )}

        {/* ─── Similar materials ─── */}
        {similarMaterials.length > 0 && (
          <RelatedSection
            title={`More ${material.subject} materials`}
            subtitle={`Other ${material.subject} resources on Somovibe`}
            items={similarMaterials}
            user={user}
            purchasedIds={new Set()}
          />
        )}

      </div>

      {/* ── Post-download celebration modal ── */}
      <DownloadSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        material={{
          id: material.id,
          title: material.title,
          subject: material.subject,
          grade: material.grade,
          teacher: { name: material.teacher.name, email: material.teacher.email },
        }}
        moreFromTeacher={moreFromTeacher}
        similarMaterials={similarMaterials}
      />
    </div>
  );
}

function StatChip({ value, label, color, icon }: {
  value: string; label: string; color: "emerald" | "sky" | "violet" | "amber"; icon: React.ReactNode;
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky:     "bg-sky-50 text-sky-600",
    violet:  "bg-violet-50 text-violet-600",
    amber:   "bg-amber-50 text-amber-500",
  };
  return (
    <div className="text-center">
      <div className={`w-9 h-9 rounded-xl ${colors[color]} flex items-center justify-center mx-auto mb-1.5`}>
        {icon}
      </div>
      <p className="text-lg font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function RelatedSection({ title, subtitle, items, user, purchasedIds }: {
  title: string; subtitle: string;
  items: RelatedPdf[];
  user: { id: string; email: string; phone: string | null } | null;
  purchasedIds: Set<string>;
}) {
  return (
    <div className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-[#008c43] uppercase tracking-wider mb-0.5">{subtitle}</p>
          <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        </div>
        <Link href="/marketplace" className="text-sm text-[#008c43] font-semibold hover:underline">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(p => (
          <ResourceCard key={p.id} resource={p} isPurchased={purchasedIds.has(p.id)} user={user} />
        ))}
      </div>
    </div>
  );
}
