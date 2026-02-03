import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMaterialTypeConfig } from "@/lib/materialTypes";
import { Badge } from "@/components/ui/badge";

export default async function TeacherAnalyticsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== "TEACHER") {
        redirect("/");
    }

    // Fetch all materials with analytics
    const materials = await prisma.pdf.findMany({
        where: { teacherId: user.id },
        include: {
            purchases: {
                select: {
                    id: true,
                    createdAt: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            downloads: {
                select: {
                    id: true,
                    createdAt: true,
                },
            },
            materialViews: {
                select: {
                    id: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate totals
    const totalViews = materials.reduce((sum, m) => sum + m.materialViews.length, 0);
    const totalSales = materials.reduce((sum, m) => sum + m.purchases.length, 0);
    const totalRevenue = materials.reduce((sum, m) => sum + (m.purchases.length * m.price), 0);
    const totalDownloads = materials.reduce((sum, m) => sum + m.downloads.length, 0);
    const myEarnings = Math.floor(totalRevenue * 0.75);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Material Analytics</h1>
                            <p className="text-muted-foreground">
                                Track performance of your learning materials
                            </p>
                        </div>
                        <Link
                            href="/teacher"
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Materials</p>
                        <p className="text-2xl font-bold text-foreground">{materials.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                        <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-green-600">{totalSales}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
                        <p className="text-2xl font-bold text-purple-600">{totalDownloads}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">My Earnings</p>
                        <p className="text-2xl font-bold text-primary">KES {myEarnings}</p>
                    </div>
                </div>

                {/* Materials List */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-foreground">Material Performance</h2>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No materials uploaded yet</p>
                            <Link
                                href="/teacher/upload"
                                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                            >
                                Upload Your First Material
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {materials.map((material) => {
                                const config = getMaterialTypeConfig(material.materialType);
                                const revenue = material.purchases.length * material.price;
                                const myShare = Math.floor(revenue * 0.75);
                                const conversionRate = material.materialViews.length > 0
                                    ? ((material.purchases.length / material.materialViews.length) * 100).toFixed(1)
                                    : "0.0";

                                return (
                                    <div key={material.id} className="p-6 hover:bg-accent/50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Material Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start space-x-3 mb-3">
                                                    <span className="text-3xl">{config.icon}</span>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-foreground mb-1">
                                                            {material.title}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <Badge variant="secondary">{material.subject}</Badge>
                                                            <Badge variant="secondary">{material.grade}</Badge>
                                                            <Badge variant={material.status === "APPROVED" ? "default" : "secondary"}>
                                                                {material.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Uploaded {new Date(material.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 lg:min-w-[600px]">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">Views</p>
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {material.materialViews.length}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">Sales</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {material.purchases.length}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">Downloads</p>
                                                    <p className="text-xl font-bold text-purple-600">
                                                        {material.downloads.length}
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">Conversion</p>
                                                    <p className="text-xl font-bold text-orange-600">
                                                        {conversionRate}%
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">My Earnings</p>
                                                    <p className="text-xl font-bold text-primary">
                                                        KES {myShare}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Purchases */}
                                        {material.purchases.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-border">
                                                <p className="text-sm font-medium text-foreground mb-2">
                                                    Recent Purchases ({material.purchases.length})
                                                </p>
                                                <div className="space-y-1">
                                                    {material.purchases.slice(0, 3).map((purchase) => (
                                                        <div
                                                            key={purchase.id}
                                                            className="flex items-center justify-between text-xs text-muted-foreground"
                                                        >
                                                            <span>{purchase.user.email.split('@')[0]}</span>
                                                            <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    ))}
                                                    {material.purchases.length > 3 && (
                                                        <p className="text-xs text-muted-foreground italic">
                                                            +{material.purchases.length - 3} more
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
