import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-6">
                    <svg
                        className="w-24 h-24 mx-auto text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Material Not Found</h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    The material you're looking for doesn't exist or has been removed.
                </p>
                <Link
                    href="/marketplace"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    Back to Marketplace
                </Link>
            </div>
        </div>
    );
}
