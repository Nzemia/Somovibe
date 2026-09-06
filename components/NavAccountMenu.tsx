"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const DASHBOARD_HREF: Record<string, string> = {
  TEACHER: "/teacher",
  STUDENT: "/student",
  ADMIN: "/admin",
}

const PROFILE_HREF: Record<string, string> = {
  TEACHER: "/teacher/profile",
  STUDENT: "/student/profile",
  ADMIN: "/admin",
}

export function NavAccountMenu({
  user,
}: {
  user: { email: string; role: string }
}) {
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initial = user.email[0]?.toUpperCase() ?? "U"
  const dashboardHref = DASHBOARD_HREF[user.role] ?? "/marketplace"
  const profileHref = PROFILE_HREF[user.role] ?? dashboardHref
  const dashboardLabel =
    user.role === "STUDENT" ? "Learner Dashboard" : "Go to Dashboard"

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  }, [open])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch {
      // continue
    }
    window.location.href = "/"
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="nav-account-trigger flex items-center gap-2 rounded-full px-1.5 py-1"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span
          className="nav-account-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-[#008c43] ring-2"
          style={{ background: "rgba(255,255,255,0.95)" }}
        >
          {initial}
        </span>
        <span className="nav-account-mail hidden max-w-35 truncate text-sm md:block">
          {user.email}
        </span>
        <svg
          className={cn(
            "nav-account-chevron h-3.5 w-3.5 transition-transform",
            open ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 bg-[#f5faf7] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#008c43]">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <Link
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-[#f5faf7] hover:text-[#008c43]"
          >
            {dashboardLabel}
          </Link>
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-[#f5faf7] hover:text-[#008c43]"
          >
            My Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  )
}
