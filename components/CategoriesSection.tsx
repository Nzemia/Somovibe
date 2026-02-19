import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface CategoryMeta {
  color: string;
  icon: React.ReactNode;
}

/* ── Context-specific icons per subject ─────────────────── */
const CATEGORY_META: Record<string, CategoryMeta> = {

  mathematics: {
    color: "from-[#008c43] to-[#00b856]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Abacus-style calculator */}
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
        <path d="M9 9h.01M12 9h.01M15 9h.01M9 12h.01M15 12h.01M9 15h6" strokeLinecap="round" />
        <path d="M7 3v18" strokeLinecap="round" />
      </svg>
    ),
  },

  english: {
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Open book with letter A */}
        <path d="M12 21V6M12 6C10 4 6 3 3 4v14c3-1 6 0 9 3M12 6c2-2 6-3 9-2v14c-3-1-6 0-9 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9l1.5 4M7.5 13l1.5-4M7.5 13h3M9 11h2" strokeLinecap="round" />
      </svg>
    ),
  },

  science: {
    color: "from-[#004d25] to-[#006832]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Conical flask / beaker */}
        <path d="M9 3h6M9 3v6l-5 9a1 1 0 00.9 1.5h14.2A1 1 0 0020 18l-5-9V3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 15h9" strokeLinecap="round" />
        <circle cx="10" cy="17" r="0.5" fill="currentColor" />
        <circle cx="14" cy="16" r="0.5" fill="currentColor" />
      </svg>
    ),
  },

  kiswahili: {
    color: "from-[#008c43] to-[#00a854]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Speech bubble with KE flag colours stripe suggestion */}
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10h8M8 13h5" strokeLinecap="round" />
      </svg>
    ),
  },

  "social studies": {
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Globe with latitude/longitude lines */}
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        <path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9M3 12h18" strokeLinecap="round" />
      </svg>
    ),
  },

  worksheets: {
    color: "from-[#004d25] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Checklist / worksheet */}
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4M9 16h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  agriculture: {
    color: "from-[#3d6b1a] to-[#5a9e25]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Hoe / farming tool */}
        <path d="M3 21l7-7" strokeLinecap="round" />
        <path d="M10 14L17 4" strokeLinecap="round" />
        <path d="M14 3h6v5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 3l-6 6" strokeLinecap="round" />
      </svg>
    ),
  },

  "home science": {
    color: "from-[#a35c00] to-[#d47a00]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Fork and knife — utensils */}
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 2v20" strokeLinecap="round" />
        <path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  "creative arts": {
    color: "from-[#008c43] to-[#00c462]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Artist palette */}
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29C4.42 19.04 7.97 21 12 21c1.65 0 3-.89 3-2.43 0-.65-.22-1.24-.6-1.72-.38-.47-.6-1.06-.6-1.68 0-1.55 1.34-2.81 3-2.81h2c2.21 0 4-1.79 4-4C24 6.71 18.52 2 12 2z" strokeLinecap="round" />
        <circle cx="6.5" cy="11.5" r="1" fill="currentColor" />
        <circle cx="9.5" cy="7.5" r="1" fill="currentColor" />
        <circle cx="14.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },

  ict: {
    color: "from-[#006832] to-[#00a854]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Laptop / computer */}
        <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v9H4V5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 18h20M8 14v4M16 14v4" strokeLinecap="round" />
      </svg>
    ),
  },

  "physical education": {
    color: "from-[#004d25] to-[#006832]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Running figure */}
        <circle cx="13" cy="4" r="1.5" fill="currentColor" />
        <path d="M7 21l3-6 2 3 3-5 3 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2-3 3 1 2-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  music: {
    color: "from-[#5b008c] to-[#8c00d4]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Musical note */}
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },

  "religious education": {
    color: "from-[#8c6400] to-[#c49000]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Praying hands */}
        <path d="M12 2v20M8 6C6 8 5 11 5 13v5h6V10L8 6zM16 6c2 2 3 5 3 7v5h-6V10l3-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },

  "business studies": {
    color: "from-[#005a8c] to-[#007ab8]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Briefcase */}
        <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M12 12v.01" strokeLinecap="round" />
        <path d="M2 12h20" strokeLinecap="round" />
      </svg>
    ),
  },

  geography: {
    color: "from-[#006832] to-[#008c43]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Compass */}
        <circle cx="12" cy="12" r="9" />
        <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },

  history: {
    color: "from-[#8c3d00] to-[#c45500]",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        {/* Hourglass */}
        <path d="M5 3h14M5 21h14M7 3l4 6 4-6M7 21l4-6 4 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12h6" strokeLinecap="round" />
      </svg>
    ),
  },
};

const DEFAULT_META: CategoryMeta = {
  color: "from-[#008c43] to-[#006832]",
  icon: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
};

const FALLBACK_SUBJECTS = [
  "Mathematics", "English", "Science", "Kiswahili",
  "Social Studies", "Agriculture", "Home Science",
  "Creative Arts", "ICT", "Worksheets",
];

function getMeta(subject: string): CategoryMeta {
  return CATEGORY_META[subject.toLowerCase()] ?? DEFAULT_META;
}

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
    // DB unavailable — silent fallback
  }

  const dbSet = new Set(subjects.map((s) => s.toLowerCase()));
  const merged = [
    ...subjects,
    ...FALLBACK_SUBJECTS.filter((f) => !dbSet.has(f.toLowerCase())),
  ];

  return (
    <section id="categories" className="bg-[#f0faf5] py-14 sm:py-20 scroll-mt-[7.5rem]">
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
            Pick a subject to instantly browse all available CBC materials.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {merged.map((subject) => {
            const meta = getMeta(subject);
            return (
              <Link
                key={subject}
                href={`/marketplace?subject=${encodeURIComponent(subject)}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-[#d1e8dc] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col items-center text-center gap-3"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {meta.icon}
                </div>

                <span className="font-bold text-gray-800 text-sm leading-snug">
                  {subject}
                </span>

                <span className="text-[#008c43] text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Browse
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>

                <div className="absolute top-0 right-0 w-10 h-10 overflow-hidden pointer-events-none">
                  <div className={`absolute -top-5 -right-5 w-10 h-10 bg-gradient-to-br ${meta.color} opacity-15 rotate-45`} />
                </div>
              </Link>
            );
          })}
        </div>

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
