import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function VerificationRequired() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Verification Required
                </h2>
                <p className="text-muted-foreground mb-6">
                    Please complete the KES 100 verification payment to activate your teacher account.
                </p>
                <Link
                    href="/teacher-register"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                    Complete Verification
                </Link>
            </div>
        </div>
    );
}

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "TEACHER") {
        redirect("/");
    }

    const profile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
    });

    if (!profile || !profile.isActive) {
        return <VerificationRequired />;
    }

    return <>{children}</>;
}
