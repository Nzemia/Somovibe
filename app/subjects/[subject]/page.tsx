import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { CBC_SUBJECTS } from "@/lib/search-intelligence";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ subject: string }>;
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function getCanonicalSubject(slug: string) {
  return CBC_SUBJECTS.find((s) => slugify(s) === slug) || null;
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const subjectName = getCanonicalSubject(resolvedParams.subject);
  
  if (!subjectName) {
    return { title: "Subject Not Found" };
  }

  return {
    title: {
      absolute: `Buy CBC ${subjectName} Notes Kenya | Somovibe`
    },
    description: `Get the best CBC ${subjectName} notes, past papers, and learning materials in Kenya. Access premium resources created by verified teachers.`,
    keywords: [`CBC ${subjectName} notes`, `buy ${subjectName} CBC materials`, `Kenya CBC ${subjectName}`],
    alternates: {
      canonical: `https://somovibe.com/subjects/${resolvedParams.subject}`,
    },
    openGraph: {
      title: `Buy CBC ${subjectName} Notes Kenya | Somovibe`,
      description: `Get the best CBC ${subjectName} notes, past papers, and learning materials in Kenya.`,
      url: `https://somovibe.com/subjects/${resolvedParams.subject}`,
      type: "website",
    },
  };
}

export default async function SubjectPage({ params }: Props) {
  const resolvedParams = await params;
  const subjectName = getCanonicalSubject(resolvedParams.subject);
  
  if (!subjectName) {
    notFound();
  }

  const user = await getCurrentUser();

  return (
    <>
      <Navbar user={user ? { email: user.email, role: user.role } : null} />
      <main className="min-h-screen bg-[#f5faf7] pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[#f0faf5] text-[#008c43] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-[#d1e8dc] mb-4">
            CBC Subject Materials
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Buy Quality CBC {subjectName} Notes & Past Papers
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse our comprehensive collection of {subjectName} learning materials aligned with the Kenya CBC curriculum. Empower your learning with notes crafted by verified teachers.
          </p>
          
          <Link
            href={`/marketplace?subject=${encodeURIComponent(subjectName)}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#008c43] text-white font-bold rounded-xl hover:bg-[#006832] transition-colors shadow-lg hover:shadow-xl text-lg"
          >
            View {subjectName} Materials
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
