"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMaterialTypeConfig } from "@/lib/materialTypes";

type Props = {
    material: {
        id: string;
        title: string;
        price: number;
        materialType: string;
    };
    hasPurchased: boolean;
    user: { id: string; email: string; phone: string | null; role: string } | null;
};

export default function MaterialDetailClient({ material, hasPurchased, user }: Props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const materialConfig = getMaterialTypeConfig(material.materialType);

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
                    pdfId: material.id,
                    userId: user?.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            // Check if dev mode
            if (data.devMode) {
                toast.success("Purchase completed successfully!");
                setShowModal(false);
                router.refresh();
                return;
            }

            toast.success("STK push sent! Please enter your M-Pesa PIN");
            setShowModal(false);

            // Refresh after a delay to show the purchase
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
            const res = await fetch(`/api/pdf/download?pdfId=${material.id}`);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to download");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${material.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Download started!", { id: loadingToast });
        } catch (err: any) {
            toast.error(err.message || "Failed to download", { id: loadingToast });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <div className={`bg-card border-2 ${materialConfig.borderColor} rounded-lg p-6 space-y-6`}>
                {/* Price */}
                <div>
                    <p className="text-sm text-muted-foreground mb-2">Price</p>
                    <p className="text-4xl font-bold text-primary">KES {material.price}</p>
                </div>

                {/* Action Button */}
                {user?.role === "ADMIN" ? (
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {downloading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Preview Material (Admin)</span>
                            </>
                        )}
                    </button>
                ) : hasPurchased ? (
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {downloading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Downloading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download Now</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleBuyClick}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                        Buy Now
                    </button>
                )}

                {/* Features */}
                <div className="pt-6 border-t border-border space-y-3">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Instant download after purchase</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Verified by admin</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Secure M-Pesa payment</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-muted-foreground">Download anytime</p>
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-foreground mb-4">Complete Purchase</h3>

                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">
                                Material: <span className="font-medium text-foreground">{material.title}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                                Price: <span className="font-bold text-primary">KES {material.price}</span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                M-Pesa Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="254712345678"
                                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Format: 254XXXXXXXXX (no spaces or +)
                            </p>
                        </div>

                        {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
                            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded text-xs text-primary">
                                🔧 DEV MODE: Purchase will be auto-approved for testing
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="flex-1 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Pay with M-Pesa"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={loading}
                                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
