"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { getAverageRating } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type MaterialDetailClientProps = {
    material: any;
    isPurchased: boolean;
    user: any;
};

export default function MaterialDetailClient({
    material,
    isPurchased,
    user,
}: MaterialDetailClientProps) {
    const router = useRouter();
    const [downloading, setDownloading] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
    const [referenceCode, setReferenceCode] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string>("PENDING");
    const [pollCount, setPollCount] = useState(0);

    const materialConfig = getMaterialTypeConfig(material.materialType);
    const avgRating = getAverageRating(material.reviews);

    const MAX_POLL_ATTEMPTS = 60; // 60 seconds

    // Poll for payment status
    useEffect(() => {
        if (!paymentPending || !referenceCode) return;

        const interval = setInterval(async () => {
            setPollCount((prev) => {
                if (prev >= MAX_POLL_ATTEMPTS) {
                    clearInterval(interval);
                    setPaymentStatus("TIMEOUT");
                    setPaymentPending(false);
                    toast.error("Payment verification timed out. If you paid, the material will appear shortly — please refresh the page.");
                    return prev;
                }
                return prev + 1;
            });

            try {
                const res = await fetch(`/api/payment/status?referenceCode=${referenceCode}`);
                const data = await res.json();

                if (data.status === "COMPLETED") {
                    clearInterval(interval);
                    setPaymentStatus("COMPLETED");
                    setPaymentPending(false);
                    toast.success("Payment successful! You can now download the material.");
                    // Refresh the page to update isPurchased state from the server
                    router.refresh();
                } else if (data.status === "FAILED") {
                    clearInterval(interval);
                    setPaymentStatus("FAILED");
                    setPaymentPending(false);
                    toast.error("Payment failed. Please try again.");
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentPending, referenceCode, router]);

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

    const handlePurchase = async () => {
        if (!user) {
            toast.error("Please login to purchase");
            router.push("/login");
            return;
        }

        if (!user.phone) {
            toast.error("Please add your phone number in your profile");
            router.push(`/${user.role.toLowerCase()}/profile`);
            return;
        }

        setPurchasing(true);
        const loadingToast = toast.loading("Initiating M-Pesa payment...");

        try {
            const res = await fetch("/api/mpesa/stk/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfId: material.id,
                    phone: user.phone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to initiate payment");
            }

            toast.success("Check your phone for the M-Pesa prompt!", { id: loadingToast });

            // Start polling for payment status on this same page
            setReferenceCode(data.referenceCode);
            setPaymentPending(true);
            setPaymentStatus("PENDING");
            setPollCount(0);
        } catch (err: any) {
            toast.error(err.message || "Failed to initiate payment", { id: loadingToast });
        } finally {
            setPurchasing(false);
        }
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: material.title,
                    text: `Check out this learning material: ${material.title}`,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    href="/marketplace"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            {material.thumbnailUrl ? (
                                <img
                                    src={material.thumbnailUrl}
                                    alt={material.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className={`w-full h-full flex items-center justify-center ${materialConfig.lightColor}`}>
                                    <span className="text-9xl">{materialConfig.icon}</span>
                                </div>
                            )}
                        </div>

                        {/* Title and Badges */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge className={materialConfig.textColor}>
                                    {materialConfig.icon} {materialConfig.label}
                                </Badge>
                                <Badge variant="outline">{material.subject}</Badge>
                                <Badge variant="outline">{material.grade}</Badge>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {material.title}
                            </h1>
                            <p className="text-muted-foreground">{material.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="text-foreground font-medium">{material._count.downloads}</span>
                                <span className="text-muted-foreground">Downloads</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="text-foreground font-medium">{material._count.purchases}</span>
                                <span className="text-muted-foreground">Sales</span>
                            </div>
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-foreground font-medium">{avgRating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({material._count.reviews} reviews)</span>
                                </div>
                            )}
                        </div>

                        {/* Teacher Info */}
                        <div className="bg-card border border-border rounded-lg p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Created by</h3>
                            <Link
                                href={`/teacher/${material.teacher.id}`}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary">
                                        {(material.teacher.name || material.teacher.email)[0].toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">
                                            {material.teacher.name || material.teacher.email.split("@")[0]}
                                        </p>
                                        {material.teacher.teacherProfile?.isActive && (
                                            <Badge className="bg-green-500 text-white text-xs">
                                                ✓ Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">View all materials →</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Purchase Card */}
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                            <div className="text-3xl font-bold text-foreground mb-4">
                                KES {material.price}
                            </div>

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
                                    <div className="bg-background border border-border rounded-md p-2 mb-2">
                                        <p className="text-xs text-muted-foreground">Reference</p>
                                        <p className="font-mono text-xs font-bold text-foreground">{referenceCode}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This may take up to 60 seconds...
                                    </p>
                                </div>
                            )}

                            {/* Payment Failed */}
                            {paymentStatus === "FAILED" && !paymentPending && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive font-medium">
                                        ✕ Payment failed. Please try again.
                                    </p>
                                </div>
                            )}

                            {/* Payment Timeout */}
                            {paymentStatus === "TIMEOUT" && !paymentPending && (
                                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                                        ⏱ Payment verification timed out. If you completed the payment, please refresh this page.
                                    </p>
                                    <button
                                        onClick={() => router.refresh()}
                                        className="mt-2 text-sm text-primary hover:underline font-medium"
                                    >
                                        Refresh Page
                                    </button>
                                </div>
                            )}

                            {isPurchased ? (
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
                                    onClick={handlePurchase}
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

                            <div className="mt-4 pt-4 border-t border-border">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Instant download after purchase
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lifetime access
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Quality verified content
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
