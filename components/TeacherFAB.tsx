"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const ACTIONS = [
  {
    id: "upload",
    label: "Upload Material",
    href: "/teacher/upload",
    bg: "bg-[#008c43]",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/teacher/analytics",
    bg: "bg-indigo-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: "wallet",
    label: "Wallet",
    href: "/teacher/wallet",
    bg: "bg-sky-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    href: "/teacher/profile",
    bg: "bg-amber-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function TeacherFAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    /* Only visible on mobile (sm:hidden) */
    <div ref={ref} className="sm:hidden fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">
      {/* Action items — revealed when open */}
      <div
        className={`flex flex-col items-end gap-2.5 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => { setOpen(false); router.push(a.href); }}
            className="flex items-center gap-3 group"
          >
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {a.label}
            </span>
            <span
              className={`w-12 h-12 rounded-full ${a.bg} text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform`}
            >
              {a.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
          open
            ? "bg-gray-800 rotate-45"
            : "bg-[#008c43] hover:bg-[#006832]"
        }`}
        aria-label={open ? "Close menu" : "Quick actions"}
      >
        <svg
          className="w-6 h-6 text-white transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
