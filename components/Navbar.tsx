"use client";

import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar({ user }: { user: { email: string; role: string } | null }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    setSigningOut(true);
    setMobileMenuOpen(false);
    try {
      await supabase.auth.signOut();
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include"
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      setSigningOut(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              Questy
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/marketplace"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/marketplace")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                >
                  Marketplace
                </Link>

                {user.role === "ADMIN" && (
                  <>
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/teachers"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/teachers")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                    >
                      Teachers
                    </Link>
                    <Link
                      href="/admin/materials"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/materials")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                    >
                      Materials
                    </Link>
                    <Link
                      href="/admin/approvals"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/approvals")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                    >
                      Approvals
                    </Link>
                  </>
                )}

                {user.role === "TEACHER" && (
                  <Link
                    href="/teacher"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith("/teacher")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                  >
                    Dashboard
                  </Link>
                )}

                {user.role === "STUDENT" && (
                  <Link
                    href="/student"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith("/student")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Desktop Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {user ? (
                    <>
                      {/* User Info */}
                      <div className="pb-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground wrap-break-word">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role.toLowerCase()}</p>
                      </div>

                      {/* Navigation Links */}
                      <Link
                        href="/marketplace"
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/marketplace")
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>Marketplace</span>
                      </Link>

                      {user.role === "ADMIN" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/admin")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/admin/teachers"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/admin/teachers")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Teachers</span>
                          </Link>
                          <Link
                            href="/admin/materials"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/admin/materials")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Materials</span>
                          </Link>
                          <Link
                            href="/admin/approvals"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/admin/approvals")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Approvals</span>
                          </Link>
                        </>
                      )}

                      {user.role === "TEACHER" && (
                        <>
                          <Link
                            href="/teacher"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/teacher")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/teacher/upload"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/teacher/upload")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Upload Material</span>
                          </Link>
                          <Link
                            href="/teacher/analytics"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/teacher/analytics")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Analytics</span>
                          </Link>
                          <Link
                            href="/teacher/wallet"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/teacher/wallet")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Wallet</span>
                          </Link>
                        </>
                      )}

                      {user.role === "STUDENT" && (
                        <>
                          <Link
                            href="/student"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/student")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/student/downloads"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/student/downloads")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download History</span>
                          </Link>
                          <Link
                            href="/student/profile"
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive("/student/profile")
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent"
                              }`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                          </Link>
                        </>
                      )}

                      {/* Sign Out Button */}
                      <div className="pt-4 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-destructive-foreground bg-destructive rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMobileMenu}
                        className="w-full px-4 py-3 text-sm font-medium text-center text-foreground bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMobileMenu}
                        className="w-full px-4 py-3 text-sm font-medium text-center text-primary-foreground bg-primary rounded-md hover:opacity-90 transition-opacity"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
