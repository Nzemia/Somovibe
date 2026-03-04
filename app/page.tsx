import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/Navbar"
import { QuickNav } from "@/components/QuickNav"
import { Footer } from "@/components/Footer"
import { HeroSection } from "@/components/HeroSection"
import { FAQSection } from "@/components/FAQSection"
import { CategoriesSection } from "@/components/CategoriesSection"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Somovibe | CBC Learning Platform — Learn, Teach & Earn",
    description:
        "Quality CBC learning materials from verified teachers. Students access premium notes & past papers. Teachers earn 75% commission. Powered by M-Pesa.",
    openGraph: {
        title: "Somovibe — CBC Learning Platform",
        description:
            "Quality CBC learning materials from verified teachers. Learn, teach, and earn.",
        type: "website"
    }
}

/* ─── How It Works steps ─── */
const steps = [
    {
        step: "01",
        title: "Create Your Account",
        description:
            "Sign up for free in under 2 minutes. No credit card required — just your email and phone number.",
        icon: (
            <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        )
    },
    {
        step: "02",
        title: "Choose Your Role",
        description:
            "Are you a student looking to learn, or a teacher ready to earn? Pick the role that fits you best.",
        icon: (
            <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
            </svg>
        )
    },
    {
        step: "03",
        title: "Learn or Earn",
        description:
            "Students: browse & buy CBC materials. Teachers: upload content, set prices, and start earning 75% commission.",
        icon: (
            <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
        )
    }
]

export default async function Home() {
    const user = await getCurrentUser()

    if (user) {
        if (user.role === "ADMIN") redirect("/admin")
        if (user.role === "TEACHER") redirect("/teacher")
        if (user.role === "STUDENT") redirect("/student")
    }

    return (
        <>
            <Navbar
                user={
                    user
                        ? {
                              email: user.email,
                              role: user.role
                          }
                        : null
                }
            />
            <QuickNav />

            {/* ── Hero Sections ── */}
            <HeroSection />

            {/* ── Categories ── */}
            <CategoriesSection />

            {/* ── How It Works ── */}
            <section
                id="how-it-works"
                className="bg-white py-14 sm:py-20 scroll-mt-30"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-block bg-[#f0faf5] text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
                            How It Works
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                            Up and Running in 3 Simple Steps
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
                            Getting started on Somovibe
                            takes less than 5 minutes.
                            Here&apos;s how easy it is.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden md:block absolute top-16 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-linear-to-r from-[#d1e8dc] via-[#008c43] to-[#d1e8dc]" />

                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-[#d1e8dc] p-5 sm:p-6 hover:shadow-md transition-shadow"
                            >
                                {/* Mobile: icon + title side by side. Desktop: stacked centered */}
                                <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-0 md:text-center">
                                    {/* Icon bubble */}
                                    <div className="relative shrink-0 md:mb-6">
                                        <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#008c43] to-[#00b856] flex items-center justify-center text-white shadow-lg shadow-[#008c43]/30">
                                            {step.icon}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-foreground text-white text-xs font-black flex items-center justify-center">
                                            {step.step}
                                        </div>
                                    </div>

                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                                        {step.title}
                                    </h3>
                                </div>

                                <p className="text-gray-500 text-sm leading-relaxed mt-3 md:text-center">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            Get Started Free
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <FAQSection />

            {/* ── CTA ── */}
            <section
                className="relative overflow-hidden py-20 sm:py-28"
                style={{
                    background:
                        "linear-gradient(135deg, #003318 0%, #006832 40%, #008c43 70%, #00b856 100%)"
                }}
            >
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "48px 48px"
                    }}
                />
                {/* Glow blobs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00b856]/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-foreground/40 blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Left: branding + copy */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex justify-center lg:justify-start mb-6">
                                <Image
                                    src="/logos/somovibe-logo-white.png"
                                    alt="Somovibe"
                                    width={64}
                                    height={64}
                                    className="h-14 w-auto object-contain"
                                />
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                                Kenya&apos;s Teachers
                                <br className="hidden sm:block" />{" "}
                                Deserve to Earn More.
                            </h2>
                            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
                                Over{" "}
                                <strong className="text-white">
                                    10,000+ CBC resources
                                </strong>{" "}
                                sold monthly. Teachers
                                earning up to KSh 100,000
                                extra. Students acing exams.
                                All on one platform.
                            </p>
                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {[
                                    {
                                        icon: "✓",
                                        label: "M-Pesa Payments"
                                    },
                                    {
                                        icon: "✓",
                                        label: "Free to Join"
                                    },
                                    {
                                        icon: "✓",
                                        label: "75% Commission"
                                    }
                                ].map(b => (
                                    <span
                                        key={b.label}
                                        className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                                    >
                                        <span className="text-[#00e676]">
                                            {b.icon}
                                        </span>{" "}
                                        {b.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right: action card */}
                        <div className="shrink-0 w-full max-w-sm lg:max-w-xs">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">
                                    Get Started Today
                                </p>
                                <p className="text-white text-2xl font-extrabold mb-6">
                                    It&apos;s completely
                                    free
                                </p>

                                <Link
                                    href="/register"
                                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-[#008c43] font-extrabold rounded-2xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-xl text-sm sm:text-base mb-3"
                                >
                                    <svg
                                        className="w-5 h-5 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={
                                                2.5
                                            }
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Create Free Account
                                </Link>

                                <Link
                                    href="/marketplace"
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border-2 border-white/40 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/70 active:scale-95 transition-all duration-200 text-sm sm:text-base"
                                >
                                    <svg
                                        className="w-5 h-5 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Browse Materials
                                </Link>

                                <p className="mt-5 text-white/40 text-xs">
                                    No credit card · Pay
                                    with M-Pesa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <ScrollToTopButton />
        </>
    )
}
