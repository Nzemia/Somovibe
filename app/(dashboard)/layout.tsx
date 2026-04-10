import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/Navbar"
import { QuickNav } from "@/components/QuickNav"
import { ScrollToTopOnNav } from "@/components/ScrollToTopOnNav"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()

    return (
        <>
            <ScrollToTopOnNav />
            <Navbar
                user={
                    user
                        ? {
                              email: user.email,
                              role: user.role
                          }
                        : null
                }
            />
            <QuickNav
                variant="dashboard"
                userRole={user?.role}
            />
            <div className="min-h-screen bg-[#f5faf7]">
                {children}
            </div>
        </>
    )
}
