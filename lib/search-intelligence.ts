/**
 * Intelligent search for the CBC marketplace.
 *
 * Handles:
 *  - Synonyms / local aliases  (maths → Mathematics, cre → Religious Education)
 *  - Abbreviations             (pe → Physical Education, sst → Social Studies)
 *  - Common misspellings       (mathmatics → Mathematics)
 *  - Subsequence abbreviations (mths → Mathematics)
 *  - Fuzzy Levenshtein match   (geograpy → Geography)
 *  - Partial / multi-token     (science notes → matches each token separately)
 */

/* ── Canonical CBC subject list ─────────────────────────── */
export const CBC_SUBJECTS = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Science",
  "Social Studies",
  "Agriculture",
  "Home Science",
  "Creative Arts",
  "ICT",
  "Physical Education",
  "Music",
  "Religious Education",
  "Business Studies",
  "Geography",
  "History",
] as const;

/* ── Subject synonyms → canonical name ──────────────────── */
const SUBJECT_SYNONYMS: Record<string, string> = {
  // Mathematics
  math: "Mathematics",
  maths: "Mathematics",
  mth: "Mathematics",
  mths: "Mathematics",
  mths: "Mathematics",
  mathmatics: "Mathematics",
  matematics: "Mathematics",
  mathematcs: "Mathematics",
  mathematic: "Mathematics",
  mathematics: "Mathematics",
  numeracy: "Mathematics",
  numbers: "Mathematics",
  arithmetic: "Mathematics",
  algebra: "Mathematics",
  geometry: "Mathematics",
  calculus: "Mathematics",
  statistics: "Mathematics",
  stats: "Mathematics",
  counting: "Mathematics",

  // English
  english: "English",
  eng: "English",
  "english language": "English",
  language: "English",
  literature: "English",
  composition: "English",
  grammar: "English",
  reading: "English",
  writing: "English",

  // Kiswahili
  kiswahili: "Kiswahili",
  swahili: "Kiswahili",
  kisw: "Kiswahili",
  kswahili: "Kiswahili",
  kiswah: "Kiswahili",
  lugha: "Kiswahili",
  insha: "Kiswahili",

  // Science
  science: "Science",
  sci: "Science",
  biology: "Science",
  bio: "Science",
  chemistry: "Science",
  chem: "Science",
  physics: "Science",
  phy: "Science",
  "science and technology": "Science",
  "integrated science": "Science",
  environment: "Science",
  environ: "Science",

  // Social Studies
  "social studies": "Social Studies",
  social: "Social Studies",
  sst: "Social Studies",
  ss: "Social Studies",
  sociology: "Social Studies",
  civics: "Social Studies",
  "social science": "Social Studies",
  society: "Social Studies",
  community: "Social Studies",

  // Agriculture
  agriculture: "Agriculture",
  agri: "Agriculture",
  agric: "Agriculture",
  farming: "Agriculture",
  crops: "Agriculture",
  livestock: "Agriculture",

  // Home Science
  "home science": "Home Science",
  "home economics": "Home Science",
  homemaking: "Home Science",
  cooking: "Home Science",
  nutrition: "Home Science",
  hs: "Home Science",

  // Creative Arts
  "creative arts": "Creative Arts",
  art: "Creative Arts",
  arts: "Creative Arts",
  drawing: "Creative Arts",
  painting: "Creative Arts",
  craft: "Creative Arts",
  crafts: "Creative Arts",
  drama: "Creative Arts",
  theatre: "Creative Arts",

  // ICT
  ict: "ICT",
  computer: "ICT",
  computers: "ICT",
  computing: "ICT",
  "information technology": "ICT",
  "computer studies": "ICT",
  it: "ICT",
  tech: "ICT",
  coding: "ICT",
  programming: "ICT",
  internet: "ICT",

  // Physical Education
  "physical education": "Physical Education",
  pe: "Physical Education",
  sports: "Physical Education",
  sport: "Physical Education",
  games: "Physical Education",
  fitness: "Physical Education",
  athletics: "Physical Education",
  exercise: "Physical Education",

  // Music
  music: "Music",
  singing: "Music",
  songs: "Music",
  choir: "Music",
  instruments: "Music",

  // Religious Education
  "religious education": "Religious Education",
  religion: "Religious Education",
  cre: "Religious Education",
  ire: "Religious Education",
  "christian religious education": "Religious Education",
  "islamic religious education": "Religious Education",
  christian: "Religious Education",
  islamic: "Religious Education",
  re: "Religious Education",
  bible: "Religious Education",
  quran: "Religious Education",

  // Business Studies
  "business studies": "Business Studies",
  business: "Business Studies",
  commerce: "Business Studies",
  entrepreneurship: "Business Studies",
  "business education": "Business Studies",
  enterprise: "Business Studies",
  accounting: "Business Studies",
  economics: "Business Studies",
  finance: "Business Studies",

  // Geography
  geography: "Geography",
  geo: "Geography",
  maps: "Geography",
  geog: "Geography",

  // History
  history: "History",
  hist: "History",
  heritage: "History",
  culture: "History",
};

/* ── Helpers ─────────────────────────────────────────────── */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Levenshtein edit distance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(row[j - 1], row[j], prev);
      row[j - 1] = prev;
      prev = val;
    }
    row[n] = prev;
  }
  return row[n];
}

/** Check if every character of `short` appears in order in `long` */
function isSubsequence(short: string, long: string): boolean {
  let si = 0;
  for (let li = 0; li < long.length && si < short.length; li++) {
    if (short[si] === long[li]) si++;
  }
  return si === short.length;
}

/* ── Public types ────────────────────────────────────────── */

