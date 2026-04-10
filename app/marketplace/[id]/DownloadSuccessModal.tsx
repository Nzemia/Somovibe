"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";

/* ── Motivational messages ────────────────────────────────── */
const MESSAGES: { icon: React.ReactNode; headline: string; sub: string }[] = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
    headline: "You're levelling up!",
    sub: "Every resource you download is a step closer to mastery.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    headline: "Champion mindset!",
    sub: "Smart students use the best materials. You just did.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    headline: "Knowledge unlocked!",
    sub: "This material is your shortcut to better grades.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07l-.71.71M5.64 18.36l-.71.71M18.36 18.36l-.71-.71M5.64 5.64l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
    headline: "Future is bright!",
    sub: "Invest in knowledge — it pays the best dividends.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    headline: "Brilliant choice!",
    sub: "Top performers always come prepared. That's you.",
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    headline: "Keep pushing!",
    sub: "Consistent study with great materials wins every time.",
  },
];

/* ── Subject colour map ───────────────────────────────────── */
const SUBJECT_COLOR: Record<string, string> = {
  Mathematics:          "#6d28d9",
  English:              "#2563eb",
  Kiswahili:            "#0d9488",
  Science:              "#0284c7",
  "Social Studies":     "#d97706",
  Agriculture:          "#65a30d",
  "Home Science":       "#db2777",
  "Creative Arts":      "#c026d3",
  ICT:                  "#0ea5e9",
  "Physical Education": "#ea580c",
  Music:                "#7c3aed",
  "Religious Education":"#b45309",
  "Business Studies":   "#059669",
  Geography:            "#16a34a",
  History:              "#d97706",
};

/* ── Types ────────────────────────────────────────────────── */
type RelatedItem = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  price: number;
  teacher: { email: string; name?: string | null };
  reviews: { rating: number }[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: string;
    title: string;
    subject: string;
    grade: string;
    teacher: { name?: string | null; email: string };
  };
  moreFromTeacher: RelatedItem[];
  similarMaterials: RelatedItem[];
};

