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
        thumbnailUrl: string | null;
        teacher: {
            email: string;
        };
        _count: {
            downloads: number;
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
        e.preventDefault();
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
        <Link href={`/marketplace/${pdf.id}`} className="block group">
            <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                        src={pdf.thumbnailUrl || materialConfig.lightColor}
                        alt={pdf.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/400x225/6366f1/ffffff?text=${encodeURIComponent(materialConfig.icon)}`;
                        }}
                    />
                    {isPurchased && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                            ✓ Owned
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Subject and Grade Badges */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                            {pdf.subject}
                        </span>
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded">
                            {pdf.grade}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {pdf.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                        {pdf.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span>{pdf._count.downloads}</span>
                        </div>
                        <span className={`${materialConfig.textColor} font-medium`}>
                            {materialConfig.icon} {materialConfig.label}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="text-lg font-bold text-foreground">
                            KES {pdf.price}
                        </div>
                        {isPurchased ? (
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {downloading ? "..." : "Download"}
                            </button>
                        ) : (
                            <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors">
                                Buy
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
