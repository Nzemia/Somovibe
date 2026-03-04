import Link from "next/link"
import Image from "next/image"

export function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-[#002b14] text-white">
            {/* Top wave */}
            <div className="w-full overflow-hidden leading-none">
                <svg
                    viewBox="0 0 1440 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-8 sm:h-10 block"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 40 C360 0 1080 0 1440 40 L1440 0 L0 0 Z"
                        fill="#008c43"
                    />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
                    {/* ── Brand column ── */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 mb-5"
                        >
                            <Image
                                src="/logos/somovibe-logo-white.png"
                                alt="Somovibe"
                                width={44}
                                height={44}
                                className="h-10 w-auto object-contain"
                            />
                            <Image
                                src="/logos/somovibe-text-white.png"
                                alt="Somovibe"
                                width={140}
                                height={38}
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-white/60 leading-relaxed text-sm sm:text-base max-w-xs">
                            Kenya&apos;s premier CBC
                            educational marketplace. Quality
                            materials from verified teachers
                            — empowering students and
                            educators nationwide.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-white/40 text-xs">
                            <span className="w-2 h-2 rounded-full bg-[#00e676] inline-block animate-pulse" />
                            Platform online · M-Pesa active
                        </div>
                    </div>

                    {/* ── Links column ── */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-6">
                            Explore
                        </h3>
                        <ul className="space-y-3">
                            {[
                                {
                                    label: "Home",
                                    href: "/"
                                },
                                {
                                    label: "Marketplace",
                                    href: "/marketplace"
                                },
                                {
                                    label: "About Us",
                                    href: "/about"
                                },
                                {
                                    label: "Contact Us",
                                    href: "/contact"
                                },
                                {
                                    label: "Privacy Policy",
                                    href: "/privacy"
                                },
                                {
                                    label: "Terms of Service",
                                    href: "/terms"
                                }
                            ].map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <svg
                                            className="w-3 h-3 text-[#008c43] opacity-0 group-hover:opacity-100 transition-opacity"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={
                                                    3
                                                }
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Get Started card ── */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/35 mb-6">
                            Get Started
                        </h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                            <p className="text-white/70 text-sm leading-snug mb-1">
                                Join thousands of teachers
                                and students already on
                                Somovibe.
                            </p>

                            <Link
                                href="/register"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#008c43] hover:bg-[#006832] text-white font-bold rounded-xl transition-colors text-sm"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Sign Up Free
                            </Link>

                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-semibold rounded-xl transition-colors text-sm"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                    />
                                </svg>
                                Log In
                            </Link>

                            <Link
                                href="/teacher-register"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-colors text-sm border border-white/10"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                                    />
                                </svg>
                                Become a Teacher
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-sm text-white/35">
                        © {year} Somovibe. All rights
                        reserved.
                    </p>
                    <p className="text-sm text-white/25">
                        Empowering Kenya&apos;s CBC
                        education 🇰🇪
                    </p>
                </div>
            </div>
        </footer>
    )
}
