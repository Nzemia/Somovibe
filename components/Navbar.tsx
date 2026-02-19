"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

export function Navbar({ user }: { user: { email: string; role: string } | null }) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,26,13,0.92) 0%, rgba(0,77,37,0.88) 50%, rgba(0,140,67,0.82) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Text logo — vertically centered, larger */}
          <Link href="/" className="shrink-0 flex items-center self-center">
            <Image
              src="/logos/Somovibe text white.png"
              alt="Somovibe"
              width={200}
              height={56}
              className="w-auto object-contain"
              style={{ height: "42px", display: "block" }}
              priority
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Email (desktop only) */}
                <span className="hidden md:block text-sm text-white/70 truncate max-w-[180px]">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg border border-white/40 text-white hover:bg-white/10 transition-colors disabled:opacity-60"
                >
                  {signingOut ? "Signing out…" : "Sign Out"}
                </button>
              </>
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
