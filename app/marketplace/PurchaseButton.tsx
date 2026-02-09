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
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs md:text-sm"
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
              ? "px-2 py-1 border border-slate-300 text-[10px] font-medium text-slate-900 rounded-md hover:bg-slate-50 transition-colors"
              : "px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          }
        >
          Buy
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
            className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-semibold text-slate-900 mb-4 pr-8">
              Complete Purchase
            </h3>

            <div className="mb-5 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Material:</span>
                <span className="text-sm font-medium text-slate-900">{title}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Price:</span>
                <span className="text-base font-semibold text-slate-900">KES {price}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="254712345678"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                autoFocus
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Format: 254XXXXXXXXX (no spaces or +)
              </p>
            </div>

            {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                🔧 DEV MODE: Purchase will be auto-approved for testing
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
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
                    Processing...
                  </span>
                ) : (
                  "Pay with M-Pesa"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
