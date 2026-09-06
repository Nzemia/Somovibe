import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Fold } from "@/components/Fold";
import { RolesSection } from "@/components/RolesSection";
import { FAQSection } from "@/components/FAQSection";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Somovibe | CBC Learning Platform — Learn, Teach & Earn",
  },
  description:
    "Quality CBC learning materials from verified teachers. Students access premium notes & past papers. Teachers earn 75% commission. Powered by M-Pesa.",
  keywords: [
    "CBC notes",
    "grade 1", "grade 2", "grade 3", "grade 4", "grade 5", "grade 6", "grade 7", "grade 8", "grade 9",
    "CBC learning materials",
    "buy CBC notes online Kenya",
    "CBC teacher marketplace"
  ],
  alternates: {
    canonical: "https://somovibe.com",
  },
  openGraph: {
    title: "Somovibe | CBC Learning Platform — Learn, Teach & Earn",
    description:
      "Quality CBC learning materials from verified teachers. Students access premium notes & past papers. Teachers earn 75% commission. Powered by M-Pesa.",
    url: "https://somovibe.com",
    type: "website",
    images: [
      {
        url: "https://somovibe.com/logos/somovibe-favicon.png",
        width: 800,
        height: 600,
        alt: "Somovibe CBC Learning Platform",
      },
    ],
  },
};

export default async function Home() {
    const user = await getCurrentUser()

    if (user) {
        if (user.role === "ADMIN") redirect("/admin")
        if (user.role === "TEACHER") redirect("/teacher")
        // Parents and learners stay on the public shop, not the downloads dashboard
        if (user.role === "STUDENT") redirect("/marketplace")
    }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Somovibe",
    "url": "https://somovibe.com",
    "logo": "https://somovibe.com/logos/somovibe-favicon.png",
    "sameAs": [
      "https://www.tiktok.com/@somovibe.resources",
      "https://www.instagram.com/somovibe_resources"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Somovibe",
    "url": "https://somovibe.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://somovibe.com/marketplace?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I become a teacher on Somovibe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click Sell materials, complete the registration form, and pay the one-time KES 100 verification fee via M-Pesa. Once verified, you can start uploading and selling your CBC teaching materials immediately."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I earn as a teacher?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You earn 75% commission on every sale — one of the highest rates in the industry. There is no cap on your earnings. The more quality materials you upload and the more you promote your profile, the more you earn. Many teachers on Somovibe earn over KES 10,000 per month."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods are accepted?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support M-Pesa STK Push, making payments instant and secure for all users in Kenya. Simply enter your M-Pesa phone number and confirm the prompt on your phone — no card details required."
        }
      },
      {
        "@type": "Question",
        "name": "Are all materials CBC-aligned?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Every material submitted is reviewed against the CBC curriculum framework before being published. Our verification process ensures that content is accurate, grade-appropriate, and aligned with Kenya's 8-4-4 successor curriculum."
        }
      },
      {
        "@type": "Question",
        "name": "How do I access materials I've purchased?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "After a successful M-Pesa payment, your materials are instantly available for download from your Learner Dashboard under 'My Downloads'. You can download them at any time — there are no expiry limits."
        }
      },
      {
        "@type": "Question",
        "name": "Can I sell materials for any grade level?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Teachers can upload materials for all CBC levels — from Pre-Primary (PP1 & PP2) through Lower Primary (Grades 1–3), Upper Primary (Grades 4–6), and Junior Secondary (Grades 7–9)."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Nav user={user ? { email: user.email, role: user.role } : null} waveUntilScroll />

      {/* ── Hero Sections ── */}
      <Fold />
      <RolesSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-20 sm:py-28" style={{ background: "linear-gradient(135deg, #003318 0%, #006832 40%, #008c43 70%, #00b856 100%)" }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Glow blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#00b856]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#004d25]/40 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left: branding + copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <Image src="/logos/somovibe-logo-white.png" alt="Somovibe" width={64} height={64} className="h-14 w-auto object-contain" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                Kenya&apos;s Teachers<br className="hidden sm:block" /> Deserve to Earn More.
              </h2>
              <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-6 max-w-lg">
                Upload the schemes, plans, and notes you already write. Parents and students buy them on Somovibe, and you keep <strong className="text-white">75% on every sale</strong> — paid to M-Pesa. The best side hustle for a CBC teacher: work you already do, extra income you can actually withdraw.
              </p>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {[
                  { icon: "✓", label: "M-Pesa Payments" },
                  { icon: "✓", label: "KES 100 to sell" },
                  { icon: "✓", label: "75% Commission" },
                ].map((b) => (
                  <span key={b.label} className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="text-[#00e676]">{b.icon}</span> {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: action card */}
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-xs">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
                <p className="text-white text-2xl font-extrabold mb-6">Get started today</p>

                <Link href="/teacher-register" className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-[#008c43] font-extrabold rounded-full hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-xl text-sm sm:text-base mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7h18M5 7l1 12h12l1-12M9 11v6m6-6v6" />
                  </svg>
                  Sell materials
                </Link>

                <Link href="/marketplace" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/70 active:scale-95 transition-all duration-200 text-sm sm:text-base">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Shop materials
                </Link>

                <p className="mt-5 text-white/40 text-xs">Teachers: one-time KES 100 verification · Buyers pay with M-Pesa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTopButton />
    </>
  );
}
