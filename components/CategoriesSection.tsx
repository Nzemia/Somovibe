import Link from "next/link";
import { prisma } from "@/lib/prisma";

/* ── Subject → icon & color mapping ─────────────────────── */
interface CategoryMeta {
  color: string;
  icon: React.ReactNode;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  mathematics: {
    color: "from-[#008c43] to-[#00b856]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.6 4.5 4.574v9.176a2.25 2.25 0 0 0 2.25 2.25h.75v2.25c0 .621.504 1.125 1.125 1.125H12M12 2.25c1.892 0 3.758.11 5.593.322C18.693 2.7 19.5 3.6 19.5 4.574v9.176a2.25 2.25 0 0 1-2.25 2.25h-.75v2.25c0 .621-.504 1.125-1.125 1.125H12m0-3.375v3.375" />
      </svg>
    ),
  },
  english: {
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  science: {
    color: "from-[#004d25] to-[#006832]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L4.2 14.007m15.6 1.293-.413 2.056a2.25 2.25 0 0 1-1.991 1.818l-3.291.374a42.493 42.493 0 0 1-9.61 0l-3.291-.374a2.25 2.25 0 0 1-1.991-1.818L2.4 14.3" />
      </svg>
    ),
  },
  kiswahili: {
    color: "from-[#008c43] to-[#00a854]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
      </svg>
    ),
  },
  "social studies": {
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  worksheets: {
    color: "from-[#004d25] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  "creative arts": {
    color: "from-[#008c43] to-[#00c462]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
  },
  ict: {
    color: "from-[#006832] to-[#00a854]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 7.409a2.25 2.25 0 0 1-1.07-1.916V5.25" />
      </svg>
    ),
  },
  "physical education": {
    color: "from-[#004d25] to-[#006832]",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    ),
  },
};

const DEFAULT_META: CategoryMeta = {
  color: "from-[#008c43] to-[#006832]",
  icon: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
};

/* ── Guaranteed fallback categories ─────────────────────── */
const FALLBACK_SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Kiswahili",
  "Social Studies",
  "Creative Arts",
  "ICT",
  "Worksheets",
];

function getMeta(subject: string): CategoryMeta {
  return CATEGORY_META[subject.toLowerCase()] ?? DEFAULT_META;
}

/* ── Server component ───────────────────────────────────── */
export async function CategoriesSection() {
  let subjects: string[] = [];

  try {
    const rows = await prisma.pdf.findMany({
      where: { status: "APPROVED" },
      select: { subject: true },
      distinct: ["subject"],
      orderBy: { subject: "asc" },
    });
    subjects = rows.map((r) => r.subject).filter(Boolean);
  } catch {
    // DB unavailable — fall back silently
  }

  // Merge DB subjects with fallbacks, deduplicated, title-cased
  const dbSet = new Set(subjects.map((s) => s.toLowerCase()));
  const merged = [
    ...subjects,
    ...FALLBACK_SUBJECTS.filter((f) => !dbSet.has(f.toLowerCase())),
  ];

  return (
    <section
      id="categories"
      className="bg-[#f0faf5] py-14 sm:py-20 scroll-mt-[7.5rem]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-white text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
            Browse by Category
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            What Are You Looking For?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            Pick a subject to instantly browse all available CBC materials in
            the marketplace.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {merged.map((subject) => {
            const meta = getMeta(subject);
            return (
              <Link
                key={subject}
                href={`/marketplace?subject=${encodeURIComponent(subject)}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-[#d1e8dc] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 flex flex-col items-center text-center gap-3"
              >
                {/* Icon circle */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {meta.icon}
                </div>

                <span className="font-bold text-gray-800 text-sm sm:text-base leading-snug">
                  {subject}
                </span>

                <span className="text-[#008c43] text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Browse
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>

                {/* Subtle green corner accent */}
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className={`absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br ${meta.color} opacity-20 rotate-45`} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all */}
        <div className="mt-10 text-center">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors shadow-md text-sm sm:text-base"
          >
            View All Materials
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
