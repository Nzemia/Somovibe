import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                <div className="mb-8">
                    <div className="relative inline-block mb-6">
                        <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                className="w-32 h-32 text-primary"
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
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved to a new
                        location.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-4">
                        <svg
                            className="w-8 h-8 mx-auto text-primary mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <h3 className="font-semibold text-foreground text-sm">Home</h3>
                        <p className="text-xs text-muted-foreground">Start fresh</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <svg
                            className="w-8 h-8 mx-auto text-primary mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                        </svg>
                        <h3 className="font-semibold text-foreground text-sm">Marketplace</h3>
                        <p className="text-xs text-muted-foreground">Browse materials</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                        <svg
                            className="w-8 h-8 mx-auto text-primary mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                        <h3 className="font-semibold text-foreground text-sm">Sign Up</h3>
                        <p className="text-xs text-muted-foreground">Join Questy</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center space-x-2"
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
                        <span>Back to Home</span>
                    </Link>
                    <Link
                        href="/marketplace"
                        className="px-8 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors inline-flex items-center justify-center space-x-2"
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span>Explore Marketplace</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
