/**
 * PurchaseButton - Client Component for interactive purchase actions
 * 
 * This is the ONLY interactive part of the PDF card that needs hydration.
 * Separated from PdfCardContent to keep the grid lightweight.
 * 
 * The modal, form handling, and API calls stay isolated in this component.
 */

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PurchaseButtonProps = {
  pdfId: string;
  title: string;
  price: number;
  isPurchased: boolean;
  user: { id: string; email: string; phone: string | null } | null;
  variant?: "primary" | "secondary";
};

export default function PurchaseButton({
  pdfId,
  title,
  price,
  isPurchased,
  user,
  variant = "primary",
}: PurchaseButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Ensure we're mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleBuyClick = () => {
    if (!user) {
      toast.error("Please login to purchase materials");
      // preserve autoBuy flag so flow continues after login
      router.push(`/login?callbackUrl=${encodeURIComponent(`/marketplace/${pdfId}?autoBuy=1`)}`);
      return;
    }

    if (variant === "secondary") {
      // open a lightweight modal on the card itself where the user can type a
      // phone number. after they confirm we will redirect them to the detail
      // page with the number encoded so the purchase can continue there.
      setShowModal(true);
      return;
    }

    setShowModal(true);
  };

  // existing purchase logic for the primary (detail page) button
  const handlePurchase = async () => {
    if (!phone) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/mpesa/stk/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          pdfId,
          userId: user!.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      if (data.devMode) {
        toast.success("Purchase completed successfully!");
        setShowModal(false);
        router.refresh();
        return;
      }

      toast.success("STK push sent! Please enter your M-Pesa PIN");
      setShowModal(false);

      setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  // new flow triggered when the card's secondary buy button has collected a
  // phone number and the user confirmed; save to profile and navigate to
  // detail page with query params so that the detail component will continue
  // the payment process and show progress.
  const handleSecondaryConfirm = async () => {
    if (!phone) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    setLoading(true);
    try {
      // persist phone to profile (ignore result)
      await fetch("/api/user/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
    } catch {
      // continue regardless
    }

    setShowModal(false);
    router.push(`/marketplace/${pdfId}?autoBuy=1&phone=${encodeURIComponent(phone)}`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    const loadingToast = toast.loading("Preparing download...");

    try {
      const res = await fetch(`/api/pdf/download?pdfId=${pdfId}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to download");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started!", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || "Failed to download PDF", { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {isPurchased ? (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-[#008c43]/20 active:scale-95"
          style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" }}
        >
          {downloading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Download</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleBuyClick}
          className={
            variant === "secondary"
              ? "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#008c43] text-[#008c43] text-[11px] font-bold rounded-xl hover:bg-[#f0faf5] transition-colors active:scale-95"
              : "inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#008c43]/20 active:scale-95"
          }
          style={variant === "primary" ? { background: "linear-gradient(135deg, #006832 0%, #008c43 100%)" } : undefined}
        >
          {variant === "secondary" ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buy
            </>
          ) : "Pay with M‑Pesa"}
        </button>
      )}

      {/* Purchase Modal - Rendered via Portal to avoid clipping */}
      {showModal && mounted && createPortal(
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header — green gradient */}
            <div className="relative px-6 pt-5 pb-4"
              style={{ background: "linear-gradient(135deg, #003318 0%, #006832 50%, #008c43 100%)" }}>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3.5 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">M-Pesa Checkout</p>
              <h3 className="text-white text-lg font-extrabold pr-8 leading-tight line-clamp-2">{title}</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                <span className="text-white/70 text-xs">Total</span>
                <span className="text-white text-lg font-extrabold">KES {price.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal body */}
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
                  readOnly={variant === "primary" && !!user?.phone}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Format: <span className="font-mono">254XXXXXXXXX</span> — no spaces or +
              </p>

              {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
                <div className="mt-3 p-3 bg-[#f0faf5] border border-[#d1e8dc] rounded-xl text-xs text-[#006832] font-medium">
                  DEV MODE: Purchase will be auto-approved instantly
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={variant === "secondary" ? handleSecondaryConfirm : handlePurchase}
                  disabled={loading || !phone}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#008c43]/20 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
                >
                  {loading ? (
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
                      {variant === "secondary" ? "Continue" : "Pay with M‑Pesa"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
