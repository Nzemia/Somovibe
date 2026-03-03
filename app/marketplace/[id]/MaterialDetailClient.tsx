"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { getAverageRating } from "@/lib/utils";
import Link from "next/link";
import PurchaseButton from "@/app/marketplace/PurchaseButton";
import { ResourceCard } from "@/components/marketplace/ResourceCard";
import ReviewSection from "./ReviewSection";
import { DownloadSuccessModal } from "./DownloadSuccessModal";

import type { Review } from "../types";
import type { ReactNode } from "react";


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

export default function MaterialDetailClient({
  material,
  isPurchased,
  user,
  moreFromTeacher,
  similarMaterials,
}: Props) {
    const router = useRouter();
  const searchParams = useSearchParams();
    const [downloading, setDownloading] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
  const [coverImgFailed, setCoverImgFailed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // new states for phone prompt (no longer require profile storage)
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");

    // Local purchased state — flips instantly when purchase record detected, no page refresh needed
    const [purchased, setPurchased] = useState(isPurchased);

    const MAX_POLL_SECONDS = 90; // 90 seconds total wait

    const materialConfig = getMaterialTypeConfig(material.materialType);
    const avgRating = getAverageRating(material.reviews);

    const hasGradient = (cfg: any): cfg is { gradient: { from: string; to: string } } =>
      !!cfg && typeof cfg === "object" && "gradient" in cfg && cfg.gradient && typeof cfg.gradient.from === "string" && typeof cfg.gradient.to === "string";

    const grad = hasGradient(materialConfig) ? materialConfig.gradient : { from: "#e6f9ee", to: "#cfeede" };
    const typeLabel = materialConfig?.label ?? material.materialType;
    const teacherHandle = material.teacher?.name ?? material.teacher?.email?.split("@")[0] ?? "Unknown";
    const isVerified = !!material.teacher?.teacherProfile?.isActive;
    const isTeacher = user?.id === material.teacher?.id;

    // helper for download (declared before it's used in effect)
    async function handleDownload() {
        setDownloading(true);
        const loadingToast = toast.loading("Preparing download...");

        try {
            // Check access first (auth + purchase guard), then redirect to file
            const res = await fetch(`/api/pdf/download?pdfId=${material.id}`, {
                redirect: "manual", // don't auto-follow, we'll grab the URL
            });

            if (res.type === "opaqueredirect" || res.status === 0) {
                // Redirect to the Cloudinary URL by hitting the route in a new tab
                window.open(`/api/pdf/download?pdfId=${material.id}`, "_blank");
                toast.success("Download started!", { id: loadingToast });
                setShowSuccessModal(true);
            } else if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to download");
            } else {
                // Fallback: should not normally reach here
                window.open(`/api/pdf/download?pdfId=${material.id}`, "_blank");
                toast.success("Download started!", { id: loadingToast });
                setShowSuccessModal(true);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to download", { id: loadingToast });
        } finally {
            setDownloading(false);
        }
    }

    // Poll the Purchase table directly — the source of truth
    // Once the M-Pesa callback creates the Purchase record, the next poll catches it
    useEffect(() => {
        if (!paymentPending) return;

        let elapsed = 0;

        const interval = setInterval(async () => {
            elapsed += 2;

            if (elapsed >= MAX_POLL_SECONDS) {
                clearInterval(interval);
                setPaymentPending(false);
                toast.error("Payment verification timed out. If you paid, please refresh the page.");
                return;
            }

            try {
                const res = await fetch(`/api/purchase/check?pdfId=${material.id}`);
                const data = await res.json();

                if (data.purchased) {
                    clearInterval(interval);
                    setPaymentPending(false);
                    setPurchased(true);
                    toast.success("Payment successful! You can now download the material.");

                    // automatically start download after confirmation
                    try {
                        await handleDownload();
                    } catch (err) {
                        console.error("Auto-download failed:", err);
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000); // poll every 2 seconds

        return () => clearInterval(interval);
    }, [paymentPending, material.id, handleDownload]);

    // helper for saving a phone number in the current user's profile
    // used when the buyer types a number on either the detail page or the
    // marketplace card. ignores errors (validation already happened earlier).
    const updatePhoneProfile = async (phoneNumber: string) => {
        try {
            await fetch("/api/user/phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phoneNumber }),
            });
            // refresh user data if necessary
            router.refresh();
        } catch {
            // swallow; not fatal
        }
    };

    // keep local phone input in sync with whatever is on the user object
    useEffect(() => {
        setPhone(user?.phone || "");
    }, [user]);

    // respond to autoBuy (and optional phone) query parameters passed by the
    // marketplace grid or by a direct link. if an anonymous visitor arrives we
    // immediately send them to login with the same URL as callback. once
    // they're authenticated the normal purchase logic resumes.
    useEffect(() => {
        const flag = searchParams.get("autoBuy");
        if (!flag) return;

        // build current path for redirection (includes any query params)
        const currentPath = `/marketplace/${material.id}` + (searchParams.toString() ? `?${searchParams.toString()}` : "");

        if (!user) {
            router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
            return;
        }

        if (user && !purchased) {
            const incomingPhone = searchParams.get("phone");
            if (incomingPhone) {
                // save phone if it differs
                if (incomingPhone !== user.phone) {
                    updatePhoneProfile(incomingPhone);
                    setPhone(incomingPhone);
                }

                startPurchase(incomingPhone);
            } else {
                onBuyClick();
            }
        }

        // remove the flag and phone from the URL so refreshing doesn't
        // repeat the action
        const params = new URLSearchParams(searchParams.toString());
        params.delete("autoBuy");
        params.delete("phone");
        const base = `/marketplace/${material.id}`;
        const suffix = params.toString() ? `?${params.toString()}` : "";
        router.replace(base + suffix, { scroll: false });
    }, [searchParams, user, purchased]);

    // kick off a purchase given an arbitrary phone number. this is now
    // decoupled from the user's profile so we can accept whatever the
    // visitor types into a modal.
    const startPurchase = async (phoneNumber: string) => {
        setPurchasing(true);
        const loadingToast = toast.loading("Initiating M-Pesa payment...");

        try {
            const res = await fetch("/api/mpesa/stk/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfId: material.id,
                    phone: phoneNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            toast.success("Check your phone for the M-Pesa prompt!", { id: loadingToast });

            // Start polling — just check if Purchase record appears in DB
            setPaymentPending(true);
        } catch (err: any) {
            toast.error(err.message || "Failed to initiate payment", { id: loadingToast });
        } finally {
            setPurchasing(false);
        }
    };

    function onBuyClick() {
        if (!user) {
            toast.error("Please login to purchase");
            router.push(`/login?callbackUrl=${encodeURIComponent(`/marketplace/${material.id}?autoBuy=1`)}`);
            return;
        }
        setShowPhoneModal(true);
    }

    const handlePhoneConfirm = async () => {
        if (!phone) {
            toast.error("Please enter your M-Pesa phone number");
            return;
        }
        // ensure the profile holds the number
        await updatePhoneProfile(phone);
        setShowPhoneModal(false);
        startPurchase(phone);
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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

          {/* Right column (purchase / share / guarantees) */}
          <div className="lg:col-span-1">
                            {/* Payment Pending Overlay */}
                            {paymentPending && (
                                <div className="mb-4 p-5 bg-primary/5 border-2 border-primary/20 rounded-lg text-center">
                                    <div className="flex justify-center mb-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        Waiting for Payment
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Check your phone for the M-Pesa prompt and enter your PIN
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This may take up to 90 seconds...
                                    </p>
                                </div>
                            )}

                        {/* Payment Failed / Timeout (M-Pesa cancelled or declined) */}
                        {!paymentPending && !purchased && purchasing === false && (
                            <></>
                        )}

                            {purchased ? (
                                <>
                                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                            ✓ You own this material
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mb-3"
                                    >
                                        {downloading ? "Downloading..." : "Download Now"}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onBuyClick}
                                    disabled={purchasing || paymentPending}
                                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mb-3"
                                >
                                    {purchasing ? "Processing..." : paymentPending ? "Waiting for Payment..." : "Buy Now"}
                                </button>
                            )}

                            <button
                                onClick={handleShare}
                                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                Share
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

      {/* Phone prompt modal for purchases (same style as PurchaseButton) */}
      {showPhoneModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPhoneModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 pt-5 pb-4"
              style={{ background: "linear-gradient(135deg, #003318 0%, #006832 50%, #008c43 100%)" }}>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-3.5 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">M-Pesa Checkout</p>
              <h3 className="text-white text-lg font-extrabold pr-8 leading-tight line-clamp-2">{material.title}</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                <span className="text-white/70 text-xs">Total</span>
                <span className="text-white text-lg font-extrabold">KES {material.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="254712345678"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm"
                  autoFocus
                  readOnly={!!user?.phone}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Format: <span className="font-mono">254XXXXXXXXX</span> — no spaces or +
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowPhoneModal(false)}
                  disabled={purchasing}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhoneConfirm}
                  disabled={purchasing || !phone}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#008c43]/20 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
                >
                  {purchasing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pay with M‑Pesa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
  );
}

function StatChip({ value, label, color, icon }: {
  value: string; label: string; color: "emerald" | "sky" | "violet" | "amber"; icon: ReactNode;
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
    // give each related block a bit of horizontal breathing room; 13px
    // from the container edge as requested
    <div className="mt-10 px-[13px]">
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
