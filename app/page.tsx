import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { QuickNav } from "@/components/QuickNav";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { FAQSection } from "@/components/FAQSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Somovibe | CBC Learning Platform — Learn, Teach & Earn",
  description:
    "Quality CBC learning materials from verified teachers. Students access premium notes & past papers. Teachers earn 75% commission. Powered by M-Pesa.",
  openGraph: {
    title: "Somovibe — CBC Learning Platform",
    description:
      "Quality CBC learning materials from verified teachers. Learn, teach, and earn.",
    type: "website",
  },
};

/* ─── Feature card data ─── */
const features = [
  {
    title: "For Students",
    description:
      "Access quality CBC learning materials from verified teachers at affordable prices. Pay via M-Pesa and download instantly.",
    gradient: "from-[#008c43] to-[#00b856]",
    badge: "Learn",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    href: "/marketplace",
    cta: "Browse Materials",
  },
  {
    title: "For Teachers",
    description:
      "Share your CBC materials and earn 75% of every sale. One-time KES 100 verification unlocks your earning potential.",
    gradient: "from-[#006832] to-[#008c43]",
    badge: "Earn",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: "/teacher-register",
    cta: "Start Earning",
  },
  {
    title: "Secure Payments",
    description:
      "All transactions powered by M-Pesa STK Push. Fast, safe, and reliable — no card details needed.",
    gradient: "from-[#004d25] to-[#006832]",
    badge: "Pay",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    href: "/register",
    cta: "Get Started",
  },
];

/* ─── How It Works steps ─── */
const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up for free in under 2 minutes. No credit card required — just your email and phone number.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Choose Your Role",
    description:
      "Are you a student looking to learn, or a teacher ready to earn? Pick the role that fits you best.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Learn or Earn",
    description:
      "Students: browse & buy CBC materials. Teachers: upload content, set prices, and start earning 75% commission.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote:
      "I've earned over KES 48,000 selling my Grade 5 CBC notes on Somovibe. The platform is easy to use and the M-Pesa payments are instant!",
    name: "Mary W.",
    role: "Primary School Teacher, Nairobi",
    initials: "MW",
    color: "bg-[#008c43]",
  },
  {
    quote:
      "My daughter's grades improved dramatically after we started buying CBC study materials here. The quality is outstanding and the price is fair.",
    name: "James K.",
    role: "Parent, Kisumu",
    initials: "JK",
    color: "bg-[#006832]",
  },
  {
    quote:
      "The past papers and marking schemes I found here are exactly aligned with CBC. As a Form 1 student it's been a game changer for my studies.",
    name: "Grace O.",
    role: "Grade 9 Student, Mombasa",
    initials: "GO",
    color: "bg-[#004d25]",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "TEACHER") redirect("/teacher");
    if (user.role === "STUDENT") redirect("/student");
  }

  return (
    <>
      <Navbar user={null} />
      <QuickNav />

      {/* ── Hero Sections ── */}
      <HeroSection />

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── Features ── */}
      <section className="bg-[#f0faf5] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block bg-white text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
              What We Offer
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
              Whether you&apos;re a student wanting to ace CBC exams or a teacher
              looking to monetize your expertise — Somovibe has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#d1e8dc] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />

                <div className="p-6 sm:p-8">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                      {feature.icon}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider text-[#008c43] bg-[#f0faf5] px-3 py-1 rounded-full`}>
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    className={`inline-flex items-center gap-2 font-semibold text-sm text-[#008c43] hover:text-[#006832] transition-colors group-hover:gap-3`}
                  >
                    {feature.cta}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white py-14 sm:py-20 scroll-mt-[7.5rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block bg-[#f0faf5] text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Up and Running in 3 Simple Steps
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
              Getting started on Somovibe takes less than 5 minutes. Here&apos;s
              how easy it is.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-gradient-to-r from-[#d1e8dc] via-[#008c43] to-[#d1e8dc]" />

            {steps.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center relative"
              >
                {/* Step number ring */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#008c43] to-[#00b856] flex items-center justify-center text-white shadow-lg shadow-[#008c43]/30 z-10 relative">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#004d25] text-white text-xs font-black flex items-center justify-center">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gradient-to-br from-[#f0faf5] via-[#e8f7ef] to-[#f0faf5] py-14 sm:py-20 border-y border-[#d1e8dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block bg-white text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
              Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
              Loved by Teachers &amp; Students Across Kenya
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-[#d1e8dc] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#008c43]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-gray-700 text-sm sm:text-base leading-relaxed italic flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-[#008c43] text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <CategoriesSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-[#004d25] via-[#008c43] to-[#00b856] py-16 sm:py-24 relative overflow-hidden">
        {/* Decorative dots */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Somovibe white logo above heading */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logos/Somovibe logo white.png"
              alt="Somovibe"
              width={64}
              height={64}
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Join Somovibe?
          </h2>
          <p className="text-white/80 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of students accessing quality CBC materials and
            teachers earning extra income. It&apos;s free to start.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#008c43] font-bold rounded-xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl text-sm sm:text-base"
            >
              Sign Up Free — It&apos;s Quick
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/60 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white active:scale-95 transition-all duration-200 text-sm sm:text-base"
            >
              Browse Materials
            </Link>
          </div>

          <p className="mt-8 text-white/50 text-xs sm:text-sm">
            No credit card required &nbsp;·&nbsp; Pay securely with M-Pesa &nbsp;·&nbsp; Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
