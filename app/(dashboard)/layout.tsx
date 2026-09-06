import { getCurrentUser } from "@/lib/auth"
import { DashboardChrome } from "@/components/DashboardChrome"
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
            <DashboardChrome
                user={
                    user
                        ? {
                              email: user.email,
                              role: user.role
                          }
                        : null
                }
            />
            <div className="min-h-screen bg-[#f5faf7]">
                {children}
            </div>
        </>
    )
}
