"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PdfCardProps = {
    pdf: {
        id: string;
        title: string;
        description: string;
        subject: string;
        grade: string;
        price: number;
        teacher: {
            email: string;
        };
    };
    isPurchased: boolean;
    user: { id: string; email: string; phone: string | null } | null;
};

export default function PdfCard({ pdf, isPurchased, user }: PdfCardProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBuyClick = () => {
        if (!user) {
            router.push("/login");
            return;
        }
        setShowModal(true);
    };

    const handlePurchase = async () => {
        if (!phone) {
            setError("Please enter your M-Pesa phone number");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/mpesa/stk/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone,
                    pdfId: pdf.id,
                    userId: user!.id,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            // Check if dev mode
            if (data.devMode) {
                alert("DEV MODE: Purchase completed instantly!");
                setShowModal(false);
                router.refresh();
                return;
            }

            alert("STK push sent to your phone! Please enter your M-Pesa PIN.");
            setShowModal(false);

            // Refresh after a delay to show the purchase
            setTimeout(() => {
                router.refresh();
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await fetch(`/api/pdf/download?pdfId=${pdf.id}`);

            if (!res.ok) {
                throw new Error("Failed to download");
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
        } catch (err) {
            alert("Failed to download PDF");
        }
    };

    return (
        <>
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {pdf.subject}
                        </span>
                        {isPurchased && (
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                                Purchased
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{pdf.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pdf.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                        <span>{pdf.grade}</span>
                        <span>•</span>
                        <span className="truncate">By {pdf.teacher.email.split("@")[0]}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-2xl font-bold text-primary">KES {pdf.price}</p>
                    {isPurchased ? (
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleBuyClick}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                        >
                            Buy Now
                        </button>
                    )}
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

                        {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

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
