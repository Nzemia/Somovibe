import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { Badge } from "@/components/ui/badge";

export default async function StudentDownloadsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "STUDENT") {
        redirect("/");
    }

    // Fetch download history
    const downloads = await prisma.download.findMany({
        where: { userId: user.id },
        include: {
            pdf: {
                include: {
                    teacher: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Group downloads by material
    const downloadsByMaterial = downloads.reduce((acc, download) => {
        const pdfId = download.pdf.id;
        if (!acc[pdfId]) {
            acc[pdfId] = {
                material: download.pdf,
                downloads: [],
            };
        }
        acc[pdfId].downloads.push(download);
        return acc;
    }, {} as Record<string, { material: any; downloads: any[] }>);

    const materialsWithDownloads = Object.values(downloadsByMaterial);

    // Get total stats
    const totalDownloads = downloads.length;
    const uniqueMaterials = materialsWithDownloads.length;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Download History</h1>
                            <p className="text-muted-foreground">
                                Track all your material downloads
                            </p>
                        </div>
                        <Link
                            href="/student"
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
                                <p className="text-3xl font-bold text-foreground">{totalDownloads}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Unique Materials</p>
                                <p className="text-3xl font-bold text-foreground">{uniqueMaterials}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Download History */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground">Your Downloads</h2>
                    </div>

                    {materialsWithDownloads.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                No downloads yet
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Purchase materials from the marketplace to start downloading
                            </p>
                            <Link
                                href="/marketplace"
                                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                            >
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {materialsWithDownloads.map(({ material, downloads: materialDownloads }) => {
                                const config = getMaterialTypeConfig(material.materialType);
                                const firstDownload = materialDownloads[materialDownloads.length - 1];
                                const lastDownload = materialDownloads[0];

                                return (
                                    <div key={material.id} className="p-6 hover:bg-accent/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            {/* Material Info */}
                                            <div className="flex items-start space-x-3 flex-1">
                                                <span className="text-3xl">{config.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                                        {material.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <Badge variant="secondary">{material.subject}</Badge>
                                                        <Badge variant="secondary">{material.grade}</Badge>
                                                        <Badge className={config.color}>{config.label}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        By {material.teacher.email.split('@')[0]}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Download Stats */}
                                            <div className="flex flex-col sm:items-end space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                                                        {materialDownloads.length} {materialDownloads.length === 1 ? 'download' : 'downloads'}
                                                    </span>
                                                </div>
                                                <Link
                                                    href={`/api/pdf/download?pdfId=${material.id}`}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium flex items-center space-x-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>Download Again</span>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Download Timeline */}
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <p className="text-sm font-medium text-foreground mb-2">Download History</p>
                                            <div className="space-y-2">
                                                {materialDownloads.slice(0, 5).map((download, index) => (
                                                    <div
                                                        key={download.id}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                            <span className="text-muted-foreground">
                                                                {index === 0 ? 'Latest download' : `Download #${materialDownloads.length - index}`}
                                                            </span>
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            {new Date(download.createdAt).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                ))}
                                                {materialDownloads.length > 5 && (
                                                    <p className="text-xs text-muted-foreground italic pl-4">
                                                        +{materialDownloads.length - 5} more downloads
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