export type SearchablePdf = {
  title: string;
  description: string;
  subject: string;
  grade: string;
  materialType: string;
  teacher: { name?: string | null; email: string };
};

export type SearchSuggestion = {
  /** synonym = exact alias match; fuzzy = approximate match */
  type: "synonym" | "fuzzy";
  originalQuery: string;
  expandedTerm: string;
  /** Human-readable label, e.g. 'Showing results for "Mathematics"' */
  label: string;
};

export type SmartSearchResult<T extends SearchablePdf> = {
  items: T[];
  suggestion: SearchSuggestion | null;
  /** Populated when items is empty — top subjects with result counts */
  relatedSubjects: Array<{ subject: string; count: number }>;
};

/* ── Core matching ───────────────────────────────────────── */

function matchesDirect<T extends SearchablePdf>(pdf: T, q: string): boolean {
  return (
    normalize(pdf.title).includes(q) ||
    normalize(pdf.description).includes(q) ||
    normalize(pdf.subject).includes(q) ||
    normalize(pdf.grade).includes(q) ||
    normalize(pdf.teacher.email).includes(q) ||
    normalize(pdf.teacher.name ?? "").includes(q)
  );
}

function subjectResults<T extends SearchablePdf>(
  items: T[],
  subject: string
): T[] {
  const s = normalize(subject);
  return items.filter(
    (p) =>
      normalize(p.subject).includes(s) ||
      normalize(p.title).includes(s) ||
      normalize(p.description).includes(s)
  );
}

/* ── Main exported function ──────────────────────────────── */

export function smartSearch<T extends SearchablePdf>(
  query: string,
  allItems: T[]
): SmartSearchResult<T> {
  const raw = query.trim();
  if (!raw) return { items: allItems, suggestion: null, relatedSubjects: [] };

  const q = normalize(raw);

  /* Step 1 — direct contains (exact spelling) */
  const direct = allItems.filter((p) => matchesDirect(p, q));
  if (direct.length > 0) return { items: direct, suggestion: null, relatedSubjects: [] };

  /* Step 2 — full-phrase synonym lookup */
  const fullSynonym = SUBJECT_SYNONYMS[q];
  if (fullSynonym) {
    const results = subjectResults(allItems, fullSynonym);
    if (results.length > 0) {
      return {
        items: results,
        suggestion: {
          type: "synonym",
          originalQuery: raw,
          expandedTerm: fullSynonym,
          label: `Showing results for "${fullSynonym}"`,
        },
        relatedSubjects: [],
      };
    }
  }

  /* Step 3 — token-level synonym (each word in the query) */
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  for (const token of tokens) {
    const syn = SUBJECT_SYNONYMS[token];
    if (syn) {
      const results = subjectResults(allItems, syn);
      if (results.length > 0) {
        return {
          items: results,
          suggestion: {
            type: "synonym",
            originalQuery: raw,
            expandedTerm: syn,
            label: `Showing results for "${syn}"`,
          },
          relatedSubjects: [],
        };
      }
    }
  }

  /* Step 4 — fuzzy match against canonical subject names
     Uses both Levenshtein on the full query and per-word,
     plus a subsequence check for abbreviations like "mths" */
  const fuzzyThreshold = Math.max(2, Math.floor(q.length / 3));
  let bestSubject = "";
  let bestScore = Infinity;

  for (const subject of CBC_SUBJECTS) {
    const sNorm = normalize(subject);

    // Full levenshtein
    const fullDist = levenshtein(q, sNorm);
    if (fullDist < bestScore) { bestScore = fullDist; bestSubject = subject; }

    // Word-level levenshtein (e.g., "geograpy" vs "geography")
    for (const word of sNorm.split(/\s+/)) {
      const wordDist = levenshtein(q, word);
      if (wordDist < bestScore) { bestScore = wordDist; bestSubject = subject; }
    }

    // Subsequence (e.g., "mths" in "mathematics")
    if (q.length >= 3 && isSubsequence(q, sNorm)) {
      // Score based on how sparse the subsequence is
      const subseqScore = (sNorm.length - q.length) * 0.4;
      if (subseqScore < bestScore) { bestScore = subseqScore; bestSubject = subject; }
    }

    // Prefix match (e.g., "math" → "mathematics")
    if (sNorm.startsWith(q) || q.startsWith(sNorm.split(" ")[0])) {
      const prefixScore = Math.abs(sNorm.length - q.length) * 0.3;
      if (prefixScore < bestScore) { bestScore = prefixScore; bestSubject = subject; }
    }
  }

  if (bestSubject && bestScore <= fuzzyThreshold) {
    const results = subjectResults(allItems, bestSubject);
    if (results.length > 0) {
      return {
        items: results,
        suggestion: {
          type: "fuzzy",
          originalQuery: raw,
          expandedTerm: bestSubject,
          label: `Did you mean "${bestSubject}"?`,
        },
        relatedSubjects: [],
      };
    }
  }

  /* Step 5 — partial multi-token (any token matches) */
  if (tokens.length > 1) {
    const partial = allItems.filter((p) => tokens.some((t) => matchesDirect(p, t)));
    if (partial.length > 0) {
      return {
        items: partial,
        suggestion: {
          type: "fuzzy",
          originalQuery: raw,
          expandedTerm: tokens.join(" "),
          label: `Partial match for "${raw}"`,
        },
        relatedSubjects: [],
      };
    }
  }

  /* Step 6 — no results: build related-subject suggestions */
  const counts = new Map<string, number>();
  for (const item of allItems) {
    counts.set(item.subject, (counts.get(item.subject) ?? 0) + 1);
  }
  const relatedSubjects = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([subject, count]) => ({ subject, count }));

  return { items: [], suggestion: null, relatedSubjects };
}
