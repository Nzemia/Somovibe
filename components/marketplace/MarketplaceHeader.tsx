import Link from "next/link";

export function MarketplaceHeader() {
  return (
    <div className="w-full border-b border-[#d1e8dc] bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Brand + tagline */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#008c43]">
                Somovibe
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">CBC Learning Marketplace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Quality Teaching Resources
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Notes, exams &amp; schemes from verified Kenyan teachers. Pay via M‑Pesa, access instantly.
            </p>
          </div>

          {/* Right: trust pills + teacher CTA */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
            {/* Trust pills row */}
            <div className="flex flex-wrap gap-1.5">
              <TrustPill label="Verified teachers" />
              <TrustPill label="M-Pesa secured" />
              <TrustPill label="Instant access" />
            </div>
            {/* Teacher CTA */}
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm shadow-[#008c43]/20 active:scale-95"
              style={{ background: "linear-gradient(135deg, #006832 0%, #008c43 60%, #00a854 100%)" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Sell your resources
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function TrustPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#f0faf5] text-[#006832] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#d1e8dc]">
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
        <path d="M13.207 4.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L6.5 9.586l5.293-5.293a1 1 0 011.414 0z"
          fill="currentColor" />
      </svg>
      {label}
    </span>
  );
}
