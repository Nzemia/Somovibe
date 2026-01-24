import { AdminNav } from "@/components/AdminNav";

export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    {/* Header skeleton */}
                    <div className="mb-8">
                        <div className="h-8 bg-muted rounded w-64 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-96"></div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-card border border-border rounded-lg p-6">
                                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-20"></div>
                            </div>
                        ))}
                    </div>

                    {/* Content skeleton */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-12 bg-muted rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading spinner overlay */}
                <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="text-muted-foreground font-medium">Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
