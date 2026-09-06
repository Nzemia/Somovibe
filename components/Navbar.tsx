"use client"

import Link from "next/link"
import Image from "next/image"
import { NavAccountMenu } from "@/components/NavAccountMenu"

const DASHBOARD_HREF: Record<string, string> = {
    TEACHER: "/teacher",
    STUDENT: "/student",
    ADMIN: "/admin"
}

const pillClass =
    "inline-flex h-space-6 items-center justify-center rounded-full px-space-3 font-sans text-caption font-bold focus-visible:shadow-focus focus-visible:outline-none"

export function Navbar({
    user
}: {
    user: { email: string; role: string } | null
}) {
    const dashboardHref = user
        ? (DASHBOARD_HREF[user.role] ?? "/marketplace")
        : "/"

    return (
        <nav className="sticky top-0 z-50 h-header shrink-0 bg-accent-hover">
            <div className="grid h-full grid-cols-[1fr_auto] items-center px-space-6 nav:px-space-8">
                <Link
                    href={dashboardHref}
                    className="justify-self-start focus-visible:shadow-focus focus-visible:outline-none"
                >
                    <Image
                        src="/logos/somovibe-text-white.png"
                        alt="Somovibe"
                        width={396}
                        height={112}
                        className="h-[calc(var(--space-6)*1.2*1.5)] w-auto object-contain"
                        priority
                    />
                </Link>

                <div className="flex items-center justify-self-end gap-space-3">
                    {user ? (
                        <NavAccountMenu user={user} />
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={`${pillClass} border border-white/40 bg-white/15 text-white`}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className={`${pillClass} bg-white text-accent-hover`}
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
