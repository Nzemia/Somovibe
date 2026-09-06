"use client"

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ShoppingBag, Newspaper, Mail } from "lucide-react"
import { NavWave } from "@/components/NavWave"
import { NavAccountMenu } from "@/components/NavAccountMenu"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet"

type NavUser = { email: string; role: string } | null

const DASHBOARD_HREF: Record<string, string> = {
    TEACHER: "/teacher",
    STUDENT: "/student",
    ADMIN: "/admin",
}

function dashboardHref(user: NavUser) {
    if (!user) return "/"
    return DASHBOARD_HREF[user.role] ?? "/"
}

const linkClass =
    "font-sans text-body font-bold focus-visible:shadow-focus focus-visible:outline-none"

const pillClass =
    "inline-flex h-space-6 items-center justify-center rounded-full px-space-3 font-sans text-caption font-bold focus-visible:shadow-focus focus-visible:outline-none"

export function Nav({
    user,
    wave = false,
    waveUntilScroll = false,
}: {
    user: NavUser
    wave?: boolean
    waveUntilScroll?: boolean
}) {
    const [open, setOpen] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const [menuReady, setMenuReady] = useState(false)
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        setMenuReady(true)
    }, [])

    const keepWave = wave || waveUntilScroll
    const navScroll = waveUntilScroll ? undefined : wave ? 0 : 1
    const logoClass =
        "h-[calc(var(--space-6)*1.2*1.5)] w-auto object-contain"

    useLayoutEffect(() => {
        if (!waveUntilScroll) return
        const nav = navRef.current
        if (!nav) return

        const RANGE = 64
        let frame = 0
        const apply = () => {
            const p = Math.min(1, Math.max(0, window.scrollY / RANGE))
            nav.style.setProperty("--nav-scroll", p.toFixed(4))
            nav.setAttribute("data-theme", p < 0.5 ? "green" : "white")
        }
        const onScroll = () => {
            if (frame) return
            frame = window.requestAnimationFrame(() => {
                frame = 0
                apply()
            })
        }
        apply()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            if (frame) window.cancelAnimationFrame(frame)
        }
    }, [waveUntilScroll])

    const handleSignOut = async () => {
        setSigningOut(true)
        try {
            await fetch("/api/auth/signout", { method: "POST" })
        } catch {
            // proceed regardless
        }
        window.location.href = "/"
    }

    const links = [
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
        { href: "/blog", label: "Blog", icon: Newspaper },
        { href: "/contact", label: "Contact", icon: Mail },
    ]

    const logoHref = user ? "/marketplace" : "/"
    const menuLinkClass = cn(
        linkClass,
        "block w-full py-space-3 text-left text-text-primary"
    )

    return (
        <nav
            ref={navRef}
            aria-label="Primary"
            data-theme={wave || waveUntilScroll ? "green" : "white"}
            className="site-nav relative sticky top-0 z-50 h-header shrink-0 overflow-visible"
            style={
                navScroll === undefined
                    ? undefined
                    : ({ "--nav-scroll": navScroll } as CSSProperties)
            }
        >
            <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-space-6 nav:px-space-8">
                <Link
                    href={logoHref}
                    className="relative justify-self-start focus-visible:shadow-focus focus-visible:outline-none"
                >
                    <span className="relative inline-block">
                        <Image
                            src="/logos/somovibe-text-white.png"
                            alt=""
                            width={396}
                            height={112}
                            className={cn(logoClass, "site-nav-logo-white")}
                            priority
                        />
                        <Image
                            src="/logos/somovibe-text.png"
                            alt="Somovibe"
                            width={396}
                            height={112}
                            className={cn(logoClass, "site-nav-logo-ink absolute inset-0")}
                            priority
                        />
                    </span>
                </Link>

                <div className="flex items-center justify-center">
                    <div className="hidden items-center gap-space-5 nav:flex">
                        {links.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(linkClass, "nav-desk-link text-current")}
                                >
                                    <Icon
                                        className="nav-desk-link-icon"
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-self-end">
                    <div className="hidden items-center gap-space-4 nav:flex">
                    {user ? (
                        <NavAccountMenu user={user} />
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={cn(pillClass, "nav-login-pill border")}
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className={cn(pillClass, "nav-cta-pill")}
                            >
                                Get started
                            </Link>
                        </>
                    )}
                    </div>

                    <div className="flex items-center gap-2 nav:hidden">
                    {user && <NavAccountMenu user={user} />}
                    {!menuReady ? (
                        <button
                            type="button"
                            className="flex size-space-7 items-center justify-center text-current focus-visible:shadow-focus focus-visible:outline-none"
                            aria-label="Open menu"
                            aria-expanded={false}
                        >
                            <span className="nav-burger" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </span>
                        </button>
                    ) : (
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="flex size-space-7 items-center justify-center text-current focus-visible:shadow-focus focus-visible:outline-none"
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                            >
                                <span
                                    className="nav-burger"
                                    data-open={open ? "" : undefined}
                                    aria-hidden="true"
                                >
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="border-border bg-surface p-space-6 text-text-primary shadow-none [&>button]:hidden"
                        >
                            <SheetHeader className="mb-space-4 flex-row items-center justify-between space-y-0 text-left">
                                <SheetTitle className="font-sans text-body font-bold text-text-primary">
                                    Menu
                                </SheetTitle>
                                <SheetClose asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            linkClass,
                                            "font-bold text-text-primary"
                                        )}
                                    >
                                        Close
                                    </button>
                                </SheetClose>
                            </SheetHeader>

                            <div className="flex flex-col">
                                {links.map((item) => (
                                    <SheetClose asChild key={item.label}>
                                        <Link href={item.href} className={menuLinkClass}>
                                            {item.label}
                                        </Link>
                                    </SheetClose>
                                ))}

                                {user ? (
                                    <>
                                        <SheetClose asChild>
                                            <Link
                                                href={dashboardHref(user)}
                                                className={menuLinkClass}
                                            >
                                                {user.role === "STUDENT" ? "Learner Dashboard" : "Dashboard"}
                                            </Link>
                                        </SheetClose>
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            disabled={signingOut}
                                            className={cn(
                                                menuLinkClass,
                                                "disabled:opacity-60"
                                            )}
                                        >
                                            {signingOut ? "Signing out…" : "Sign out"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Link href="/login" className={menuLinkClass}>
                                                Login
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link
                                                href="/register"
                                                className={cn(
                                                    "mt-space-3 inline-flex h-space-7 w-full items-center justify-center rounded-full bg-accent-hover font-sans text-body font-bold text-surface",
                                                    "focus-visible:shadow-focus focus-visible:outline-none"
                                                )}
                                            >
                                                Get started
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                    )}
                    </div>
                </div>
            </div>
            {keepWave && <NavWave className="site-nav-wave text-accent-hover" />}
        </nav>
    )
}
