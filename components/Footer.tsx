import Link from "next/link"
import Image from "next/image"
import { Store } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"

export async function Footer() {
  const year = new Date().getFullYear()
  const user = await getCurrentUser()
  const dashboardHref =
    user?.role === "TEACHER" ? "/teacher"
    : user?.role === "ADMIN" ? "/admin"
    : user ? "/student"
    : null
  const logoHref = user ? "/marketplace" : "/"

  return (
    <footer className="bg-[#002b14] text-white">
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8 sm:h-10 block" preserveAspectRatio="none">
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 0 L0 0 Z" fill="#008c43" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">

          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={logoHref} className="inline-flex items-center gap-3 mb-5">
              <Image src="/logos/somovibe-logo-white.png" alt="Somovibe" width={44} height={44} className="h-10 w-auto object-contain" />
              <Image src="/logos/somovibe-text-white.png" alt="Somovibe" width={140} height={38} className="h-9 w-auto object-contain" />
            </Link>
            <p className="text-white/60 leading-relaxed text-sm sm:text-base max-w-xs">
              Kenya&apos;s premier CBC educational marketplace. Quality materials from verified teachers — empowering students and educators nationwide.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-6">Explore</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: logoHref },
                { label: "Marketplace", href: "/marketplace" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "I already paid", href: "/paid" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                    <svg className="w-3 h-3 text-[#008c43] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-6">Get Started</h3>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              {user && dashboardHref ? (
                <>
                  <p className="text-white/70 text-sm leading-snug mb-1">
                    You&apos;re signed in. Head back to your dashboard or keep browsing.
                  </p>
                  <Link href={dashboardHref} className="flex items-center justify-center gap-2 w-full py-3 bg-[#008c43] hover:bg-[#006832] text-white font-bold rounded-xl transition-colors text-sm">
                    Go to dashboard
                  </Link>
                  <Link href="/marketplace" className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold rounded-xl transition-colors text-sm">
                    Browse marketplace
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-sm leading-snug mb-1">
                    Join thousands of teachers and students already on Somovibe.
                  </p>
                  <Link href="/register" className="flex items-center justify-center gap-2 w-full py-3 bg-[#008c43] hover:bg-[#006832] text-white font-bold rounded-xl transition-colors text-sm">
                    Sign up
                  </Link>
                  <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold rounded-xl transition-colors text-sm">
                    Log In
                  </Link>
                  <Link href="/teacher-register" className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-colors text-sm border border-white/10">
                    <Store className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    Sell materials now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-white/35">
            © {year} Somovibe. All rights reserved.
          </p>
          <p className="text-sm text-white/25">
            Empowering Kenya&apos;s CBC education 🇰🇪
          </p>
        </div>
      </div>
    </footer>
  )
}
