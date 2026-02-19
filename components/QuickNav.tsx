"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/* ── Icons ─────────────────────────────────────────────── */
function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function BuyIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function SellIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.121-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function ContactIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

/* ── Sell Modal ─────────────────────────────────────────── */
function SellModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#f0faf5] flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#008c43]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
          </svg>
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 mb-2">
          Start Selling on Somovibe
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          To sell your CBC teaching materials, you need a verified teacher
          account. It only costs <span className="text-[#008c43] font-bold">KES 100</span> — a one-time verification fee.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); router.push("/teacher-register"); }}
            className="w-full py-3 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] active:scale-95 transition-all"
          >
            Register as a Teacher
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Nav item type ──────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
  href?: string;
  activeOn: string[];
  icon: (filled: boolean) => React.ReactNode;
  action?: () => void;
}

/* ── Main component ─────────────────────────────────────── */
export function QuickNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showSellModal, setShowSellModal] = useState(false);

  const handleSell = () => {
    const role = session?.user?.role as string | undefined;
    if (role === "TEACHER") {
      router.push("/teacher");
    } else {
      setShowSellModal(true);
    }
  };

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
      activeOn: ["/"],
      icon: (filled) => <HomeIcon filled={filled} />,
    },
    {
      id: "buy",
      label: "Buy",
      href: "/marketplace",
      activeOn: ["/marketplace"],
      icon: (filled) => <BuyIcon filled={filled} />,
    },
    {
      id: "sell",
      label: "Sell",
      activeOn: ["/teacher"],
      icon: (filled) => <SellIcon filled={filled} />,
      action: handleSell,
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
      activeOn: ["/contact"],
      icon: (filled) => <ContactIcon filled={filled} />,
    },
  ];

  return (
    <>
      {/* Sell modal */}
      {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}

      {/* Icon strip — sticky directly below the h-14 navbar */}
      <div
        className="sticky top-14 z-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,40,20,0.97) 0%, rgba(0,100,50,0.95) 50%, rgba(0,140,67,0.93) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around sm:justify-center sm:gap-20 h-16">
            {navItems.map((item) => {
              const isActive =
                item.activeOn.includes(pathname) ||
                item.activeOn.some(
                  (p) => p !== "/" && pathname.startsWith(p)
                );

              const inner = (
                <span className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2.5">
                  <span
                    className={`transition-colors ${
                      isActive ? "text-white" : "text-white/55 group-hover:text-white"
                    }`}
                  >
                    {item.icon(isActive)}
                  </span>
                  <span
                    className={`text-[11px] sm:text-sm font-bold tracking-wide transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-white/55 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </span>
              );

              const baseClass =
                `group relative flex items-center justify-center px-4 sm:px-6 py-2 rounded-xl transition-all duration-200 ` +
                (isActive
                  ? "bg-white/20"
                  : "hover:bg-white/10 active:scale-95");

              if (item.action) {
                return (
                  <button key={item.id} onClick={item.action} className={baseClass}>
                    {inner}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
                    )}
                  </button>
                );
              }

              return (
                <Link key={item.id} href={item.href!} className={baseClass}>
                  {inner}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