/* ── Tiny related-material card ──────────────────────────── */
function MiniCard({ item }: { item: RelatedItem }) {
  const color = SUBJECT_COLOR[item.subject] ?? "#008c43";
  const avg =
    item.reviews.length > 0
      ? (item.reviews.reduce((s, r) => s + r.rating, 0) / item.reviews.length).toFixed(1)
      : null;

  return (
    <Link
      href={`/marketplace/${item.id}`}
      className="flex gap-3 items-start p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-100"
    >
      {/* Color swatch */}
      <div
        className="w-1.5 self-stretch rounded-full shrink-0"
        style={{ background: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#008c43] transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400">{item.grade}</span>
          {avg && (
            <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {avg}
            </span>
          )}
          <span className="text-[10px] font-bold text-[#008c43] ml-auto">
            KES {item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Confetti particle ────────────────────────────────────── */
function Particle({ x, color, delay, size }: { x: number; color: string; delay: number; size: number }) {
  return (
    <span
      className="absolute top-0 rounded-full opacity-0 pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        background: color,
        animation: `particle-fall 1.4s ease-out ${delay}s forwards`,
      }}
    />
  );
}

/* ── Main modal ───────────────────────────────────────────── */
export function DownloadSuccessModal({
  isOpen,
  onClose,
  material,
  moreFromTeacher,
  similarMaterials,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/marketplace/${material.id}`
      : `/marketplace/${material.id}`;

  const teacherHandle = material.teacher.name || material.teacher.email.split("@")[0];

  useEffect(() => { setMounted(true); }, []);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  /* iOS-safe scroll lock — overflow:hidden on body breaks fixed on Safari */
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflowY = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: material.title, url: shareUrl });
      } catch {}
    } else {
      handleCopy();
    }
  }, [material.title, shareUrl, handleCopy]);

  if (!mounted || !isOpen) return null;

  const particles = [
    { x: 10, color: "#fbbf24", delay: 0,    size: 8 },
    { x: 22, color: "#34d399", delay: 0.1,  size: 6 },
    { x: 35, color: "#60a5fa", delay: 0.05, size: 10 },
    { x: 48, color: "#f472b6", delay: 0.15, size: 7 },
    { x: 60, color: "#a78bfa", delay: 0.08, size: 9 },
    { x: 72, color: "#fbbf24", delay: 0.12, size: 6 },
    { x: 83, color: "#34d399", delay: 0.02, size: 8 },
    { x: 92, color: "#60a5fa", delay: 0.18, size: 7 },
  ];

  return createPortal(
    <>
      {/* Backdrop — cursor:pointer required for iOS Safari tap recognition on divs */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
        style={{
          background: "rgba(0,0,0,0.65)",
          WebkitBackdropFilter: "blur(6px)",
          backdropFilter: "blur(6px)",
          cursor: "pointer",
          touchAction: "none",
        }}
        onClick={onClose}
      >
        {/* ── Modal card — wide rectangle ── */}
        <div
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
          style={{ animation: "modal-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards", cursor: "default", maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── LEFT / TOP panel — green ── */}
          <div
            className="relative sm:w-[38%] shrink-0 flex flex-col items-center justify-center text-center overflow-hidden
                        px-6 py-8 sm:py-0 sm:min-h-full"
            style={{ background: "linear-gradient(160deg, #003318 0%, #006832 45%, #008c43 80%, #00b856 100%)" }}
          >
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => <Particle key={i} {...p} />)}
            </div>

            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)," +
                  "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 24px)",
              }}
            />

            {/* Close button — top-right corner of the green panel on mobile, hidden on sm+ */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:hidden z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              aria-label="Close"
              style={{ cursor: "pointer" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Motivational content */}
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-extrabold text-white leading-tight">
                <span className="text-white/80 shrink-0">{msg.icon}</span>
                {msg.headline}
              </h2>
              <p className="text-white/65 text-sm mt-2 max-w-[220px] leading-relaxed">{msg.sub}</p>

              {/* Material pill */}
              <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 max-w-full">
                <svg className="w-3 h-3 text-white/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-white/85 text-xs font-semibold truncate max-w-[180px]">{material.title}</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT / BOTTOM panel — content ── */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Close button — desktop only, top-right of white panel */}
            <button
              onClick={onClose}
              className="hidden sm:flex absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center text-gray-400 hover:text-gray-700 transition-all active:scale-90"
              aria-label="Close"
              style={{ cursor: "pointer" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-5 pb-3 space-y-5">

              {/* Share */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share this resource
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    style={{ cursor: "pointer" }}
                    className={`flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-bold transition-all active:scale-95 ${
                      copied
                        ? "border-[#008c43] bg-[#f0faf5] text-[#008c43]"
                        : "border-gray-200 text-gray-700 hover:border-[#008c43] hover:text-[#008c43]"
                    }`}
                  >
                    {copied ? (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>Copied!</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>Copy link</>
                    )}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`📚 Check out "${material.title}" on Somovibe — quality CBC materials!\n${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-[#25D366]/40 text-[#128C7E] bg-[#f0fdf4] hover:bg-[#dcfce7] hover:border-[#25D366] text-xs font-bold transition-all active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  {"share" in navigator && (
                    <button
                      onClick={handleNativeShare}
                      style={{ cursor: "pointer" }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-[#008c43] hover:text-[#008c43] text-xs font-bold transition-all active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0L8 6m4-4v13" />
                      </svg>
                      Share
                    </button>
                  )}
                </div>
              </div>

              {/* More from teacher */}
              {moreFromTeacher.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0"
                        style={{ background: "linear-gradient(135deg,#008c43 0%,#004d25 100%)" }}
                      >
                        {teacherHandle[0].toUpperCase()}
                      </span>
                      More from {teacherHandle}
                    </p>
                    <Link
                      href={`/marketplace?search=${encodeURIComponent(material.teacher.email.split("@")[0])}`}
                      onClick={onClose}
                      className="text-[11px] text-[#008c43] font-bold hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {moreFromTeacher.slice(0, 2).map(item => (
                      <div key={item.id} onClick={onClose}>
                        <MiniCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* More from subject */}
              {similarMaterials.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: SUBJECT_COLOR[material.subject] ?? "#008c43" }}
                      />
                      More {material.subject}
                    </p>
                    <Link
                      href={`/marketplace?subject=${encodeURIComponent(material.subject)}`}
                      onClick={onClose}
                      className="text-[11px] text-[#008c43] font-bold hover:underline"
                    >
                      Browse all →
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    {similarMaterials.slice(0, 2).map(item => (
                      <div key={item.id} onClick={onClose}>
                        <MiniCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer / close */}
            <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/80">
              <button
                onClick={onClose}
                style={{ cursor: "pointer" }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-gray-600 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                Close — back to material
              </button>
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
