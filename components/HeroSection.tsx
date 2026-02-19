"use client";

import Image from "next/image";

/*
  Upwork-style hero:
  - Full viewport minus navbar (h-14 = 56px) + quicknav (h-16 = 64px) = 120px
  - teacher happy.jpg as background
  - Solid #008c43 overlay (semi-transparent to reveal image)
  - Centered text + two scroll buttons
*/

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HeroSection() {
  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ height: "calc(100dvh - 7.5rem)", minHeight: "420px" }}
    >
      {/* Background image */}
      <Image
        src="/Images/teacher happy.jpg"
        alt="Teacher empowering the community"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Solid green overlay — 30% opacity */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 140, 67, 0.30)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 max-w-3xl mx-auto w-full">
        {/* Eyebrow badge */}
        <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 sm:mb-6">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          CBC Learning Marketplace
        </span>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 sm:mb-5 drop-shadow-lg">
          Earn{" "}
          <span className="underline decoration-white/50 decoration-4 underline-offset-4">
            KSh 5,000+
          </span>{" "}
          Extra Income
        </h1>

        {/* Sub */}
        <p className="text-white/85 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-xl">
          Empower knowledge in the community and get rewarded for it.
        </p>

        {/* Two CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#008c43] font-extrabold rounded-xl hover:bg-white/95 active:scale-95 transition-all duration-200 shadow-xl text-sm sm:text-base w-full sm:w-auto"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            I want to Earn
          </button>

          <button
            onClick={() => scrollTo("categories")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-extrabold rounded-xl hover:bg-white/10 active:scale-95 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            I want to Buy
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-white/50 text-xs">Scroll to explore</span>
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
