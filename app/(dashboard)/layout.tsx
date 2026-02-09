import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    return (
        <>
            <Navbar user={user ? { email: user.email, role: user.role } : null} />
            {children}
        </>
    );
}
