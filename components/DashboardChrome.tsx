"use client"

import { usePathname } from "next/navigation"
import { Nav } from "@/components/Nav"
import { QuickNav } from "@/components/QuickNav"

type NavUser = { email: string; role: string } | null

export function DashboardChrome({
    user,
}: {
    user: NavUser
}) {
    const pathname = usePathname()
    const isProfile = pathname.includes("/profile")

    return (
        <>
            <Nav user={user} />
            {!isProfile && (
                <QuickNav variant="dashboard" userRole={user?.role} />
            )}
        </>
    )
}
