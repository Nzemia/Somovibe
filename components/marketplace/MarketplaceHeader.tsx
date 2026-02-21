import React from "react";
import Link from "next/link";

export function MarketplaceHeader() {
  return (
    <section className="w-full border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12 pb-8 md:pb-10">
        <div className="flex flex-col gap-8 md:gap-10">
          {/* Hero title block */}
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
              Teaching Resources
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-tight">
              CBC Marketplace
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-600 max-w-2xl">
              Discover verified CBC notes, schemes, exams, and lesson plans from
              trusted Kenyan teachers. Pay securely, access instantly.
            </p>
          </div>

          {/* Trust bar - premium pill style */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3">
            <TrustItem label="Verified teachers" />
            <TrustItem label="M-Pesa payouts" />
            <TrustItem label="Secure payments" />
            <TrustItem label="Rated resources" />
            <TrustItem label="Receipts provided" />
          </div>

          {/* Seller CTA - premium banner */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-lg md:text-xl font-semibold tracking-tight">
                  Sell your teaching resources
                </h2>
                <p className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed">
                  Get verified, upload once, earn repeatedly. Fast payouts via
                  M-Pesa when your CBC materials sell.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href="/teacher-register"
                  className="inline-flex justify-center items-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/30"
                >
                  Become a Verified Teacher
                </Link>
                <Link
                  href="#"
                  className="inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-colors"
                >
                  How verification works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-700">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
