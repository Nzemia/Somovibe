"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import Link from "next/link";

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
    const [downloading, setDownloading] = useState(false);

    const materialConfig = getMaterialTypeConfig(pdf.materialType);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
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
        <Link href={`/marketplace/${pdf.id}`} className="block">
            <div className={`bg-card border-2 ${materialConfig.borderColor} rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col h-full`}>
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
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
                                View Details →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
