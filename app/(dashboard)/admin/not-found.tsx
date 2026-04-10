import Link from "next/link";

export default function AdminNotFound() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-8">
                        <svg
                            className="w-24 h-24 mx-auto text-muted-foreground mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                            Page Not Found
                        </h2>
                        <p className="text-muted-foreground max-w-md">
                            The admin page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        
                        <Link
                            href="/"
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center space-x-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            <span>Go Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
