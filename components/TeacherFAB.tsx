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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 13.5l4-4 4 4 4-6 4 3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 20h18" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18-3v3" />
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

export function TeacherFAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="sm:hidden fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2.5">

      {/* Speed-dial items */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 origin-bottom ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {ACTIONS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => { setOpen(false); router.push(a.href); }}
            className="flex items-center gap-2.5"
            style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
          >
            {/* Label pill */}
            <span className="bg-gray-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
              {a.label}
            </span>
            {/* Icon circle */}
            <span className={`w-12 h-12 rounded-full ${a.bg} text-white flex items-center justify-center shadow-xl shrink-0 active:scale-90 transition-transform`}>
              {a.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
          open ? "bg-gray-800" : "bg-[#008c43] hover:bg-[#006832]"
        }`}
        aria-label={open ? "Close actions" : "Quick actions"}
      >
        <svg
          className={`w-6 h-6 text-white transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
