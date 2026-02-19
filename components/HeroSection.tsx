import Link from "next/link";
import Image from "next/image";

/*
  Total sticky header = h-14 (navbar 56px) + h-16 (quicknav 64px) = 120px = 7.5rem
  Hero wrapper fills the rest: calc(100vh - 7.5rem)
  Two equal rows → each row = calc(50vh - 3.75rem)
*/

/* ────────────────────────────────────────────────────────────
   SECTION 1 — Teacher / Earn
   Both mobile + desktop: [WHITE image] | [GREEN text]
──────────────────────────────────────────────────────────── */
function TeacherRow() {
  return (
    <div className="flex min-h-0 overflow-hidden">
      {/* Image panel — white bg, 42% width on all sizes */}
      <div className="relative w-[42%] shrink-0 bg-white overflow-hidden">
        <Image
          src="/Images/teacher with money.png"
          alt="Teacher earning extra income"
          fill
          className="object-cover object-center"
          priority
          sizes="42vw"
        />
      </div>

      {/* Text panel — green gradient, remaining width */}
      <div
        className="flex-1 relative flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #001a0d 0%, #004d25 45%, #008c43 100%)",
        }}
      >
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative px-5 sm:px-8 md:px-10 lg:px-14 py-4 max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse shrink-0" />
            For Teachers
          </span>

          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-snug mb-2 sm:mb-3">
            Earn KSh&nbsp;30,000–100,000+{" "}
            <span className="text-green-300">Extra as a Teacher</span>
          </h2>

          <p className="text-white/70 text-[11px] sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5 max-w-sm">
            Upload once &rarr; Share your personal link &rarr; Earn 75% forever.
          </p>

          <Link
            href="/teacher-register"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-[#008c43] font-extrabold rounded-xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-lg text-xs sm:text-sm md:text-base"
          >
            Start Earning Today
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SECTION 2 — Student / Buy
   Both mobile + desktop: [GREEN text] | [WHITE image]
──────────────────────────────────────────────────────────── */
function StudentRow() {
  return (
    <div className="flex min-h-0 overflow-hidden border-t border-white/10">
      {/* Text panel — green gradient */}
      <div
        className="flex-1 relative flex items-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #002914 0%, #006832 45%, #00a854 100%)",
        }}
      >
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative px-5 sm:px-8 md:px-10 lg:px-14 py-4 max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse shrink-0" />
            For Parents &amp; Students
          </span>

          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-snug mb-2 sm:mb-3">
            Parents Get{" "}
            <span className="text-green-300">Affordable, Trusted</span>{" "}
            CBC Notes
          </h2>

          <p className="text-white/70 text-[11px] sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5 max-w-sm">
            Buy direct from teachers you know. Pay via M-Pesa. Download instantly.
          </p>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-[#008c43] font-extrabold rounded-xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-lg text-xs sm:text-sm md:text-base"
          >
            Get Resources Now
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Image panel — white bg, 42% width */}
      <div className="relative w-[42%] shrink-0 bg-white overflow-hidden">
        <Image
          src="/Images/students happy.png"
          alt="Happy students with quality CBC resources"
          fill
          className="object-cover object-center"
          sizes="42vw"
        />
      </div>
    </div>
  );
}

/* ── Export ─────────────────────────────────────────────── */
export function HeroSection() {
  return (
    /*
      h-14 navbar + h-16 quicknav = 120px = 7.5rem
      Use 100dvh for mobile (excludes browser chrome), fallback to 100vh
    */
    <div
      className="grid grid-rows-2 overflow-hidden"
      style={{ height: "calc(100dvh - 7.5rem)" }}
    >
      <TeacherRow />
      <StudentRow />
    </div>
  );
}
