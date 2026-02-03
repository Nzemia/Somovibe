export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative">
            {/* Background with gradient and blur effect */}
            <div className="fixed inset-0 bg-background">
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-primary/5" />
            </div>

            {/* Content overlay with backdrop blur */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl shadow-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
