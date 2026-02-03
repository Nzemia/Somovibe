"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMaterialTypeConfig } from "@/lib/materialTypes";

type PdfCardProps = {
    pdf: {
        id: string;
        title: string;
        description: string;
        subject: string;
        grade: string;
        price: number;
        materialType: string;
        teacher: {
            email: string;
        };
    };
    isPurchased: boolean;
    user: { id?: string; email: string; phone?: string | null } | null;
};

export default function PdfCard({ pdf, isPurchased, user }: PdfCardProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const materialConfig = getMaterialTypeConfig(pdf.materialType);

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
                    pdfId: pdf.id,
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
            const res = await fetch(`/api/pdf/download?pdfId=${pdf.id}`);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to download");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${pdf.title}.pdf`;
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
            <div className={`bg-card border-2 ${materialConfig.borderColor} rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col`}>
                {/* Material Type Header */}
                <div className={`${materialConfig.lightColor} px-4 py-3 border-b ${materialConfig.borderColor}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl">{materialConfig.icon}</span>
                            <span className={`text-sm font-semibold ${materialConfig.textColor}`}>
                                {materialConfig.label}
                            </span>
                        </div>
                        {isPurchased && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                                ✓ Owned
                            </span>
                        )}
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{pdf.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{pdf.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                {pdf.subject}
                            </span>
                            <span className="px-3 py-1 bg-accent text-foreground text-xs font-medium rounded-full">
                                {pdf.grade}
                            </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                            By {pdf.teacher.email.split("@")[0]}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                        <p className="text-2xl font-bold text-primary">KES {pdf.price}</p>
                        {isPurchased ? (
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center space-x-2 text-sm"
                            >
                                {downloading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Download</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleBuyClick}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                                Buy Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-foreground mb-4">Complete Purchase</h3>

                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Material: <span className="font-medium text-foreground">{pdf.title}</span></p>
                            <p className="text-sm text-muted-foreground mb-2">Price: <span className="font-bold text-primary">KES {pdf.price}</span></p>
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
