"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

const DASHBOARD_HREF: Record<string, string> = {
  TEACHER: "/teacher",
  STUDENT: "/student",
  ADMIN: "/admin",
};

export function Navbar({ user }: { user: { email: string; role: string } | null }) {
  const [signingOut, setSigningOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      setSigningOut(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const dashboardHref = user ? (DASHBOARD_HREF[user.role] ?? "/") : "/";
  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,20,10,0.94) 0%, rgba(0,60,30,0.91) 50%, rgba(0,120,58,0.88) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center self-center">
            <Image
              src="/logos/somovibe-text-white.png"
              alt="Somovibe"
              width={220}
              height={62}
              className="w-auto object-contain"
              style={{ height: "46px", display: "block" }}
              priority
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile button */}
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors group"
                  aria-label="Account menu"
                >
                  {/* Avatar circle */}
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-[#008c43] shrink-0 ring-2 ring-white/30 group-hover:ring-white/60 transition-all"
                    style={{ background: "rgba(255,255,255,0.95)" }}
                  >
                    {initial}
                  </span>
                  {/* Email — desktop only */}
                  <span className="hidden md:block text-sm text-white/80 truncate max-w-35">
                    {user.email}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#f5faf7]">
                      <p className="text-xs font-bold text-[#008c43] uppercase tracking-wider">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Dashboard link */}
                    <Link
                      href={dashboardHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-[#f5faf7] hover:text-[#008c43] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#008c43]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                      </svg>
                      Go to Dashboard
                    </Link>

                    {/* Sign out */}
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                      </svg>
                      {signingOut ? "Signing out…" : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Mobile: Login button only */}
                <Link
                  href="/login"
                  className="md:hidden px-4 py-1.5 text-sm font-semibold text-white border border-white/50 rounded-lg hover:bg-white/10 active:scale-95 transition-all"
                >
                  Login
                </Link>

                {/* Desktop: Login + Sign Up */}
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-white border border-white/40 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold text-[#008c43] bg-white rounded-lg hover:bg-white/90 transition-colors shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
