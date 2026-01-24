import Link from "next/link";

export default function StudentPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">Student Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Purchased Materials</h3>
                        <p className="text-3xl font-bold text-foreground">0</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Spent</h3>
                        <p className="text-3xl font-bold text-primary">KES 0</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-muted-foreground text-sm font-medium mb-2">Subjects</h3>
                        <p className="text-3xl font-bold text-foreground">0</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/marketplace"
                                className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                            >
                                <h3 className="font-semibold text-foreground mb-1">Browse Marketplace</h3>
                                <p className="text-sm text-muted-foreground">Find quality learning materials</p>
                            </Link>
                            <Link
                                href="/student/profile"
                                className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                            >
                                <h3 className="font-semibold text-foreground mb-1">Manage Profile</h3>
                                <p className="text-sm text-muted-foreground">Update your information</p>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground mb-2">
                                    Want to share your knowledge?
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Become a teacher and earn 75% from every sale. One-time verification fee of KES 100.
                                </p>
                                <Link
                                    href="/teacher-register"
                                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                                >
                                    Become a Teacher
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">My Purchases</h2>
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No purchases yet</h3>
                        <p className="text-muted-foreground mb-4">Start exploring the marketplace to find quality learning materials</p>
                        <Link
                            href="/marketplace"
                            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
